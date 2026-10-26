import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * 별 차감.
 *
 * ⚠️ 차감량은 **서버가 정한다**. 예전에는 클라이언트가 보낸 amount를 그대로 썼는데,
 * 그러면 요청을 조작해 리포트(10별)를 1별만 내고 받을 수 있었다.
 * 이제 작업 종류(type)만 받고 금액은 아래 표에서 꺼낸다.
 */
const STAR_COST: Record<string, number> = {
  report: 10, // PDF 리포트
};

export async function POST(req: NextRequest) {
  let body: { type?: unknown; readingId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { type, readingId } = body;

  if (typeof type !== 'string' || !(type in STAR_COST)) {
    return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
  }

  const amount = STAR_COST[type];

  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 참조로 넘어온 reading이 정말 이 사용자 것인지 확인한다.
  // (남의 분석 id를 거래 이력에 남기지 못하게)
  let verifiedReadingId: string | null = null;
  if (typeof readingId === 'string' && readingId.length > 0) {
    const { data: owned } = await supabase
      .from('saju_readings')
      .select('id, status')
      .eq('id', readingId)
      .eq('user_id', user.id)
      .single();
    verifiedReadingId = owned ? readingId : null;

    // 이미 결제된 분석이면 두 번 차감하지 않는다
    if (owned && ['paid', 'generating', 'completed'].includes(owned.status)) {
      return NextResponse.json({ balance: null, deducted: 0 });
    }
  }

  // 별 함수와 결제 상태 칸은 서버(service_role)만 쓸 수 있다 (20261026000000_lock_paid_state.sql).
  // 위에서 로그인과 소유권을 확인했으므로 여기서부터 관리자 클라이언트를 쓴다.
  const admin = createAdminClient();

  // 잔액 확인·차감·사용 내역 기록이 한 번에 일어난다. null = 잔액 부족.
  const { data: newBalance, error } = await admin.rpc('atomic_deduct_stars', {
    p_user_id: user.id,
    p_amount: amount,
    p_type: type,
    p_reading_id: verifiedReadingId,
  });

  if (error || newBalance === null || newBalance === undefined) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
  }

  // 차감이 성공했을 때만 분석을 '결제됨'으로 올린다.
  // 상태 변경을 클라이언트에 맡기면 결제 없이 paid 로 바꿀 수 있다.
  if (verifiedReadingId) {
    await admin
      .from('saju_readings')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', verifiedReadingId)
      .eq('user_id', user.id);
  }

  return NextResponse.json({ balance: newBalance, deducted: amount });
}
