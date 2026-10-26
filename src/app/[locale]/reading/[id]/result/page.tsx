import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { getReading } from "@/services/saju/actions";
import SajuNavbar from "@/components/saju/landing/SajuNavbarAuto";
import MoneyReport from "@/components/saju/money-report/MoneyReport";
import FullAnalysis from "@/components/saju/result/FullAnalysis";
import PdfDownloadButton from "@/components/saju/result/PdfDownloadButton";
import CompatibilityUpsell from "@/components/saju/result/CompatibilityUpsell";
import ShareCard from "@/components/saju/result/ShareCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "분석 결과",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const { data: reading, error } = await getReading(id);

  if (error || !reading) {
    notFound();
  }

  if (reading.status !== "completed" || !reading.full_analysis) {
    redirect({ href: `/reading/${id}`, locale });
    return null;
  }

  const { four_pillars: pillars, five_elements: elements } = reading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131318' }}>
      <SajuNavbar />

      <main className="max-w-3xl mx-auto px-5 py-8 pt-24 flex flex-col gap-6">
        {/* 사주 정보 요약 (오행 차트는 MoneyReport의 부자 DNA / 오행 프로필이 흡수) */}
        <div className="glass-panel rounded-2xl p-6" style={{ borderColor: 'rgba(73,68,84,0.2)' }}>
          <h1 className="text-xl font-bold text-[#e4e1e9]" style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>
            {reading.name}님의 사주분석 결과
          </h1>
          <p className="mt-1 text-sm text-[#958ea0]">
            {reading.birth_year}년 {reading.birth_month}월 {reading.birth_day}일
            {reading.birth_hour !== null ? ` ${reading.birth_hour}시` : ""}
            {reading.is_lunar ? " (음력)" : " (양력)"}
            {" / "}
            {reading.gender === "male" ? "남성" : "여성"}
          </p>
        </div>

        {/* ── 18섹션 재물운 보고서 (상단) ── */}
        {pillars && elements && (
          <MoneyReport name={reading.name} pillars={pillars} elements={elements} />
        )}

        {/* ── 기존 전체 사주 분석 ── */}
        <FullAnalysis analysis={reading.full_analysis} reading={reading} />

        {/* PDF 다운로드 */}
        <PdfDownloadButton readingId={reading.id} name={reading.name} />

        {/* 궁합 분석 업셀 */}
        <CompatibilityUpsell readingId={reading.id} name={reading.name} />

        {/* 공유 카드 */}
        <ShareCard name={reading.name} />
      </main>
    </div>
  );
}
