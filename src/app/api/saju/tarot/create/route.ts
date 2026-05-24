/**
 * POST /api/saju/tarot/create
 *
 * 타로 리딩 생성: 인증 → 별 차감 (atomic_deduct_stars) → tarot_readings row 생성 → { id } 반환.
 * 해석 스트리밍은 별도 엔드포인트(/interpret)에서 처리.
 */
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { SPREADS, isSpreadType } from "@/lib/tarot/spreads";
import { getCard } from "@/lib/tarot/cards";

interface DrawnCardInput {
  cardId: string;
  reversed: boolean;
  position: string;
}

interface CreateRequest {
  spread: string;
  cards: DrawnCardInput[];
  characterId?: string;
  question?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreateRequest;
  const { spread, cards, characterId = "luna_f", question } = body;

  // 1) 입력 검증
  if (!isSpreadType(spread)) {
    return new Response("Invalid spread", { status: 400 });
  }
  const spreadDef = SPREADS[spread];
  if (!Array.isArray(cards) || cards.length !== spreadDef.count) {
    return new Response(`Expected ${spreadDef.count} cards`, { status: 400 });
  }
  for (const c of cards) {
    if (!getCard(c.cardId)) {
      return new Response(`Unknown card: ${c.cardId}`, { status: 400 });
    }
    if (!spreadDef.positions.includes(c.position)) {
      return new Response(`Invalid position for ${spread}: ${c.position}`, { status: 400 });
    }
  }

  // 2) 인증
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .filter(Boolean);
  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");

  // 3) 레이트 리밋
  if (!isAdmin) {
    const rl = checkRateLimit(`tarot:create:${user.id}`, 6, 60_000);
    if (!rl.success) {
      return new Response("Too many requests", { status: 429 });
    }
  }

  // 4) 별 차감 (어드민은 무료)
  const cost = spreadDef.cost;
  if (!isAdmin) {
    const { data: newBalance, error } = await supabase.rpc("atomic_deduct_stars", {
      p_amount: cost,
    });
    if (error) {
      return new Response("Star deduction failed", { status: 500 });
    }
    if (newBalance === null) {
      return Response.json(
        { error: "insufficient_stars", required: cost },
        { status: 402 },
      );
    }
  }

  // 5) 리딩 row 생성
  const { data: reading, error: insertErr } = await supabase
    .from("tarot_readings")
    .insert({
      user_id: user.id,
      character_id: characterId,
      spread_type: spread,
      drawn_cards: cards,
      question: question ?? null,
      star_cost: isAdmin ? 0 : cost,
    })
    .select("id")
    .single();

  if (insertErr || !reading) {
    // 차감 환불
    if (!isAdmin) {
      await supabase.rpc("atomic_grant_stars", {
        p_amount: cost,
        p_reason: "tarot_create_failed",
      });
    }
    return new Response("Failed to create reading", { status: 500 });
  }

  return Response.json({ id: reading.id, starCost: isAdmin ? 0 : cost });
}
