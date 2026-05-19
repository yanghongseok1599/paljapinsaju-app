import { NextRequest, NextResponse } from 'next/server';
import { generateText } from "ai";
import { createClient } from "@/utils/supabase/server";
import { getChatModel } from "@/lib/ai/model";
import { checkRateLimit } from "@/lib/rate-limit";

// Allowlist of valid character IDs — keep in sync with src/lib/saju/characters.ts CharacterType
const VALID_CHARACTER_IDS = new Set([
  "charon_m",
  "charon_f",
  "minjun",
  "haeun",
  "jian",
  "seojun",
  "doyun",
]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth check — must be logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 10 req/min per user (in-memory; TODO: migrate to Upstash Redis for multi-instance Vercel)
  const rl = checkRateLimit(`suggestions:${user.id}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { characterId, characterName, lastAssistantMessage } =
    (await req.json()) as {
      characterId: string;
      characterName: string;
      lastAssistantMessage: string;
    };

  // Input validation and caps
  if (!VALID_CHARACTER_IDS.has(characterId)) {
    return NextResponse.json({ error: 'Invalid characterId' }, { status: 400 });
  }

  // Cap characterName to 30 chars max
  const safeName = typeof characterName === 'string'
    ? characterName.slice(0, 30)
    : '';

  // Cap lastAssistantMessage to 500 chars (already sliced below, but enforce here too)
  const safeMessage = typeof lastAssistantMessage === 'string'
    ? lastAssistantMessage.slice(-500)
    : '';

  const { text } = await generateText({
    model: getChatModel(),
    system: `너는 사주 상담 서비스의 추천 질문 생성기야.
사용자가 "${safeName}" 캐릭터에게 다음에 물어볼 만한 후속 질문 3개를 만들어.

## 필수 규칙
- 반드시 사용자 본인이 직접 물어보는 형태의 존댓말 질문이어야 해.
- 이전 AI 답변 내용과 관련된 후속 질문을 만들어. 답변에서 언급된 키워드나 주제를 활용해.
- 동시에, 아직 다루지 않은 새로운 영역도 1개 섞어.
- AI가 분석하는 문장(예: "두 분의 사주에서...")은 절대 쓰지 마. 반드시 사용자 시점.
- 짧고 자연스럽게 (20자 이내).
- JSON 배열로만 응답해. 다른 텍스트 없이.

## 좋은 예시
["재물운은 어떤가요?", "올해 건강 조심할 게 있나요?", "연애운도 궁금해요"]
["직장운은 어떤가요?", "이사 타이밍이 궁금해요", "가족관계는 어떻게 보이나요?"]

## 나쁜 예시 (절대 이렇게 쓰지 마)
["김민수, 네 재물운이랑 사업운이 궁금해!", "내 재능으로 돈을 크게 벌 수 있는 방법이 있을까?"]`,
    prompt: `캐릭터: ${safeName} (${characterId})
이전 AI 답변:
${safeMessage}

위 답변을 읽고, 사용자가 다음에 궁금해할 후속 질문 3개를 JSON 배열로 생성해.`,
    maxOutputTokens: 150,
  });

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]) as string[];
      return NextResponse.json({ suggestions: suggestions.slice(0, 3) });
    }
  } catch {
    // 파싱 실패 시 빈 배열
  }

  return NextResponse.json({ suggestions: [] });
}
