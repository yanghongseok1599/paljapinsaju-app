export type DemoAuthProvider = "google" | "kakao" | "email";

export const DEMO_TEST_EMAIL = "admin";
export const DEMO_TEST_PASSWORD = "1111";

export interface DemoAuth {
  provider: DemoAuthProvider;
  name: string;
  email: string;
  signedInAt: string;
}

/**
 * 게스트 계정에 표시할 이름.
 *
 * ⚠️ 이 이름은 로그인 시점에 쿠키/localStorage 에 함께 저장된다.
 * 그래서 코드에서 이름만 바꾸면 **이미 로그인한 사람에게는 옛 이름이 그대로 보인다.**
 * (예전에 "Google 체험 계정"으로 저장된 쿠키가 계속 그 값을 돌려줬다.)
 * 그래서 읽을 때마다 이 값으로 덮어쓴다 — 저장된 이름은 신뢰하지 않는다.
 */
export const DEMO_DISPLAY_NAME = "게스트";

/** 저장된 값에서 표시 이름을 현재 기준으로 맞춘다 */
export function normalizeDemoAuth(auth: DemoAuth): DemoAuth {
  return { ...auth, name: DEMO_DISPLAY_NAME };
}

export const DEMO_AUTH_COOKIE = "paljapin_demo_auth";
export const DEMO_AUTH_STORAGE_KEY = "paljapin.demo.auth";

export function createDemoAuth(provider: DemoAuthProvider): DemoAuth {
  return {
    provider,
    name: DEMO_DISPLAY_NAME,
    email: provider === "email" ? DEMO_TEST_EMAIL : `${provider}-demo@paljapin.local`,
    signedInAt: new Date().toISOString(),
  };
}

function parseAuth(value: string | null | undefined): DemoAuth | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as DemoAuth;
    if (parsed.provider !== "google" && parsed.provider !== "kakao") {
      return null;
    }
    // 예전에 저장된 이름("Google 체험 계정" 등)을 현재 이름으로 교체
    return normalizeDemoAuth(parsed);
  } catch {
    return null;
  }
}

export function readDemoAuth(): DemoAuth | null {
  if (typeof window === "undefined") return null;

  const stored = parseAuth(window.localStorage.getItem(DEMO_AUTH_STORAGE_KEY));
  if (stored) return stored;

  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${DEMO_AUTH_COOKIE}=`))
    ?.split("=")[1];

  return parseAuth(cookieValue);
}

export function saveDemoAuth(provider: DemoAuthProvider): DemoAuth {
  const auth = createDemoAuth(provider);
  const value = encodeURIComponent(JSON.stringify(auth));

  window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, value);
  document.cookie = `${DEMO_AUTH_COOKIE}=${value}; Path=/; Max-Age=2592000; SameSite=Lax`;

  return auth;
}

export function clearDemoAuth() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
  document.cookie = `${DEMO_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
