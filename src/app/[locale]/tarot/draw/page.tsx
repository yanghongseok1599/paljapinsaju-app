import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import TarotDrawClient from "@/components/saju/tarot/TarotDrawClient";
import { createClient } from "@/utils/supabase/server";
import { isSpreadType, SPREADS, type SpreadType } from "@/lib/tarot/spreads";
import { redirect } from "@/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타로 카드 뽑기",
  description: "루나와 함께 카드를 뽑아보세요.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ spread?: string }>;
}

export default async function TarotDrawPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { spread } = await searchParams;

  if (!spread || !isSpreadType(spread)) {
    redirect({ href: "/tarot", locale });
  }

  const spreadType = spread as SpreadType;

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
      <div className="min-h-screen" style={{ backgroundColor: "#131318" }}>
        <TarotDrawClient
          spread={spreadType}
          cost={SPREADS[spreadType].cost}
          isLoggedIn={!!user}
          isAdmin={isAdmin}
          starBalance={isAdmin ? 9999 : starBalance}
        />
        <SajuFooter />
      </div>
    </SajuLayout>
  );
}
