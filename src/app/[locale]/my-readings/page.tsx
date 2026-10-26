import { redirect } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/server";
import { getUserReadings } from "@/services/saju/actions";
import SajuNavbar from "@/components/saju/landing/SajuNavbarAuto";
import MyPageTabs, {
  type StarTransactionRow,
  type ProfileSummary,
} from "@/components/saju/my/MyPageTabs";
import type { SajuCompatibility } from "@/types/saju";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 로그인 안내를 띄우고, 로그인 후 이 페이지로 되돌아오게 한다.
    redirect({ href: "/?login=required&next=/my-readings", locale: "ko" });
    return null;
  }

  // Parallel fetches — readings, compats, transactions, star balance
  const [
    readingsRes,
    compatsRes,
    txRes,
    starsRes,
  ] = await Promise.all([
    getUserReadings(user.id),
    supabase
      .from("saju_compatibilities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<SajuCompatibility[]>(),
    supabase
      .from("star_transactions")
      .select("id, amount, balance_after, type, reading_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<StarTransactionRow[]>(),
    supabase
      .from("user_stars")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const profile: ProfileSummary = {
    email: user.email ?? null,
    name: (user.user_metadata?.name as string | undefined) ?? null,
    createdAt: user.created_at,
    starBalance: (starsRes.data?.balance as number | undefined) ?? 0,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#131318", color: "#e4e1e9" }}>
      <SajuNavbar />

      <main className="max-w-3xl mx-auto px-5 py-8 pt-24">
        <header className="mb-6">
          <h1
            className="text-3xl font-black text-[#e4e1e9] tracking-tight"
            style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
          >
            마이페이지
          </h1>
          <p className="text-sm text-[#958ea0] mt-1">분석 내역, 궁합, 별 충전·사용 내역을 한 곳에서 관리하세요.</p>
        </header>

        <MyPageTabs
          profile={profile}
          readings={readingsRes.data}
          compats={compatsRes.data ?? []}
          transactions={txRes.data ?? []}
        />
      </main>
    </div>
  );
}
