import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MOCK_DASHBOARD, createMockServerClient, createSignedOutServerClient } from "./mock-admin";
import { ACCOUNTS_ENABLED } from "@/lib/accounts";

export async function createClient() {
  const cookieStore = await cookies();

  const makeClient = () =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

  // LOCAL-ONLY: Supabase 없이 앱을 렌더링하기 위한 목 모드 (비로그인 상태)
  if (MOCK_DASHBOARD) {
    return createMockServerClient() as unknown as ReturnType<typeof makeClient>;
  }

  // 회원 기능이 꺼져 있으면(Supabase 미설정) 비로그인 방문자로 동작한다
  if (!ACCOUNTS_ENABLED) {
    return createSignedOutServerClient() as unknown as ReturnType<typeof makeClient>;
  }

  return makeClient();
}
