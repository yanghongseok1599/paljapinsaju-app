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
        <>
          <LockedPreview />
          {paywall}
        </>
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

/** 잠긴 영역 — 무엇이 열리는지 목록으로 보여준다 */
function LockedPreview() {
  const items = [
    "연애/결혼운",
    "재물/금전운",
    "직업/사업운",
    "건강운",
    "2026년 총운",
    "월별 운세 12개월",
    "행운 요소",
    "십신 분석",
    "대운 흐름",
    "대인관계·사회운",
    "실천 조언",
  ];

  return (
    <div className="reading-card relative overflow-hidden rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-4 w-4" style={{ color: "var(--read-accent)" }} />
        <h3 className="reading-heading text-lg font-semibold">
          결제하면 열리는 항목
        </h3>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="reading-body flex items-center gap-2 !text-sm">
            <span
              aria-hidden="true"
              className="h-1 w-1 flex-shrink-0 rounded-full"
              style={{ backgroundColor: "var(--read-accent)" }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
