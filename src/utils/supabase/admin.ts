import { createClient } from "@supabase/supabase-js";
import { MOCK_DASHBOARD, createMockAdminClient } from "./mock-admin";

// Admin Client (service_role) - RLS를 우회
// 웹훅, 백그라운드 작업 등 서버 전용으로만 사용
export function createAdminClient() {
  // LOCAL-ONLY: Supabase 없이 대시보드를 확인하기 위한 목 모드
  if (MOCK_DASHBOARD) {
    return createMockAdminClient() as unknown as ReturnType<typeof createClient>;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
