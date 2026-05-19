import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { routing } from "@/i18n/routing";

/**
 * Handles the redirect from Supabase after a password reset email link is clicked.
 * Supabase sends ?code=... (PKCE) or ?token_hash=...&type=recovery.
 * We exchange the code for a session, then redirect to /update-password.
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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${localePrefix}/login?mode=update-password`);
    }
  } else if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (!error) {
      return NextResponse.redirect(`${origin}${localePrefix}/login?mode=update-password`);
    }
  }

  return NextResponse.redirect(`${origin}${localePrefix}/login?error=reset-link-expired`);
}
