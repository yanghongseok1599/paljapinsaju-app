import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { readingId, status } = await req.json();

  if (!readingId || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // ⚠️ 결제·완료 상태는 클라이언트가 지정할 수 없다.
  // 예전에는 아무 status나 받아서, 로그인만 하면 결제 없이
  // 자기 분석을 'paid'/'completed' 로 바꿔 전체 결과를 열 수 있었다.
  // paid 는 별 차감 라우트가, completed 는 분석 생성 쪽이 직접 설정한다.
  const CLIENT_SETTABLE = ['pending', 'generating', 'failed'];
  if (!CLIENT_SETTABLE.includes(status)) {
    return NextResponse.json(
      { error: 'This status cannot be set by the client' },
      { status: 403 },
    );
  }

  const supabase = await createClient();

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('saju_readings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', readingId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
