"use server";

import { createClient } from "@/utils/supabase/server";
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
    return { error: error.message };
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
    return { error: error.message };
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
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Signs up a new user with email and password.
 */
export async function signUpWithEmail(email: string, password: string) {
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
    return { error: error.message };
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
    return { error: error.message };
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
    return { error: error.message };
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
