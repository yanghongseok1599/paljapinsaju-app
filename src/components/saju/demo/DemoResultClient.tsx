"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Link } from "@/i18n/routing";
import FiveElementChart from "@/components/saju/preview/FiveElementChart";
import FullAnalysis from "@/components/saju/result/FullAnalysis";
import DemoPdfDownloadButton from "@/components/saju/demo/DemoPdfDownloadButton";
import CategoryReportView from "@/components/saju/categories/CategoryReportView";
import ReadingModeToggle, { useReadingMode } from "@/components/saju/categories/ReadingModeToggle";
import MilestoneCheckoutButton from "@/components/saju/payment/MilestoneCheckoutButton";
import { getUnlockRecord, isUnlocked } from "@/lib/payments/entitlement";
import { readDemoReading } from "@/lib/saju/demo-reading";
import type { SajuReading } from "@/types/saju";

export default function DemoResultClient() {
  const params = useParams<{ id: string }>();
  const [reading, setReading] = useState<SajuReading | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [readingMode, setReadingMode] = useReadingMode();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReading(readDemoReading(params.id));
      setUnlocked(isUnlocked(params.id));
      setOrderId(getUnlockRecord(params.id)?.orderId);
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [params.id]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#131318] px-5 py-20 text-center text-[#cac4d0]">
        결과지를 불러오는 중...
      </main>
    );
  }

  if (!reading || !reading.full_analysis) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#131318] px-5 text-center">
        <h1 className="reading-heading text-xl font-bold">결과지를 찾을 수 없습니다</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#958ea0]">
          결과지는 이 브라우저에 저장됩니다. 사주 정보를 다시 입력하면 새로 받아보실 수 있어요.
        </p>
        <Link
          href="/reading"
          className="mt-6 rounded-xl bg-[#d0bcff] px-5 py-3 text-sm font-semibold text-[#3c0091]"
        >
          사주 다시 입력하기
        </Link>
      </main>
    );
  }

  return (
    <div className="reading-surface min-h-screen" data-reading-mode={readingMode}>
      <header
        className="sticky top-0 z-20 backdrop-blur"
        style={{
          borderBottom: "1px solid var(--read-border)",
          backgroundColor: "color-mix(in srgb, var(--read-bg) 95%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link
            href="/reading"
            className="reading-body flex items-center gap-2 !text-sm font-semibold transition-opacity hover:opacity-80"
          >
            <ArrowLeft size={17} />
            다시 입력
          </Link>
          <div className="flex items-center gap-3">
            <ReadingModeToggle mode={readingMode} onChange={setReadingMode} />
            <span
              className="reading-accent hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline"
              style={{ backgroundColor: "var(--read-accent-soft)" }}
            >
              체험 결과지
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8">
        <section className="reading-card rounded-2xl p-6">
          <h1 className="reading-heading text-xl font-bold" style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}>
            {reading.name}님의 사주분석 결과
          </h1>
          <p className="reading-muted mt-1">
            {reading.birth_year}년 {reading.birth_month}월 {reading.birth_day}일
            {reading.birth_hour !== null ? ` ${reading.birth_hour}시` : " 시간 모름"}
            {reading.is_lunar ? " (음력)" : " (양력)"}
            {" / "}
            {reading.gender === "male" ? "남성" : "여성"}
          </p>

          {reading.five_elements && (
            <div className="mt-5">
              <FiveElementChart elements={reading.five_elements} />
            </div>
          )}
        </section>

        {reading.full_analysis.categoryReport && (
          <CategoryReportView report={reading.full_analysis.categoryReport} />
        )}

        {/* 미결제면 앞부분만 열고 잠긴 자리에 결제 버튼을 둔다 */}
        <FullAnalysis
          analysis={reading.full_analysis}
          reading={reading}
          locked={!unlocked}
          paywall={
            <MilestoneCheckoutButton
              planId={reading.full_analysis.categoryReport?.categoryId ?? "full_analysis"}
              readingId={reading.id}
              note={
                reading.full_analysis.categoryReport
                  ? "결제하면 이 주제를 사주 데이터로 하나씩 분석해 드려요."
                  : "철학관 평균 30,000~50,000원"
              }
            />
          }
        />

        {/*
          PDF에는 유료 항목이 전부 들어간다. 결제 전에는 내려받기 자체를 감춘다.
          (서버도 주문번호를 확인하지만, 버튼을 보여주면 안 되는 게 먼저다.)
        */}
        {unlocked && (
        <div className="grid gap-3 sm:grid-cols-2">
          <DemoPdfDownloadButton reading={reading} orderId={orderId} />
          <button
            type="button"
            onClick={() => window.print()}
            className="reading-card reading-heading flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-opacity hover:opacity-80"
          >
            <Printer size={19} />
            인쇄/PDF 저장
          </button>
        </div>
        )}
      </main>
    </div>
  );
}
