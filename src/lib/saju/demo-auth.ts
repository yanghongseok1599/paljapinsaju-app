export type DemoAuthProvider = "google" | "kakao" | "email";

export const DEMO_TEST_EMAIL = "admin";
export const DEMO_TEST_PASSWORD = "1111";

export interface DemoAuth {
  provider: DemoAuthProvider;
  name: string;
  email: string;
  signedInAt: string;
}

export const DEMO_AUTH_COOKIE = "paljapin_demo_auth";
export const DEMO_AUTH_STORAGE_KEY = "paljapin.demo.auth";

const PROVIDER_LABELS: Record<DemoAuthProvider, string> = {
  google: "Google",
  kakao: "Kakao",
  email: "Email",
};

export function createDemoAuth(provider: DemoAuthProvider): DemoAuth {
  return {
    provider,
    name: `${PROVIDER_LABELS[provider]} 체험 계정`,
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
    return parsed;
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
