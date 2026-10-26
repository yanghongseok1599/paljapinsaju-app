import { NextResponse, type NextRequest } from "next/server";
import { setReferralCookie } from "@/services/referral/cookie";

/**
 * 레퍼럴 초대 링크: /invite/[code]
 * 레퍼럴 코드를 쿠키에 저장하고 메인 페이지로 보낸다.
 *
 * 페이지(서버 컴포넌트)에서는 쿠키를 쓸 수 없어 모든 초대 링크가 500 이 났다.
 * 쿠키 쓰기가 허용되는 Route Handler 로 옮겼다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string; locale: string }> },
) {
  const { code } = await params;

  // 레퍼럴 코드 유효성 기본 검사 (6~10자, base64url 문자 — 생성기가 - 와 _ 도 만든다)
  if (code && /^[A-Z0-9_-]{6,10}$/i.test(code)) {
    await setReferralCookie(code.toUpperCase());
  }

  return NextResponse.redirect(new URL("/", req.url));
}
