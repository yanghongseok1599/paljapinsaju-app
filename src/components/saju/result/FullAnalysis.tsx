"use client";

import { Lock } from "lucide-react";
import type { SajuAnalysis, SajuReading } from "@/types/saju";
import MonthlyFortuneGrid from "./MonthlyFortuneGrid";
import LuckyElements from "./LuckyElements";

interface FullAnalysisProps {
  analysis: SajuAnalysis;
  reading: SajuReading;
  /**
   * 결제 전이면 앞부분만 보여주고 나머지는 잠근다.
   * 결제 후(또는 유료 결과지)에는 전체가 열린다.
   */
  locked?: boolean;
  /** 잠긴 영역 아래에 붙일 결제 버튼 */
  paywall?: React.ReactNode;
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="reading-card rounded-2xl p-6">
      <h3 className="reading-heading mb-3 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Paragraph({ text }: { text: string }) {
  return <p className="reading-body whitespace-pre-line">{text}</p>;
}

/** 결제 전에도 보여주는 부분 — 맛보기 */
const FREE_SECTIONS = [
  { key: "personality" as const, title: "성격/기질" },
] as const;

/** 결제 후 열리는 부분 */
const PAID_SECTIONS = [
  { key: "love" as const, title: "연애/결혼운" },
  { key: "wealth" as const, title: "재물/금전운" },
  { key: "career" as const, title: "직업/사업운" },
  { key: "health" as const, title: "건강운" },
  { key: "yearlyFortune" as const, title: "2026년 총운" },
] as const;

/**
 * 기존에는 6개 필드만 렌더하고 overview·tenGods·majorCycles·relationship·
 * actionAdvice·closingMessage는 계산해두고 버리고 있었다. 전부 표시한다.
 */
const DEEP_SECTIONS = [
  { key: "tenGods" as const, title: "십신 분석" },
  { key: "majorCycles" as const, title: "대운 흐름" },
  { key: "relationship" as const, title: "대인관계·사회운" },
  { key: "selfManagement" as const, title: "자기관리·생활습관" },
  { key: "socialLife" as const, title: "사회생활" },
  { key: "studyAptitude" as const, title: "학업·적성" },
  { key: "cautionPeriods" as const, title: "주의 시기" },
  { key: "actionAdvice" as const, title: "실천 조언" },
] as const;

export default function FullAnalysis({
  analysis,
  reading,
  locked = false,
  paywall,
}: FullAnalysisProps) {
  void reading;

  return (
    <div className="reading-surface flex flex-col gap-4">
      {analysis.overview && (
        <SectionCard title="총론">
          <Paragraph text={analysis.overview} />
        </SectionCard>
      )}

      {FREE_SECTIONS.map(({ key, title }) =>
        analysis[key] ? (
          <SectionCard key={key} title={title}>
            <Paragraph text={analysis[key]} />
          </SectionCard>
        ) : null,
      )}

      {locked ? (
        /* 자물쇠는 한 번만. 결제 버튼도 이 카드 안에 넣어 힘을 모은다. */
        <LockedPreview
          teasers={analysis.lockedTeasers}
          volume={analysis.lockedVolume}
          paywall={paywall}
        />
      ) : (
        <>
          {PAID_SECTIONS.map(({ key, title }) =>
            analysis[key] ? (
              <SectionCard key={key} title={title}>
                <Paragraph text={analysis[key]} />
              </SectionCard>
            ) : null,
          )}

          <SectionCard title="월별 운세">
            <MonthlyFortuneGrid monthlyFortune={analysis.monthlyFortune} />
          </SectionCard>

          <SectionCard title="행운 요소">
            <LuckyElements luckyElements={analysis.luckyElements} />
          </SectionCard>

          {DEEP_SECTIONS.map(({ key, title }) => {
            const text = analysis[key];
            return text ? (
              <SectionCard key={key} title={title}>
                <Paragraph text={text} />
              </SectionCard>
            ) : null;
          })}

          {analysis.summary && (
            <SectionCard title="종합 코멘트">
              <Paragraph text={analysis.summary} />
            </SectionCard>
          )}

          {analysis.closingMessage && (
            <SectionCard title="맺음말">
              <Paragraph text={analysis.closingMessage} />
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}

/**
 * 잠긴 영역.
 *
 * 예전에는 "연애/결혼운, 재물운 …" 처럼 항목 이름만 나열했다.
 * 그건 목차일 뿐이라 궁금증을 만들지 못한다. 이미 맞힌 진단을 먼저 보여주고
 * 해석을 끊어, 뒷문장을 보고 싶게 만든다.
 */
function LockedPreview({
  teasers,
  volume,
  paywall,
}: {
  teasers?: { headline: string; cutoff: string }[];
  volume?: { chars: number; sections: number };
  paywall?: React.ReactNode;
}) {
  return (
    <div className="reading-card rounded-2xl p-6">
      <div className="mb-1 flex items-center gap-2">
        <Lock className="h-4 w-4" style={{ color: "var(--read-accent)" }} />
        <h3 className="reading-heading text-lg font-semibold">
          이 사주에서 발견된 것
        </h3>
      </div>

      {teasers && teasers.length > 0 ? (
        <>
          <p className="reading-muted mb-5">
            아래는 {volume ? "전체 분석" : "분석"}에서 실제로 잡힌 내용입니다.
          </p>

          <ul className="flex flex-col gap-4">
            {teasers.map((t) => (
              <li
                key={t.headline}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "var(--read-accent-soft)",
                  border: "1px solid color-mix(in srgb, var(--read-accent) 20%, transparent)",
                }}
              >
                <p className="reading-body !text-[15px] font-semibold">{t.headline}</p>
                {/* 문장을 끊고 흐리게 처리 — 뒷말이 유료 */}
                <p className="reading-muted mt-1.5">
                  {t.cutoff}
                  <span
                    className="ml-1 align-middle"
                    style={{
                      color: "transparent",
                      textShadow: "0 0 7px var(--read-body)",
                      userSelect: "none",
                    }}
                    aria-hidden="true"
                  >
                    결제 후 확인하실 수 있습니다
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="reading-muted mb-5">
          결제하면 아래 항목이 모두 열립니다.
        </p>
      )}

      {volume && (
        <div
          className="mt-5 flex flex-wrap gap-x-5 gap-y-1 rounded-xl px-4 py-3"
          style={{ border: "1px solid var(--read-border)" }}
        >
          <Stat label="분량" value={`약 ${volume.chars.toLocaleString("ko-KR")}자`} />
          <Stat label="항목" value={`${volume.sections}개`} />
          <Stat label="월별 운세" value="12개월" />
        </div>
      )}

      {paywall && <div className="mt-5">{paywall}</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="reading-muted !text-xs">{label}</span>
      <span className="reading-body !text-sm font-semibold">{value}</span>
    </div>
  );
}
