import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import TarotIntroClient from "@/components/saju/tarot/TarotIntroClient";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { isAdminEmail } from "@/lib/admin";

export const metadata: Metadata = {
  title: "타로 카드 리딩",
  description: "달빛의 점술가 루나가 당신의 카드를 읽어줍니다. 원 카드, 쓰리 카드, 켈틱 크로스 10장 스프레드.",
};

export default async function TarotIntroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = isAdminEmail(user?.email);

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
      <div className="min-h-screen" style={{ backgroundColor: "#131318" }}>
        <TarotIntroClient
          isLoggedIn={!!user}
          starBalance={isAdmin ? 9999 : starBalance}
          isAdmin={isAdmin}
        />
        <SajuFooter />
      </div>
    </SajuLayout>
  );
}
