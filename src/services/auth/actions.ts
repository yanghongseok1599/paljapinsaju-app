"use server";

import { createClient } from "@/utils/supabase/server";
import { AUTH_COPY, loginErrorMessage, passwordErrorMessage } from "@/lib/auth-messages";
import { passwordPolicyError } from "@/lib/password-policy";
import { RECOVERY_COOKIE, recoveryProofMatches } from "@/lib/recovery-proof";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import {
  createDemoAuth,
  DEMO_AUTH_COOKIE,
  DEMO_TEST_EMAIL,
  DEMO_TEST_PASSWORD,
  type DemoAuthProvider,
} from "@/lib/saju/demo-auth";

function isLocalPlaceholderAuth() {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project-id.supabase.co" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_url"
  );
}

async function loginWithDemoProvider(provider: DemoAuthProvider, next?: string) {
  const auth = createDemoAuth(provider);
  const cookieStore = await cookies();

  cookieStore.set(DEMO_AUTH_COOKIE, encodeURIComponent(JSON.stringify(auth)), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  redirect(next || "/reading");
}

/**
 * Initiates the Google OAuth flow.
 * It redirects the user to Google's login page.
 */
export async function loginWithGoogle(next?: string) {
  if (isLocalPlaceholderAuth()) {
    await loginWithDemoProvider("google", next);
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const redirectTo = next
    ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    : `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error("Google Login Error:", error);
    // In a real app, you might return an error state
    return { error: AUTH_COPY.generic };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Initiates the Kakao OAuth flow.
 */
export async function loginWithKakao(next?: string) {
  if (isLocalPlaceholderAuth()) {
    await loginWithDemoProvider("kakao", next);
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const redirectTo = next
    ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    : `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error("Kakao Login Error:", error);
    return { error: AUTH_COPY.generic };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Sends a Magic Link (passwordless login) to the user's email.
 */
export async function loginWithMagicLink(email: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Allows the user to be redirected to the dashboard after clicking the link
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Magic Link Error:", error);
    return { error: error.status === 429 ? AUTH_COPY.rateLimited : AUTH_COPY.generic };
  }

  return { success: true };
}

/**
 * Signs up a new user with email and password.
 */
export async function signUpWithEmail(email: string, password: string) {
  // 화면 검사만으로는 우회할 수 있어 서버에서도 같은 정책을 건다
  const policyError = passwordPolicyError(password, { email });
  if (policyError) return { error: policyError };

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Email Sign Up Error:", error);
    // 이미 가입된 이메일이어도 성공과 같은 응답을 준다 (회원 여부가 드러나지 않게)
    if (error.code === "user_already_exists") return { success: true };
    return { error: passwordErrorMessage(error) };
  }

  return { success: true };
}

/**
 * Signs in an existing user with email and password.
 */
export async function signInWithEmail(email: string, password: string) {
  if (isLocalPlaceholderAuth()) {
    if (email.trim() !== DEMO_TEST_EMAIL || password !== DEMO_TEST_PASSWORD) {
      return { error: "테스트 계정 정보가 올바르지 않습니다." };
    }

    await loginWithDemoProvider("email", "/reading");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Email Sign In Error:", error);
    return { error: loginErrorMessage(error) };
  }

  return { success: true };
}

/**
 * Sends a password reset email.
 */
export async function sendPasswordReset(email: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    console.error("Password Reset Error:", error);
    // 가입 여부와 관계없이 같은 응답 (회원 명단 조회 방지). 너무 잦은 요청만 알린다.
    if (error.status === 429) return { error: AUTH_COPY.rateLimited };
    return { success: true };
  }

  return { success: true };
}

/**
 * Signs out the current user and redirects to the home page.
 */
export async function logout() {
  if (isLocalPlaceholderAuth()) {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_AUTH_COOKIE);
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}

/**
 * 재설정 링크로 들어온 사용자의 새 비밀번호를 저장한다.
 * /auth/reset-password 가 붙인 증명 쿠키가 이 세션과 맞을 때만 허용한다.
 * (증명이 없으면 로그인된 아무 세션이나 현재 비밀번호 없이 비밀번호를 바꿀 수 있다)
 */
export async function updatePasswordWithRecovery(password: string, confirmation: string) {
  if (password !== confirmation) return { error: "두 비밀번호가 서로 다릅니다." };

  const supabase = await createClient();
  const cookieStore = await cookies();

  let claims: { sub?: string; session_id?: string; email?: string } | undefined;
  let proven = false;
  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    claims = claimsData?.claims as typeof claims;
    proven = !!claims?.sub && recoveryProofMatches(
      cookieStore.get(RECOVERY_COOKIE)?.value,
      claims.sub,
      claims.session_id ?? "",
    );
  } catch {
    proven = false; // AUTH_PROOF_SECRET 미설정, 세션 없음 등
  }
  if (!proven) return { error: AUTH_COPY.linkExpired };

  const policyError = passwordPolicyError(password, { email: claims?.email });
  if (policyError) return { error: policyError };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: passwordErrorMessage(error) };

  cookieStore.delete(RECOVERY_COOKIE);
  await supabase.auth.signOut({ scope: "others" });
  return { success: true };
}
