import ZodiacPageClient from "@/components/saju/zodiac/ZodiacPageClient";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "별자리 크리스탈",
  description: "12개의 별자리가 전하는 미래의 메시지와 신비로운 조언을 확인하세요.",
};

export default async function ZodiacPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  let starBalance = 0;
  if (user && !isAdmin) {
    const { data: stars } = await supabase
      .from("user_stars")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    starBalance = stars?.balance ?? 0;
  }

  return (
    <SajuLayout>
      <div className="min-h-screen star-background" style={{ backgroundColor: "#131318" }}>
        <ZodiacPageClient
          isLoggedIn={!!user}
          starBalance={isAdmin ? 9999 : starBalance}
          isAdmin={isAdmin}
        />
        <SajuFooter />
      </div>
    </SajuLayout>
  );
}
