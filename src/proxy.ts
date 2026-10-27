import { updateSession } from "@/utils/supabase/middleware";
import { ACCOUNTS_ENABLED } from "@/lib/accounts";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// 인증이 필요한 보호 경로 (H4)
// - /my-readings: 내 분석 목록
// - /reading/[id]/result: 결제 완료 후 전체 결과
// - /coin-shop: 별 충전 페이지
// - /saju-report: 리포트 페이지
// - /chat/[characterId]: AI 채팅 (동적 경로)
// NOTE: /invite/[code] is intentionally PUBLIC — the referral receive flow
// must be accessible to unauthenticated users.
// 회원 기능이 꺼져 있을 때 열면 안 되는 화면 (계정·별이 있어야 동작한다).
// /reading/<id> 는 로그인 사용자의 분석이고, /reading/demo/<id> 는 무료 체험이라 열어 둔다.
const ACCOUNT_ONLY_PATTERN =
  /^\/(?:(?:ko|en|ja|zh)\/)?(chat|login|update-password|my-readings|saju-report|coin-shop|compatibility|tarot|zodiac|invite|admin|reading\/(?!demo(?:\/|$))[^/]+)(\/|$)/;

const PROTECTED_PATTERN =
  /^\/(ko|en|ja|zh)?\/(my-readings|reading\/[^/]+\/result|coin-shop|saju-report|chat)(\/|$)/;

export async function proxy(request: NextRequest) {
  if (!ACCOUNTS_ENABLED) {
    const match = request.nextUrl.pathname.match(ACCOUNT_ONLY_PATTERN);
    if (match) {
      // 상담사 채팅은 무료 체험으로(고민별 상담 주제는 이어서), 나머지는 홈으로
      const category = request.nextUrl.searchParams.get("category");
      const target =
        match[1] === "chat"
          ? `/reading${category ? `?category=${encodeURIComponent(category)}` : ""}`
          : "/";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // 1. Run next-intl middleware to handle locale redirects and get the base response
  const response = intlMiddleware(request);

  // 2. Run Supabase session update (copies cookies to response)
  const supabaseResponse = await updateSession(request, response);

  // 3. pathname 헤더 추가 (layout.tsx에서 현재 경로 확인용)
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);

  // 4. Protect dashboard routes — redirect to login if not authenticated
  const pathname = request.nextUrl.pathname;
  if (PROTECTED_PATTERN.test(pathname)) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const locale = pathname.split("/")[1] || "ko";
        // 로그인 후 원래 가려던 주소로 되돌아오게 한다.
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - auth routes (handled by root route handlers)
  // - _next (static files)
  // - _vercel (Vercel internals)
  // - Static files (e.g. favicon.ico, sitemap.xml, robots.txt, etc.)
  matcher: ["/((?!api|auth|widget|icon|demo|_next|_vercel|.*\\..*).*)"],
};
