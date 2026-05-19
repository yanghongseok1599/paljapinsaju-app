import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateFullAnalysis } from '@/lib/saju/ai/analyzer';
import { generateAdvancedSajuContext } from '@/lib/saju/advanced-analysis';
import { checkRateLimit } from '@/lib/rate-limit';
import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  Gender,
  ConcernType,
} from '@/types/saju';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { readingId } = body;

    if (!readingId) {
      return NextResponse.json(
        { error: 'readingId is required' },
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
    const rl = checkRateLimit(`analyze:${user.id}`, 10, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // reading 조회
    const { data: reading, error: readError } = await supabase
      .from('saju_readings')
      .select('*')
      .eq('id', readingId)
      .single();

    if (readError || !reading) {
      return NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 },
      );
    }

    // Ownership check — reading must belong to the authenticated user
    if (reading.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 결제 확인 — status + ownership (never trust status alone)
    if (reading.status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment required. Current status: ' + reading.status },
        { status: 403 },
      );
    }

    // status를 generating으로 변경
    const { error: statusError } = await supabase
      .from('saju_readings')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', readingId);

    if (statusError) {
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 },
      );
    }

    // 사주 데이터 확인
    if (!reading.four_pillars || !reading.five_elements) {
      return NextResponse.json(
        { error: 'Saju data not found. Run preview first.' },
        { status: 400 },
      );
    }

    const currentYear = new Date().getFullYear();

    // 자미두수 + 별자리 고급 분석 데이터 계산
    let advancedContext = '';
    try {
      advancedContext = await generateAdvancedSajuContext(
        reading.birth_year,
        reading.birth_month,
        reading.birth_day,
        reading.birth_hour,
        reading.gender as 'male' | 'female',
      );
    } catch {
      // 고급 분석 실패 시 기본 데이터만 사용
    }

    // AI 전체 분석 생성
    const analysis = await generateFullAnalysis({
      name: reading.name,
      gender: reading.gender as Gender,
      birthYear: reading.birth_year,
      birthMonth: reading.birth_month,
      birthDay: reading.birth_day,
      birthHour: reading.birth_hour,
      pillars: reading.four_pillars as unknown as FourPillarsDetail,
      elements: reading.five_elements as FiveElementDistribution,
      concerns: (reading.concerns ?? []) as ConcernType[],
      currentYear,
      advancedContext,
    });

    // DB 업데이트: 분석 결과 저장
    const { error: updateError } = await supabase
      .from('saju_readings')
      .update({
        full_analysis: analysis as unknown as Record<string, unknown>,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', readingId);

    if (updateError) {
      // 실패 시 status를 failed로
      await supabase
        .from('saju_readings')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', readingId);

      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 },
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('[saju/analyze] Error:', error);

    // AI 생성 실패 시 status를 failed로 복구
    try {
      const body = await req.clone().json();
      if (body.readingId) {
        const supabase = await createClient();
        await supabase
          .from('saju_readings')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', body.readingId);
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
