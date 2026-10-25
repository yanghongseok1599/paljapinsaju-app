import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuReportClient from "@/components/saju/report/SajuReportClient";

export default async function SajuReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 로그인 후 이 페이지로 되돌아오게 한다.
    redirect("/?login=required&next=/saju-report");
  }

  // 관리자 판정 — ADMIN_EMAILS 환경변수와 이메일 일치 시 별 체크 우회
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

  // 별 잔액 조회
  const { data: stars } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const starBalance = stars?.balance ?? 0;

  // 최근 사주 정보 (내 정보 사용하기 용)
  const { data: latestReading } = await supabase
    .from("saju_readings")
    .select("name, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, birth_city")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const previousBirthInfo = latestReading
    ? {
        name: latestReading.name as string,
        gender: latestReading.gender as "male" | "female",
        birthYear: latestReading.birth_year as number,
        birthMonth: latestReading.birth_month as number,
        birthDay: latestReading.birth_day as number,
        birthHour: latestReading.birth_hour as number | null,
        isLunar: latestReading.is_lunar as boolean,
        birthCity: (latestReading.birth_city as string) ?? undefined,
      }
    : undefined;

  return (
    <SajuLayout>
      <SajuReportClient
        userId={user.id}
        starBalance={starBalance}
        previousBirthInfo={previousBirthInfo}
        isAdmin={isAdmin}
      />
    </SajuLayout>
  );
}
