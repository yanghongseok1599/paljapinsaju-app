import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics/track";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * 페이지 조회 기록 (src/hooks/useAnalytics.ts 가 부른다).
 * 이 라우트가 없어 운영에서 페이지를 열 때마다 404 가 나고 관리자 방문 통계가 비어 있었다.
 *
 * 로그인 없이 누구나 부르는 쓰기 엔드포인트라 page_view 만 받고 길이를 자른다.
 * ponytail: 제한은 인스턴스별 메모리 기준이다. 스팸이 보이면 공유 저장소(Upstash 등) 제한으로 바꾼다.
 */
const cut = (v: unknown, max: number) =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`analytics:${ip}`, 60, 60_000).success) {
    return new NextResponse(null, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (body.event_type !== "page_view") {
    return new NextResponse(null, { status: 400 });
  }

  await trackEvent({
    eventType: "page_view",
    pagePath: cut(body.page_path, 200),
    sessionId: cut(body.session_id, 64),
    referrer: cut(body.referrer, 300),
    utmSource: cut(body.utm_source, 100),
    utmMedium: cut(body.utm_medium, 100),
    utmCampaign: cut(body.utm_campaign, 100),
  });

  return new NextResponse(null, { status: 204 });
}
