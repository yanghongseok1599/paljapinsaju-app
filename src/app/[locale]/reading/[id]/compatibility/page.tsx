import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import CompatibilityClient from "@/components/saju/compatibility/CompatibilityClient";
import { getReading } from "@/services/saju/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "궁합 분석",
  description: "사주팔자 기반 AI 궁합 분석으로 두 사람의 케미를 확인해보세요.",
};

export default async function ReadingCompatibilityPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 로그인 후 이 분석의 궁합 페이지로 되돌아오게 한다.
    redirect(
      `/?login=required&next=${encodeURIComponent(`/reading/${id}/compatibility`)}`
    );
  }

  // reading 조회 (소유권 + 존재 여부 확인)
  const { data: reading, error } = await getReading(id);

  if (error || !reading) {
    notFound();
  }

  // 완료되지 않은 사주는 해당 reading 페이지로 리다이렉트
  if (reading.status !== "completed") {
    redirect(`/reading/${id}`);
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

  return (
    <SajuLayout>
      <CompatibilityClient
        readings={[reading]}
        defaultReadingId={reading.id}
        starBalance={starBalance}
        isAdmin={isAdmin}
      />
    </SajuLayout>
  );
}
