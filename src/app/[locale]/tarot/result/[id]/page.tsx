import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import TarotResultClient from "@/components/saju/tarot/TarotResultClient";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getCard } from "@/lib/tarot/cards";
import type { SpreadType } from "@/lib/tarot/spreads";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타로 리딩 결과",
};

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

interface DrawnRow {
  cardId: string;
  reversed: boolean;
  position: string;
}

export default async function TarotResultPage({ params }: PageProps) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/tarot`);
  }

  const { data: reading, error } = await supabase
    .from("tarot_readings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !reading) {
    notFound();
  }

  // 카드 데이터 조인
  const drawn = (reading.drawn_cards as DrawnRow[]).map((d) => {
    const card = getCard(d.cardId);
    if (!card) return null;
    return { card, reversed: d.reversed, position: d.position };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <SajuLayout>
      <div className="min-h-screen" style={{ backgroundColor: "#131318" }}>
        <TarotResultClient
          readingId={id}
          spread={reading.spread_type as SpreadType}
          question={reading.question ?? null}
          drawn={drawn}
          initialInterpretation={reading.interpretation ?? null}
          locale={locale}
        />
        <SajuFooter />
      </div>
    </SajuLayout>
  );
}
