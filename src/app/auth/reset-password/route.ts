import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { routing } from "@/i18n/routing";
import { createRecoveryProof, RECOVERY_COOKIE, RECOVERY_SECONDS } from "@/lib/recovery-proof";

/**
 * 비밀번호 재설정 메일의 링크가 도착하는 곳.
 * Supabase 는 ?code=... (PKCE) 또는 ?token_hash=...&type=recovery 로 보낸다.
 *
 * 세션을 만든 뒤 "이 세션은 재설정 링크로 만들어졌다"는 서명된 증명 쿠키를 붙여
 * 새 비밀번호 화면(/update-password)으로 보낸다. 증명이 없으면 그 화면은 저장을 거부한다.
 * (예전엔 /login?mode=update-password 로 보냈는데 그 모드를 처리하는 화면이 없어,
 *  링크를 눌러도 새 비밀번호를 정할 수 없었다.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const cookieStore = request.headers.get("cookie");
  const localeCookie = cookieStore
    ?.split("; ")
    .find((c) => c.startsWith("NEXT_LOCALE="))
    ?.split("=")[1];
  const locale = (localeCookie || routing.defaultLocale) as string;
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  const supabase = await createClient();
  let session: { access_token: string; user: { id: string } } | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // 재설정 메일을 요청한 브라우저의 PKCE 저장값에만 PASSWORD_RECOVERY 표시가 있다.
    // 로그인·가입 링크의 code 로는 재설정 증명을 받지 못한다.
    const redirectType = (data as { redirectType?: string | null } | null)?.redirectType;
    if (!error && data.session && redirectType === "PASSWORD_RECOVERY") session = data.session;
  } else if (tokenHash && type === "recovery") {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (!error && data.session) session = data.session;
  }

  if (!session) {
    return NextResponse.redirect(`${origin}${localePrefix}/login?error=reset-link-expired`);
  }

  // 방금 Supabase 에게서 받은 토큰이라 서명 검증 없이 session_id 만 꺼낸다.
  const claims = JSON.parse(
    Buffer.from(session.access_token.split(".")[1], "base64url").toString("utf8"),
  ) as { session_id?: string };

  let proof: string;
  try {
    proof = createRecoveryProof(session.user.id, claims.session_id ?? "");
  } catch (err) {
    // AUTH_PROOF_SECRET 미설정 등 — 증명 없이 보내면 저장 단계에서 어차피 거부된다
    console.error("[reset-password] 재설정 증명 생성 실패:", err instanceof Error ? err.message : err);
    return NextResponse.redirect(`${origin}${localePrefix}/login?error=reset-unavailable`);
  }

  const response = NextResponse.redirect(`${origin}${localePrefix}/update-password`);
  response.cookies.set(RECOVERY_COOKIE, proof, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: RECOVERY_SECONDS,
    path: "/",
  });
  return response;
}
