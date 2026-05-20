"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Link } from "@/i18n/routing";
import FiveElementChart from "@/components/saju/preview/FiveElementChart";
import FullAnalysis from "@/components/saju/result/FullAnalysis";
import DemoPdfDownloadButton from "@/components/saju/demo/DemoPdfDownloadButton";
import { readDemoReading } from "@/lib/saju/demo-reading";
import type { SajuReading } from "@/types/saju";

export default function DemoResultClient() {
  const params = useParams<{ id: string }>();
  const [reading, setReading] = useState<SajuReading | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReading(readDemoReading(params.id));
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
        <h1 className="text-xl font-bold text-[#e4e1e9]">결과지를 찾을 수 없습니다</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#958ea0]">
          이 데모 결과지는 현재 브라우저에 저장됩니다. 다시 입력하면 새 결과지를 만들 수 있습니다.
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
    <div className="min-h-screen bg-[#131318]">
      <header className="sticky top-0 z-20 border-b border-[rgba(73,68,84,0.25)] bg-[#131318]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link
            href="/reading"
            className="flex items-center gap-2 text-sm font-semibold text-[#cac4d0] transition-colors hover:text-[#e4e1e9]"
          >
            <ArrowLeft size={17} />
            다시 입력
          </Link>
          <span className="rounded-full bg-[rgba(208,188,255,0.12)] px-3 py-1 text-xs font-semibold text-[#d0bcff]">
            체험 결과지
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8">
        <section className="glass-panel rounded-2xl p-6" style={{ borderColor: "rgba(73,68,84,0.2)" }}>
          <h1 className="text-xl font-bold text-[#e4e1e9]" style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}>
            {reading.name}님의 사주분석 결과
          </h1>
          <p className="mt-1 text-sm text-[#958ea0]">
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

        <FullAnalysis analysis={reading.full_analysis} reading={reading} />

        <div className="grid gap-3 sm:grid-cols-2">
          <DemoPdfDownloadButton reading={reading} />
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(73,68,84,0.45)] bg-[#1f1f25] text-base font-semibold text-[#e4e1e9] transition-colors hover:bg-[#27272f]"
          >
            <Printer size={19} />
            인쇄/PDF 저장
          </button>
        </div>
      </main>
    </div>
  );
}
