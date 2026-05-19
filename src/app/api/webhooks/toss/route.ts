/**
 * Toss Payments 웹훅 핸들러
 *
 * 보안 요건 (src/app/api/webhooks/_TOSS_SECURITY_REQUIREMENTS.md 참조):
 *  1. HMAC 서명 검증 — crypto.timingSafeEqual 사용
 *  2. 이벤트 멱등성 — webhook_events(provider, event_id) UNIQUE 삽입
 *  3. 재생 공격 차단 — 이벤트 타임스탬프 5분 초과 거부
 *  4. 서버사이드 검증 — Toss API로 재조회, 웹훅 본문만 신뢰 금지
 *  5. 원자적 스타 지급 — atomic_grant_stars RPC 사용
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyTossWebhookSignature, type TossWebhookPayload } from '@/lib/toss/webhook';
import { getPayment } from '@/lib/toss/client';
import { getStarPackById } from '@/lib/toss/config';
import { sendNotification } from '@/lib/telegram/client';
import { paymentSuccessMessage, paymentFailureMessage } from '@/lib/telegram/templates';

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

// 서비스 롤 클라이언트 — RLS를 우회하여 webhook_events 삽입 및 RPC 호출
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
  return createClient(url, key);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Raw body 읽기 (서명 검증에 사용)
  const rawBody = await req.text();

  // 2. 서명 검증
  const signature = req.headers.get('Toss-Signature') ?? '';
  if (!verifyTossWebhookSignature(rawBody, signature)) {
    console.error('[Toss Webhook] 서명 검증 실패');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3. 페이로드 파싱
  let payload: TossWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as TossWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 결제 상태 변경 이벤트만 처리
  if (payload.eventType !== 'PAYMENT_STATUS_CHANGED') {
    return NextResponse.json({ received: true });
  }

  const { paymentKey, orderId, status } = payload.data;

  // 4. 재생 공격 차단 — 이벤트 생성 시각 5분 초과 거부
  const eventTime = new Date(payload.createdAt);
  if (isNaN(eventTime.getTime()) || Date.now() - eventTime.getTime() > REPLAY_WINDOW_MS) {
    console.error('[Toss Webhook] 재생 공격 거부: 오래된 이벤트', payload.createdAt);
    return NextResponse.json({ error: 'Stale event' }, { status: 400 });
  }

  // DONE 상태만 스타 지급 처리
  if (status !== 'DONE') {
    return NextResponse.json({ received: true });
  }

  const supabase = getServiceClient();

  // 5. 멱등성 체크 — 이미 처리된 이벤트는 200으로 즉시 반환
  const { error: insertError } = await supabase
    .from('webhook_events')
    .insert({ provider: 'toss', event_id: orderId });

  if (insertError) {
    if (insertError.code === '23505') {
      // UNIQUE 제약 위반 → 이미 처리됨
      console.log('[Toss Webhook] 중복 이벤트 스킵:', orderId);
      return NextResponse.json({ received: true });
    }
    console.error('[Toss Webhook] webhook_events 삽입 실패:', insertError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  try {
    // 6. 서버사이드 결제 재조회 (웹훅 본문 단독 신뢰 금지)
    const tossPayment = await getPayment(paymentKey);
    if (tossPayment.status !== 'DONE') {
      console.warn('[Toss Webhook] 결제 상태 불일치:', tossPayment.status);
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    // 7. 메타데이터에서 userId, packId 추출
    const userId = tossPayment.metadata?.userId;
    const packId = tossPayment.metadata?.packId;
    const userEmail = tossPayment.customerEmail ?? 'unknown';

    if (!userId || !packId) {
      console.error('[Toss Webhook] metadata에 userId 또는 packId 없음:', tossPayment.metadata);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const pack = getStarPackById(packId);
    if (!pack) {
      console.error('[Toss Webhook] 알 수 없는 packId:', packId);
      return NextResponse.json({ error: 'Unknown pack' }, { status: 400 });
    }

    // 8. 원자적 스타 지급
    const { error: rpcError } = await supabase.rpc('atomic_grant_stars', {
      p_user_id: userId,
      p_amount: pack.stars,
      p_source: 'purchase',
      p_reference: orderId,
    });

    if (rpcError) {
      console.error('[Toss Webhook] atomic_grant_stars 실패:', rpcError);
      // webhook_events에 행이 있으므로 재처리 방지됨 — 운영팀에 알림
      await sendNotification({
        text: paymentFailureMessage({
          error: rpcError.message,
          orderId,
        }),
      });
      return NextResponse.json({ error: 'Star grant failed' }, { status: 500 });
    }

    // 9. Telegram 성공 알림 (fire-and-forget)
    await sendNotification({
      text: paymentSuccessMessage({
        userEmail,
        amountKrw: tossPayment.totalAmount,
        starPack: pack.name,
        stars: pack.stars,
        orderId,
      }),
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Toss Webhook] 처리 중 오류:', msg);

    await sendNotification({
      text: paymentFailureMessage({ error: msg, orderId }),
    });

    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
