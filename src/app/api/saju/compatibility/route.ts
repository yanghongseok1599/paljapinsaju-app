import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { analyzeSaju } from '@/lib/saju/calculator';
import { generateCompatibility } from '@/lib/saju/ai/analyzer';
import { checkRateLimit } from '@/lib/rate-limit';
import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  Gender,
} from '@/types/saju';

export async function POST(req: NextRequest) {
  // 생성 중 실패하면 결제 상태로 되돌려 다시 시도할 수 있게 한다 (결제는 이미 끝났다)
  let generatingId: string | null = null;
  try {
    const body = await req.json();
    const { compatibilityId } = body;

    if (!compatibilityId) {
      return NextResponse.json(
        { error: 'compatibilityId is required' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Auth check — must be logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 req/min per user (in-memory; TODO: migrate to Upstash Redis for multi-instance Vercel)
    const rl = checkRateLimit(`compatibility:${user.id}`, 10, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 궁합 레코드 조회
    const { data: compat, error: compatError } = await supabase
      .from('saju_compatibilities')
      .select('*')
      .eq('id', compatibilityId)
      .single();

    if (compatError || !compat) {
      return NextResponse.json(
        { error: 'Compatibility record not found' },
        { status: 404 },
      );
    }

    // 결제 확인 ('failed' 는 예전 버전에서 생성에 실패한 결제 건 — 다시 시도를 허용한다)
    if (compat.status !== 'paid' && compat.status !== 'failed') {
      return NextResponse.json(
        { error: 'Payment required. Current status: ' + compat.status },
        { status: 403 },
      );
    }

    // 본인 사주 reading 조회
    const { data: reading, error: readError } = await supabase
      .from('saju_readings')
      .select('*')
      .eq('id', compat.reading_id)
      .single();

    if (readError || !reading) {
      return NextResponse.json(
        { error: 'Original reading not found' },
        { status: 404 },
      );
    }

    // Ownership check — the underlying reading must belong to the authenticated user
    if (reading.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 상태·분석 결과 칸은 서버(service_role)만 쓸 수 있다. 소유권은 위에서 확인했다.
    const admin = createAdminClient();
    await admin
      .from('saju_compatibilities')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', compatibilityId);
    generatingId = compatibilityId;

    // 상대방 사주 계산
    const partnerSaju = analyzeSaju({
      year: compat.partner_birth_year,
      month: compat.partner_birth_month,
      day: compat.partner_birth_day,
      hour: compat.partner_birth_hour ?? undefined,
      minute: compat.partner_birth_minute,
      isLunar: compat.partner_is_lunar,
      isLeapMonth: compat.partner_is_leap_month,
    });

    // 본인 사주 데이터
    if (!reading.four_pillars || !reading.five_elements) {
      return NextResponse.json(
        { error: 'Original saju data not found. Run preview first.' },
        { status: 400 },
      );
    }

    // AI 궁합 분석 생성
    const analysis = await generateCompatibility({
      person1: {
        name: reading.name,
        gender: reading.gender as Gender,
        pillars: reading.four_pillars as unknown as FourPillarsDetail,
        elements: reading.five_elements as FiveElementDistribution,
      },
      person2: {
        name: compat.partner_name,
        gender: compat.partner_gender as Gender,
        pillars: partnerSaju.pillars,
        elements: partnerSaju.elements,
      },
    });

    // DB 업데이트
    const { error: updateError } = await admin
      .from('saju_compatibilities')
      .update({
        partner_four_pillars: partnerSaju.pillars.toObject(),
        partner_five_elements: partnerSaju.elements,
        analysis: analysis as unknown as Record<string, unknown>,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', compatibilityId);

    if (updateError) {
      await admin
        .from('saju_compatibilities')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', compatibilityId);

      return NextResponse.json(
        { error: 'Failed to save compatibility analysis' },
        { status: 500 },
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('[saju/compatibility] Error:', error);

    // 실패 시 결제 상태로 되돌린다 (본문은 이미 읽었으므로 다시 읽지 않는다)
    try {
      if (generatingId) {
        await createAdminClient()
          .from('saju_compatibilities')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', generatingId);
      }
    } catch {
      // ignore cleanup error
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
