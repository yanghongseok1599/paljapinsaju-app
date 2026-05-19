import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import CompatibilityClient from "@/components/saju/compatibility/CompatibilityClient";
import { getUserReadings } from "@/services/saju/actions";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "궁합 분석",
  description: "사주팔자 기반 AI 궁합 분석으로 두 사람의 케미를 확인해보세요.",
};

export default async function CompatibilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ko?login=required");
  }

  // 관리자 판정
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

  // 별 잔액 조회
  let { data: stars } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!stars) {
    await supabase.from("user_stars").insert({ user_id: user.id, balance: 3 });
    stars = { balance: 3 };
  }
  const starBalance = isAdmin ? 99999 : stars.balance;

  // 유저의 사주 목록 조회
  const { data: readings } = await getUserReadings(user.id);
  const completedReadings = readings.filter((r) => r.status === "completed");

  // 완료된 사주가 없으면 안내 메시지
  if (completedReadings.length === 0) {
    return (
      <SajuLayout>
        <div
          className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4"
          style={{ backgroundColor: "#131318" }}
        >
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "rgba(208,188,255,0.1)" }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d0bcff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h1
              className="text-xl font-bold text-[#e4e1e9] mb-3"
              style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
            >
              사주 분석이 필요해요
            </h1>
            <p className="text-sm text-[#958ea0] leading-relaxed mb-7">
              궁합 분석을 하려면 먼저 내 사주를 완성해야 해요.
              <br />
              사주 분석을 먼저 진행해주세요.
            </p>
            <Link
              href="/reading"
              className="inline-block oracle-gradient rounded-xl px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ color: "#3c0091" }}
            >
              내 사주 분석하러 가기
            </Link>
          </div>
        </div>
      </SajuLayout>
    );
  }

  return (
    <SajuLayout>
      <CompatibilityClient
        readings={completedReadings}
        starBalance={starBalance}
        isAdmin={isAdmin}
      />
    </SajuLayout>
  );
}
