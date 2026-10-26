import { generateText } from "ai";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAnalysisModel } from "@/lib/ai/model";
import { checkRateLimit } from "@/lib/rate-limit";
import { stripMarkdown } from "@/lib/saju/sanitize";
import { NextResponse } from "next/server";

const ZODIAC_COST = 3;

const VALID_SIGN_IDS = new Set([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);

const SIGN_NAMES: Record<string, string> = {
  aries: "양자리 (Aries, 03.21-04.19)",
  taurus: "황소자리 (Taurus, 04.20-05.20)",
  gemini: "쌍둥이자리 (Gemini, 05.21-06.21)",
  cancer: "게자리 (Cancer, 06.22-07.22)",
  leo: "사자자리 (Leo, 07.23-08.22)",
  virgo: "처녀자리 (Virgo, 08.23-09.22)",
  libra: "천칭자리 (Libra, 09.23-10.23)",
  scorpio: "전갈자리 (Scorpio, 10.24-11.21)",
  sagittarius: "사수자리 (Sagittarius, 11.22-12.21)",
  capricorn: "염소자리 (Capricorn, 12.22-01.19)",
  aquarius: "물병자리 (Aquarius, 01.20-02.18)",
  pisces: "물고기자리 (Pisces, 02.19-03.20)",
};

export async function POST(req: Request): Promise<NextResponse> {
  // 1. Parse & validate body
  let signId: string;
  try {
    const body = (await req.json()) as { signId?: unknown };
    signId = String(body.signId ?? "").toLowerCase();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!VALID_SIGN_IDS.has(signId)) {
    return NextResponse.json({ error: "invalid_sign_id" }, { status: 400 });
  }

  // 2. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

  // 3. Rate limit (admins exempt)
  if (!isAdmin) {
    const rl = checkRateLimit(`zodiac:${user.id}`, 10, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  // 4. Star gating
  // 별 함수는 서버(service_role)만 실행할 수 있다. 차감과 사용 내역 기록이 한 번에 일어난다.
  const admin = createAdminClient();
  if (!isAdmin) {
    const { data: newBalance, error: deductError } = await admin.rpc(
      "atomic_deduct_stars",
      { p_user_id: user.id, p_amount: ZODIAC_COST, p_type: "zodiac_reading" }
    );

    if (deductError || newBalance === null || newBalance === undefined) {
      return NextResponse.json({ error: "insufficient_stars" }, { status: 402 });
    }
  }

  // 5. Generate AI reading
  const today = new Date();
  const monthStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;
  const signName = SIGN_NAMES[signId];

  const systemPrompt = `당신은 따뜻하고 통찰력 있는 서양 점성술 전문가입니다.
한국어로 친근한 존댓말(해요체)을 사용하여 월간 별자리 운세를 작성합니다.
분석은 구체적이고 실용적이어야 하며, 공포감이나 불안을 조성하지 않습니다.
총 500~700자 분량으로 작성하세요.
마크다운 금지: **, __, *, _, #, \`\`\`, --- 등 어떤 마크다운 마커도 절대 사용하지 마세요. 강조나 구분은 한국어 표현과 줄바꿈으로만 표현하세요.`;

  const userPrompt = `${signName}의 ${monthStr} 월간 운세를 작성해 주세요.

다음 네 가지 영역을 각각 2~3문장씩 다루고, 마지막에 이달의 핵심 조언을 한 문장으로 마무리해 주세요:
1. 전체 흐름: 이달의 전반적인 에너지와 행성의 영향
2. 연애운: 감정과 인간관계의 흐름
3. 재물운: 재정과 커리어 방향
4. 건강운: 컨디션 관리와 주의사항
5. 이달의 조언: 한 줄 핵심 메시지

존댓말(해요체)을 사용하고, 구체적인 행동 팁을 포함해 주세요.`;

  let reading: string;
  try {
    const result = await generateText({
      model: getAnalysisModel(),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 1200,
    });
    reading = stripMarkdown(result.text.trim());
  } catch {
    // 생성에 실패하면 차감한 별을 돌려준다
    if (!isAdmin) {
      await admin.rpc("atomic_grant_stars", {
        p_user_id: user.id,
        p_amount: ZODIAC_COST,
        p_source: "refund",
        p_reference: "zodiac_reading_failed",
      });
    }
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }

  return NextResponse.json({ reading });
}
