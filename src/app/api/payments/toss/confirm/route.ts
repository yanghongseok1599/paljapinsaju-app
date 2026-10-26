/**
 * Toss 결제 승인 엔드포인트
 *
 * Toss 위젯이 결제 완료 후 이 URL로 리다이렉트합니다:
 *   /api/payments/toss/confirm?paymentKey=...&orderId=...&amount=...
 *
 * 흐름:
 *  1. 쿼리 파라미터 검증
 *  2. Toss API로 결제 승인 (confirmPayment)
 *  3. 로그인 유저 확인
 *  4. 스타 팩 조회 및 원자적 지급 (atomic_grant_stars)
 *  5. /[locale]/coin-shop/success 로 리다이렉트
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { confirmPayment } from '@/lib/toss/client';
import { getStarPackById } from '@/lib/toss/config';
import { sendNotification } from '@/lib/telegram/client';
import { paymentSuccessMessage, paymentFailureMessage } from '@/lib/telegram/templates';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amountStr = searchParams.get('amount');

  if (!paymentKey || !orderId || !amountStr) {
    return NextResponse.redirect(new URL('/ko/coin-shop?error=invalid_params', req.url));
  }

  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    return NextResponse.redirect(new URL('/ko/coin-shop?error=invalid_amount', req.url));
  }

  // orderId 형식: {packId}__{uuid}  예) star_30__550e8400-e29b-...
  const packId = orderId.split('__')[0];
  const pack = getStarPackById(packId);
  if (!pack) {
    return NextResponse.redirect(new URL('/ko/coin-shop?error=unknown_pack', req.url));
  }

  // 금액 검증 — 클라이언트에서 보낸 amount가 서버 정가와 일치하는지 확인
  if (amount !== pack.priceKrw) {
    console.error(`[Toss Confirm] 금액 불일치: client=${amount}, server=${pack.priceKrw}`);
    return NextResponse.redirect(new URL('/ko/coin-shop?error=amount_mismatch', req.url));
  }

  // 승인(실제 출금) 전에 받을 사람과 지급 수단부터 확인한다.
  // 예전엔 승인을 먼저 해서, 세션이 끊긴 채 돌아온 사용자는 돈만 빠지고 별을 못 받았다.
  // 승인하지 않은 결제는 토스에서 자동으로 취소된다.
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/ko/login?next=/coin-shop&error=session_expired', req.url));
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Toss Confirm] Supabase 서비스 키 미설정 — 승인하지 않음');
    return NextResponse.redirect(new URL('/ko/coin-shop?error=server_error', req.url));
  }

  try {
    // 1. Toss API 결제 승인
    const tossPayment = await confirmPayment(paymentKey, orderId, amount);
    if (tossPayment.status !== 'DONE') {
      console.error('[Toss Confirm] 결제 상태 비정상:', tossPayment.status);
      return NextResponse.redirect(new URL('/ko/coin-shop?error=payment_failed', req.url));
    }

    // 2. 서비스 롤로 스타 지급 — 같은 주문번호는 DB 가 한 번만 지급한다
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { error: rpcError } = await supabaseService.rpc('atomic_grant_stars', {
      p_user_id: user.id,
      p_amount: pack.stars,
      p_source: 'purchase',
      p_reference: orderId,
    });

    if (rpcError) {
      console.error('[Toss Confirm] atomic_grant_stars 실패:', rpcError);
      await sendNotification({
        text: paymentFailureMessage({ error: rpcError.message, orderId }),
      });
      return NextResponse.redirect(new URL('/ko/coin-shop?error=grant_failed', req.url));
    }

    // 3. Telegram 성공 알림
    await sendNotification({
      text: paymentSuccessMessage({
        amountKrw: tossPayment.totalAmount,
        starPack: pack.name,
        stars: pack.stars,
        orderId,
      }),
    });

    return NextResponse.redirect(new URL('/ko/coin-shop?paid=true', req.url));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Toss Confirm] 처리 중 오류:', msg);
    await sendNotification({
      text: paymentFailureMessage({ error: msg, orderId }),
    });
    return NextResponse.redirect(new URL('/ko/coin-shop?error=server_error', req.url));
  }
}
