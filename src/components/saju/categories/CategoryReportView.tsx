"use client";

import { useMemo } from "react";
import type { CategoryReport } from "@/lib/saju/category-analysis";
import TermText, { planAnnotations } from "@/components/saju/categories/TermText";
import { GLOSSARY, buildTermPattern, termKeyOf } from "@/lib/saju/glossary";

const TONE_STYLE: Record<
  CategoryReport["verdictTone"],
  { label: string; color: string }
> = {
  positive: { label: "가능성 있음", color: "var(--read-tone-positive)" },
  caution: { label: "주의 필요", color: "var(--read-tone-caution)" },
  neutral: { label: "조건부", color: "var(--read-tone-neutral)" },
};

const TIMING_COLOR = {
  good: "var(--read-tone-positive)",
  caution: "var(--read-tone-caution)",
  neutral: "var(--read-tone-neutral)",
} as const;

export default function CategoryReportView({
  report,
  locked = false,
  paywall,
}: {
  report: CategoryReport;
  /** 결제 전이면 결론만 보여주고 나머지는 목차와 결제 버튼으로 대신한다 */
  locked?: boolean;
  paywall?: React.ReactNode;
}) {
  const tone = TONE_STYLE[report.verdictTone];

  // 화면에 나오는 순서대로 문장을 모아, 용어 설명을 첫 등장에만 붙이도록 계획한다.
  const { plan, index, usedTerms } = useMemo(() => {
    const texts: string[] = [report.verdict];
    const idx: Record<string, number> = { verdict: 0 };

    idx.evidence = texts.length;
    report.evidence.forEach((e) => texts.push(e));

    idx.sections = texts.length;
    const paras: string[][] = report.sections.map((sec) =>
      sec.body.split("\n\n").filter((t) => t.trim())
    );
    paras.forEach((ps) => ps.forEach((t) => texts.push(t)));

    idx.timing = texts.length;
    report.timing.forEach((t) => texts.push(t.note));

    idx.actions = texts.length;
    report.actions.forEach((a) => texts.push(a));

    // 이 리포트에 실제로 등장한 용어 목록 (하단 사전용)
    const used: string[] = [];
    const seen = new Set<string>();
    texts.forEach((text) => {
      const pattern = buildTermPattern();
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const key = termKeyOf(m[0]);
        if (key && !seen.has(key)) {
          seen.add(key);
          used.push(key);
        }
      }
    });

    return { plan: planAnnotations(texts), index: idx, usedTerms: used };
  }, [report]);

  const sectionParas = useMemo(
    () => report.sections.map((sec) => sec.body.split("\n\n").filter((t) => t.trim())),
    [report]
  );

  let sectionCursor = index.sections;

  return (
    <section className="reading-surface flex flex-col gap-5">
      {/* 결론 */}
      <div
        className="rounded-2xl border p-6"
        style={{
          borderColor: `color-mix(in srgb, ${tone.color} 35%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${tone.color} 7%, transparent)`,
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="reading-accent text-xs font-semibold">상담 주제</span>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{
              color: tone.color,
              backgroundColor: `color-mix(in srgb, ${tone.color} 14%, transparent)`,
            }}
          >
            {tone.label}
          </span>
        </div>
        <h2
          className="mt-2 reading-heading text-xl font-bold"
          style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
        >
          {report.name}
          <span className="ml-2 reading-muted text-xs font-medium">{report.subtitle}</span>
        </h2>
        <p className="reading-strong mt-4">
          <TermText text={report.verdict} allow={plan[0]} />
        </p>
      </div>

      {/*
        결제 전: 결론만 무료로 보여준다. 예전엔 고민 상담의 본 내용(근거·본문·시기·할 일)이
        결제 없이 전부 보였다.
      */}
      {locked ? (
        <div className="reading-card rounded-2xl p-6">
          <h3 className="reading-heading text-base font-bold">결제하면 열리는 내용</h3>
          <ul className="reading-muted mt-3 flex flex-col gap-1.5 text-sm">
            <li>· 이 판단의 사주 근거 ({report.evidence.length}가지)</li>
            {report.sections.map((section) => (
              <li key={section.heading}>· {section.heading}</li>
            ))}
            {report.timing.length > 0 && <li>· 시기 — 월별 판단</li>}
            <li>· 지금 할 일 ({report.actions.length}가지)</li>
          </ul>
          {paywall && <div className="mt-5">{paywall}</div>}
        </div>
      ) : (
      <>
      {/* 근거 */}
      <div className="reading-card rounded-2xl p-6">
        <h3 className="reading-accent text-sm font-bold">이 판단의 사주 근거</h3>
        <ul className="mt-4 flex flex-col gap-3.5">
          {report.evidence.map((line, i) => (
            <li key={i} className="reading-body flex gap-3">
              <span
                aria-hidden="true"
                className="mt-[9px] h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--read-accent)]"
              />
              <span>
                <TermText text={line} allow={plan[index.evidence + i]} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 본문 섹션 */}
      {report.sections.map((section, si) => (
        <div
          key={section.heading}
          className="reading-card rounded-2xl p-6"
        >
          <h3
            className="reading-heading text-base font-bold"
            style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
          >
            {section.heading}
          </h3>
          {sectionParas[si].map((para, i) => {
            const at = sectionCursor++;
            return (
              <p key={i} className="reading-body mt-3.5">
                <TermText text={para} allow={plan[at]} />
              </p>
            );
          })}
        </div>
      ))}

      {/* 시기 */}
      {report.timing.length > 0 && (
        <div className="reading-card rounded-2xl p-6">
          <h3 className="reading-heading text-base font-bold">시기 — 월별 판단</h3>
          <p className="reading-muted mt-1 text-xs">
            절기 기준입니다. 월초에는 앞 달의 기운이 남아 있을 수 있습니다.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {report.timing.map((t, i) => (
              <li key={t.label} className="flex gap-3.5">
                <span
                  className="mt-0.5 h-fit flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold"
                  style={{
                    color: TIMING_COLOR[t.tone],
                    backgroundColor: `color-mix(in srgb, ${TIMING_COLOR[t.tone]} 13%, transparent)`,
                  }}
                >
                  {t.label}
                </span>
                <span className="reading-body">
                  <TermText text={t.note} allow={plan[index.timing + i]} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 용어 사전 */}
      {usedTerms.length > 0 && (
        <details className="group reading-card rounded-2xl p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <span className="reading-heading text-base font-bold">
              모르는 말이 있었나요?
            </span>
            <span className="reading-accent text-xs font-semibold group-open:hidden">
              용어 {usedTerms.length}개 보기
            </span>
            <span className="hidden reading-muted text-xs font-semibold group-open:inline">
              접기
            </span>
          </summary>
          <p className="reading-muted mt-2 text-xs">
            이 결과지에 나온 사주 용어만 모았습니다.
          </p>
          <dl className="mt-4 flex flex-col gap-4">
            {usedTerms.map((term) => (
              <div key={term}>
                <dt className="reading-accent text-sm font-bold">
                  {term}
                  <span className="ml-2 reading-muted text-xs font-medium">
                    {GLOSSARY[term].short}
                  </span>
                </dt>
                <dd className="reading-muted mt-1">
                  {GLOSSARY[term].full}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {/* 실행 */}
      <div className="reading-card rounded-2xl p-6">
        <h3 className="reading-heading text-base font-bold">지금 할 일</h3>
        <ol className="mt-4 flex flex-col gap-3">
          {report.actions.map((a, i) => (
            <li key={i} className="reading-body flex gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--read-accent-soft)] text-[11px] font-bold text-[color:var(--read-accent)]">
                {i + 1}
              </span>
              <span>
                <TermText text={a} allow={plan[index.actions + i]} />
              </span>
            </li>
          ))}
        </ol>
      </div>
      </>
      )}
    </section>
  );
}
