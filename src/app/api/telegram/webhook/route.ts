import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * 텔레그램 양방향 봇 웹훅
 * 관리자가 봇에게 명령을 보내면 DB를 조회해 응답합니다.
 *
 * 보안:
 *  1) X-Telegram-Bot-Api-Secret-Token 헤더가 TELEGRAM_WEBHOOK_SECRET와 일치해야 함
 *  2) 메시지를 보낸 chat_id가 TELEGRAM_PAYMENTS_CHAT_ID(관리자)와 일치해야 함
 * 둘 중 하나라도 어긋나면 조용히 200으로 무시(정보 노출 방지).
 */

export const dynamic = "force-dynamic";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_PAYMENTS_CHAT_ID;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

const REPORT_PRICE = 19900;
const COMPAT_PRICE = 9900;
const SOLD_STATUSES = ["paid", "generating", "completed"];

async function tgReply(chatId: number | string, text: string): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // 응답 실패는 무시 — 웹훅은 항상 200을 반환해야 함
  }
}

function kstBoundaries() {
  const kstNow = new Date(Date.now() + 9 * 3600 * 1000);
  const ymd = kstNow.toISOString().slice(0, 10);
  const ym = ymd.slice(0, 7);
  return {
    ymd,
    ym,
    todayStart: new Date(`${ymd}T00:00:00+09:00`).toISOString(),
    monthStart: new Date(`${ym}-01T00:00:00+09:00`).toISOString(),
  };
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

async function buildRevenueReport(): Promise<string> {
  const supabase = createAdminClient();
  const { todayStart, monthStart, ymd, ym } = kstBoundaries();

  async function count(table: string, since?: string): Promise<number> {
    let q = supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .in("status", SOLD_STATUSES);
    if (since) q = q.gte("created_at", since);
    const { count: c } = await q;
    return c ?? 0;
  }

  const [rTotal, rMonth, rToday, cTotal, cMonth, cToday] = await Promise.all([
    count("saju_readings"),
    count("saju_readings", monthStart),
    count("saju_readings", todayStart),
    count("saju_compatibilities"),
    count("saju_compatibilities", monthStart),
    count("saju_compatibilities", todayStart),
  ]);

  const rev = (r: number, c: number) => r * REPORT_PRICE + c * COMPAT_PRICE;

  return [
    "<b>💰 팔자핀사주 매출 현황</b>",
    "",
    `<b>📅 오늘 (${ymd})</b>`,
    `· 종합리포트 ${rToday}건 · 궁합 ${cToday}건`,
    `· 매출 <b>${won(rev(rToday, cToday))}</b>`,
    "",
    `<b>🗓 이번 달 (${ym})</b>`,
    `· 종합리포트 ${rMonth}건 · 궁합 ${cMonth}건`,
    `· 매출 <b>${won(rev(rMonth, cMonth))}</b>`,
    "",
    "<b>📊 누적 전체</b>",
    `· 종합리포트 ${rTotal}건 · 궁합 ${cTotal}건`,
    `· 매출 <b>${won(rev(rTotal, cTotal))}</b>`,
    "",
    "<i>※ 리포트 19,900원 · 궁합 9,900원 기준 추정치</i>",
  ].join("\n");
}

async function buildStatsReport(): Promise<string> {
  const supabase = createAdminClient();
  const { todayStart, ymd } = kstBoundaries();

  let totalUsers = 0;
  let page = 1;
  while (true) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (!data?.users?.length) break;
    totalUsers += data.users.length;
    if (data.users.length < 1000) break;
    page++;
  }

  const { count: totalReadings } = await supabase
    .from("saju_readings")
    .select("id", { count: "exact", head: true });
  const { count: todayReadings } = await supabase
    .from("saju_readings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStart);
  const { data: stars } = await supabase.from("user_stars").select("balance");
  const totalStars = (stars ?? []).reduce((s, x) => s + (x.balance ?? 0), 0);

  return [
    "<b>📈 팔자핀사주 서비스 현황</b>",
    "",
    `· 누적 가입자 <b>${totalUsers.toLocaleString("ko-KR")}명</b>`,
    `· 누적 리포트 <b>${(totalReadings ?? 0).toLocaleString("ko-KR")}건</b>`,
    `· 오늘 리포트 (${ymd}) <b>${(todayReadings ?? 0).toLocaleString("ko-KR")}건</b>`,
    `· 미사용 별 잔액 합계 <b>${totalStars.toLocaleString("ko-KR")}개</b>`,
  ].join("\n");
}

const HELP = [
  "<b>🔮 팔자핀사주 관리자 봇</b>",
  "",
  "사용 가능한 명령:",
  "· <b>매출</b> — 오늘 / 이번달 / 누적 매출",
  "· <b>현황</b> — 가입자 · 리포트 · 별 현황",
  "· <b>도움말</b> — 이 안내",
].join("\n");

export async function POST(req: NextRequest) {
  // 1) 시크릿 토큰 검증 — 설정이 없으면 검증할 수 없으므로 전부 무시한다 (fail closed).
  //    예전엔 미설정 시 검증을 건너뛰어, 아무나 자기 chat_id로 매출 보고를 받아갈 수 있었다.
  if (!WEBHOOK_SECRET || !ADMIN_CHAT_ID) {
    return NextResponse.json({ ok: true });
  }
  const provided = req.headers.get("x-telegram-bot-api-secret-token");
  if (provided !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true });
  }

  let update: unknown;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const u = update as {
    message?: { chat?: { id?: number }; text?: string };
    edited_message?: { chat?: { id?: number }; text?: string };
  };
  const message = u.message ?? u.edited_message;
  const chatId = message?.chat?.id;
  const text = (message?.text ?? "").trim();

  if (chatId == null || !text) {
    return NextResponse.json({ ok: true });
  }

  // 2) 관리자 chat_id 검증 — 그 외엔 조용히 무시
  if (String(chatId) !== String(ADMIN_CHAT_ID)) {
    return NextResponse.json({ ok: true });
  }

  const lower = text.toLowerCase();
  try {
    if (lower.includes("매출") || lower.includes("수익") || lower === "/revenue") {
      await tgReply(chatId, await buildRevenueReport());
    } else if (
      lower.includes("현황") ||
      lower.includes("통계") ||
      lower === "/stats"
    ) {
      await tgReply(chatId, await buildStatsReport());
    } else {
      await tgReply(chatId, HELP);
    }
  } catch {
    await tgReply(chatId, "⚠️ 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "telegram-webhook" });
}
