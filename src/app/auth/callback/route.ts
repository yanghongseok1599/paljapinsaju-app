import { NextResponse, after } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { routing } from "@/i18n/routing";
import { sendWelcomeEmail } from "@/services/email/actions";
import { trackEvent } from "@/lib/analytics/track";
import { grantReferralReward } from "@/lib/referral/grant";
import { getReferralCodeFromHeaders } from "@/services/referral/cookie";

/** 메일 링크로 들어올 수 있는 인증 유형 (비밀번호 재설정은 /auth/reset-password 가 받는다) */
const EMAIL_LINK_TYPES: EmailOtpType[] = ["signup", "email", "magiclink", "invite", "email_change"];

/**
 * 로그인·가입 완료 후 돌아오는 곳.
 *  - ?code=...                 Google·카카오 OAuth, 같은 브라우저에서 연 확인 메일 (PKCE)
 *  - ?token_hash=...&type=...  다른 기기에서 연 확인 메일·매직링크
 *    (Supabase 메일 템플릿을 {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email 로 바꿔야 쓰인다)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Get preferred locale from cookie or default
  const cookieStore = request.headers.get("cookie");
  const localeCookie = cookieStore
    ?.split("; ")
    .find((c) => c.startsWith("NEXT_LOCALE="))
    ?.split("=")[1];
  const locale = (localeCookie || routing.defaultLocale) as "en" | "ko";

  // if "next" is in param, use it as the redirect URL
  // /dashboard 라우트는 존재하지 않는다 (SaaS Kit 잔재). 기본은 홈으로 보낸다.
  const next = searchParams.get("next") ?? "/";

  // Only add locale prefix for non-default locales (en has no prefix)
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const localizedNext = `${localePrefix}${next.startsWith("/") ? next : `/${next}`}`;

  const supabase = await createClient();
  let user: User | null = null;

  if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("Auth code exchange error:", error.message);
    else user = data.user;
  } else if (tokenHash && type && EMAIL_LINK_TYPES.includes(type)) {
    const { error, data } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) console.error("Auth token verify error:", error.message);
    else user = data.user;
  } else {
    console.error("Auth callback: no code or token_hash. URL:", request.url);
  }

  if (!user) {
    return NextResponse.redirect(`${origin}${localePrefix}/login?error=auth-code-error`);
  }

  // 신규 가입 판정: 가입 후 첫 로그인인지 (유입 정보를 아직 저장하지 않은 계정).
  // 예전엔 "가입 10초 이내"로 봐서, 확인 메일을 몇 분 뒤에 누른 이메일 가입자는
  // 환영 메일·초대 보상·유입 기록을 하나도 받지 못했다.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("signup_device")
    .eq("id", user.id)
    .maybeSingle();
  const createdRecently = Date.now() - new Date(user.created_at).getTime() < 24 * 60 * 60 * 1000;
  const isNewUser = createdRecently && !profile?.signup_device;

  // 쿠키에서 UTM / referrer 읽기
  const utmCookie = cookieStore
    ?.split("; ")
    .find((c) => c.startsWith("_az_utm="))
    ?.split("=")
    .slice(1)
    .join("=");
  const refCookie = cookieStore
    ?.split("; ")
    .find((c) => c.startsWith("_az_ref="))
    ?.split("=")
    .slice(1)
    .join("=");

  let utmData = { utm_source: "", utm_medium: "", utm_campaign: "" };
  if (utmCookie) {
    try {
      utmData = JSON.parse(decodeURIComponent(utmCookie));
    } catch {}
  }
  const firstReferrer = refCookie ? decodeURIComponent(refCookie) : "";

  // Geo / device from headers
  const signupCountry = request.headers.get("x-vercel-ip-country") || null;
  const ua = request.headers.get("user-agent") || "";
  const signupDevice = /mobile/i.test(ua) ? "mobile" : /tablet/i.test(ua) ? "tablet" : "desktop";
  const referralCode = getReferralCodeFromHeaders(cookieStore);
  const signedInUser = user;

  // 응답을 보낸 뒤에도 끝까지 실행되도록 after() 로 넘긴다.
  // (그냥 던져두면 Vercel 이 응답 직후 함수를 멈춰 메일·보상이 사라질 수 있다)
  after(async () => {
    if (isNewUser) {
      // users 테이블에 First Touch Attribution 저장 — 이 값이 저장되면 다음부터는 신규가 아니다
      await admin
        .from("users")
        .update({
          first_utm_source: utmData.utm_source || null,
          first_utm_medium: utmData.utm_medium || null,
          first_utm_campaign: utmData.utm_campaign || null,
          first_referrer: firstReferrer || null,
          signup_country: signupCountry,
          signup_device: signupDevice,
        })
        .eq("id", signedInUser.id);

      if (referralCode) {
        await grantReferralReward(signedInUser.id, referralCode).catch((err) =>
          console.error("레퍼럴 처리 실패:", err),
        );
      }

      await trackEvent({
        userId: signedInUser.id,
        eventType: "signup",
        utmSource: utmData.utm_source || undefined,
        utmMedium: utmData.utm_medium || undefined,
        utmCampaign: utmData.utm_campaign || undefined,
        referrer: firstReferrer || undefined,
      }).catch(() => {});

      if (signedInUser.email) {
        const userName =
          signedInUser.user_metadata?.full_name || signedInUser.email.split("@")[0] || "User";
        await sendWelcomeEmail({ email: signedInUser.email, userName, locale }).catch((err) =>
          console.error("Welcome email failed:", err),
        );
      }
    } else {
      await trackEvent({ userId: signedInUser.id, eventType: "login" }).catch(() => {});
    }
  });

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const baseUrl = isLocalEnv ? origin : forwardedHost ? `https://${forwardedHost}` : origin;

  return NextResponse.redirect(`${baseUrl}${localizedNext}`);
}
