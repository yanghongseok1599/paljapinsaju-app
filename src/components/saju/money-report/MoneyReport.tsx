"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Sparkles, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import LockedSection from "./LockedSection";
import MbtiPrompt, { type BloodType } from "./MbtiPrompt";
import {
  estimateLifetimeWealth,
  formatKRW,
  getElementProfile,
  getEarningStyle,
  getRichDNA,
} from "@/lib/saju/money-report";
import type { FourPillarsDetail, FiveElementDistribution } from "@/types/saju";

interface MoneyReportProps {
  name: string;
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
}

export default function MoneyReport({ name, pillars, elements }: MoneyReportProps) {
  const [mbti, setMbti] = useState<string | null>(null);
  const [blood, setBlood] = useState<BloodType | null>(null);
  const hasProfile = !!mbti || !!blood;

  const wealth = estimateLifetimeWealth(pillars, elements);
  const elementProfile = getElementProfile(pillars, elements);
  const earningStyle = getEarningStyle(pillars);
  const dna = getRichDNA(pillars, elements);

  const handleShare = async () => {
    const text = `${name}님의 평생 재물운: ${formatKRW(wealth.amount)} (${wealth.label})\n— 팔자핀사주`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "내 평생 재물운", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("결과가 복사됐어요");
      }
    } catch {
      // user cancel
    }
  };

  return (
    <section className="flex flex-col gap-4 md:gap-5 font-['Pretendard']">
      {/* Header */}
      <div className="text-center mb-2">
        <p className="text-[10px] tracking-widest uppercase text-[#d0bcff]/60 mb-2">
          ✦ Wealth Report
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          {name}님의 <span className="bg-gradient-to-r from-[#d0bcff] to-[#a078ff] bg-clip-text text-transparent">재물운 보고서</span>
        </h2>
        <p className="mt-2 text-xs md:text-sm text-[#cbc3d7]/70">
          무료 4개 · 프리미엄 14개 · MBTI 결합 분석
        </p>
      </div>

      {/* ─── 1. 평생 재물운 금액 카드 ─── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(208,188,255,0.18) 0%, rgba(160,120,255,0.12) 100%)",
          border: "1px solid rgba(208,188,255,0.3)",
        }}
      >
        {/* glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #d0bcff 0%, transparent 70%)" }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="text-[10px] tracking-widest uppercase text-[#d0bcff]">
              #01 · 평생 재물운
            </p>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              aria-label="공유"
            >
              <Share2 className="w-3.5 h-3.5" />
              공유
            </button>
          </div>

          <p className="text-sm text-[#cbc3d7]/90 mb-2">{wealth.label}</p>
          <div className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {formatKRW(wealth.amount)}
          </div>
          <p className="mt-3 text-xs md:text-sm text-[#cbc3d7]/80 leading-relaxed">
            사주가 가진 일간·오행 균형·재물 친화 오행을 종합한 추정치예요. 동일한 사주는 항상 같은 값이 나옵니다.
          </p>
        </div>
      </motion.section>

      {/* ─── 2. 오행 프로필 ─── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-[#d0bcff]/15 bg-[#1f1f25]/70 backdrop-blur-md p-5 md:p-6"
      >
        <p className="text-[10px] tracking-widest uppercase text-[#d0bcff]/60 mb-1">
          #02 · MZ가 열광하는 오행 타입
        </p>
        <div className="flex items-start gap-4 mt-3">
          <div className="text-5xl md:text-6xl shrink-0">{elementProfile.emoji}</div>
          <div className="min-w-0">
            <h3 className="text-xl md:text-2xl font-black text-white">{elementProfile.type}</h3>
            <p className="text-sm text-[#d0bcff] font-bold mb-2">{elementProfile.korTag}</p>
            <p className="text-sm text-[#cbc3d7] leading-relaxed">{elementProfile.vibe}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {elementProfile.strengths.map((s) => (
                <span key={s} className="text-[11px] px-2 py-1 rounded-full bg-[#d0bcff]/10 text-[#d0bcff]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── 3. 돈 버는 스타일 ─── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-[#d0bcff]/15 bg-[#1f1f25]/70 backdrop-blur-md p-5 md:p-6"
      >
        <p className="text-[10px] tracking-widest uppercase text-[#d0bcff]/60 mb-1">
          #03 · 돈 버는 스타일
        </p>
        <h3 className="text-xl md:text-2xl font-black text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#d0bcff]" />
          {earningStyle.headline}
        </h3>
        <p className="text-sm text-[#cbc3d7] leading-relaxed mb-4">{earningStyle.description}</p>

        <div className="mb-4">
          <p className="text-xs text-[#d0bcff] mb-2 font-semibold">잘 맞는 영역</p>
          <div className="flex flex-wrap gap-2">
            {earningStyle.bestPaths.map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 rounded-md bg-[#131318] border border-[#d0bcff]/20 text-white">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[#ffb95f]/10 border border-[#ffb95f]/20 px-3 py-2.5">
          <p className="text-xs text-[#ffb95f] font-semibold mb-0.5">⚠️ 주의</p>
          <p className="text-[12px] text-[#cbc3d7]">{earningStyle.warning}</p>
        </div>
      </motion.section>

      {/* ─── 4. 부자 DNA (능력치 차트) ─── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-[#d0bcff]/15 bg-[#1f1f25]/70 backdrop-blur-md p-5 md:p-6"
      >
        <p className="text-[10px] tracking-widest uppercase text-[#d0bcff]/60 mb-1">
          #04 · 부자 DNA
        </p>
        <h3 className="text-xl md:text-2xl font-black text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#d0bcff]" />
          사주에 새겨진 재물 능력치
        </h3>
        <p className="text-sm text-[#cbc3d7] mb-5">
          가장 두드러진 능력은{" "}
          <span className="font-bold text-[#d0bcff]">{dna.topAxis}</span>이에요.
        </p>

        <DnaRadar axes={dna.axes} />

        <div className="mt-4 grid grid-cols-5 gap-2">
          {dna.axes.map((a) => (
            <div key={a.key} className="text-center">
              <p className="text-[10px] text-[#cbc3d7]/70">{a.label}</p>
              <p className="text-sm font-bold text-white">{a.value}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─── 구분선 ─── */}
      <div className="my-3 flex items-center gap-3 text-[#d0bcff]/40 text-xs tracking-widest uppercase">
        <span className="flex-1 h-px bg-[#d0bcff]/15" />
        Premium Sections
        <span className="flex-1 h-px bg-[#d0bcff]/15" />
      </div>

      {/* 프로필 입력 (5번 섹션 활성화 키 — MBTI 또는 혈액형) */}
      <MbtiPrompt mbti={mbti} blood={blood} onMbtiChange={setMbti} onBloodChange={setBlood} />

      {/* ─── 5. MBTI × 혈액형 × 사주 (조건부) ─── */}
      {hasProfile ? (
        (() => {
          const inputs = [
            mbti && `MBTI ${mbti}`,
            blood && `${blood}형`,
          ].filter(Boolean).join(" · ");
          const stem = pillars.day?.heavenlyStem ?? "";
          const has3 = !!mbti && !!blood;
          return (
            <LockedSection
              number={5}
              title={`${inputs} × 사주 — 재물 성향 결합 분석`}
              teaser={
                has3
                  ? `3중 조합(${mbti} × ${blood}형 × 일간 ${stem})으로 가장 깊이 풀어드려요.`
                  : `${inputs}와 일간 ${stem}의 시너지를 풀어드려요. 나머지 하나를 더 입력하면 3중 조합 분석으로 강화돼요.`
              }
              badge={has3 ? "3중 조합 ✓" : "프로필 1/2 ✓"}
              previewLines={[
                `${inputs}의 사고/행동 특성을 사주 일간 ${stem}과 교차합니다.`,
                "돈을 굴리는 회로의 강점·함정·궁합 좋은 결정 패턴을 짚어드려요.",
                has3
                  ? "MBTI × 혈액형 × 사주 = 640가지 조합 중 당신만의 패턴."
                  : "나머지 정보까지 입력하면 3중 조합 분석이 잠금 해제 시 표시됩니다.",
              ]}
            />
          );
        })()
      ) : (
        <LockedSection
          number={5}
          title="MBTI × 혈액형 × 사주 — 재물 성향 결합 분석"
          teaser="MBTI나 혈액형을 위에 입력하면 이 섹션이 활성화됩니다."
          badge="프로필 입력 필요"
          previewLines={[
            "MBTI 16가지 × 혈액형 4가지 × 일간 10천간 = 640가지 조합 분석.",
            "사고 방식과 본능적 반응이 사주의 재물 패턴과 만나면 어떤 시너지가 나는지.",
            "본인이 자주 빠지는 함정과 강점을 동시에 짚어드립니다.",
          ]}
        />
      )}

      {/* ─── 6 ~ 18. 프리미엄 잠금 섹션 ─── */}
      <LockedSection
        number={6}
        title="2026년 재물운"
        teaser="올해 한 해 동안 들어오는 돈의 흐름과 크기."
        previewLines={[
          "2026년 세운(歲運)을 일간과 대조해 흐름을 그립니다.",
          "큰 기회가 오는 분기와 조심해야 할 시기를 미리.",
        ]}
      />

      <LockedSection
        number={7}
        title="2026년 월별 재물운 (12개월)"
        teaser="어느 달에 돈이 들어오고, 어느 달에 새는지."
        previewLines={[
          "1월부터 12월까지 월운(月運)을 시각화.",
          "월별 추천 액션과 피해야 할 결정.",
        ]}
        height={200}
      />

      <LockedSection
        number={8}
        title="주의할 시기"
        teaser="돈을 잃기 쉬운 위험 구간을 미리 알려드려요."
        previewLines={[
          "충(沖)·형(刑)이 강하게 들어오는 달과 연도.",
          "결제·계약·투자를 미루는 게 좋은 구간.",
        ]}
      />

      <LockedSection
        number={9}
        title="10년 단위 재물운 흐름 (대운)"
        teaser="인생 구간별로 어디서 가장 잘 벌었고, 잘 벌게 될지."
        previewLines={[
          "20대 / 30대 / 40대 / 50대 / 60대 대운 흐름.",
          "가장 큰 도약 구간과 정체 구간 매핑.",
        ]}
        height={200}
      />

      <LockedSection
        number={10}
        title="직업 적성 분석"
        teaser="당신의 사주에 가장 잘 맞는 직군 TOP 5."
        previewLines={[
          "사주의 십신 구조에서 도출한 직업 적합도.",
          "추천 직군별 진입 난이도와 보상 구조.",
        ]}
      />

      <LockedSection
        number={11}
        title="투자 성향 분석"
        teaser="당신에게 맞는 투자 방식 — 공격형, 안정형, 분산형?"
        previewLines={[
          "사주의 리스크 허용도와 의사결정 패턴.",
          "주식 / 부동산 / 코인 / 사업 중 어느 쪽이 잘 맞는지.",
        ]}
      />

      <LockedSection
        number={12}
        title="소비 패턴 분석"
        teaser="돈이 어디로 새는지, 소비 습관의 구조."
        previewLines={[
          "자주 빠지는 소비 함정 카테고리.",
          "줄이면 1년에 얼마가 모이는지 시뮬레이션.",
        ]}
      />

      <LockedSection
        number={13}
        title="인간관계와 돈"
        teaser="사람 때문에 돈을 잃거나 벌 가능성 분석."
        previewLines={[
          "당신의 사주에서 재물을 키워주는 인연 유형.",
          "조심해야 할 관계 패턴과 신호.",
        ]}
      />

      <LockedSection
        number={14}
        title="재물 궁합 — 함께하면 돈이 되는 띠"
        teaser="비즈니스 파트너 / 동업자로 좋은 띠와 일간."
        previewLines={[
          "12지지 기준 재물 시너지 매핑.",
          "BEST 3 / WORST 3 띠와 그 이유.",
        ]}
      />

      <LockedSection
        number={15}
        title="성격 심층 분석"
        teaser="사주로 본 연애 · 일 · 스트레스 스타일."
        previewLines={[
          "관계 모드 / 일 모드 / 위기 모드의 행동 패턴.",
          "본인도 모르던 무의식 작동 방식.",
        ]}
        height={200}
      />

      <LockedSection
        number={16}
        title="오행 밸런스 — 보완 방향"
        teaser="당신에게 부족한 기운과 재물운을 높이는 조정법."
        previewLines={[
          "오행 분포의 강약과 그 의미.",
          "일상에서 보완할 수 있는 구체적 행동 가이드.",
        ]}
      />

      <LockedSection
        number={17}
        title="나만의 행운 가이드"
        teaser="재물운을 높이는 색 · 숫자 · 방향 · 음식 · 아이템."
        previewLines={[
          "본인 일간에 맞는 럭키 컬러와 럭키 넘버.",
          "지갑 · 책상 · 침실 배치 팁.",
        ]}
      />

      <LockedSection
        number={18}
        title="사주 팔자 원본 + 일간 설명"
        teaser="당신의 사주팔자 원본과 일간(日干) 풀이."
        previewLines={[
          "년주 / 월주 / 일주 / 시주 8자 원본.",
          "일간이 의미하는 자기 본질의 해석.",
        ]}
      />

      {/* Footer note */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#cbc3d7]/50">
        <Target className="w-3.5 h-3.5" />
        <span>이 보고서는 사주 기반 추정이며, 단정적 예언이 아닙니다.</span>
      </div>
    </section>
  );
}

// ─── Radar Chart (SVG, 5축) ─────────────────────────────────
function DnaRadar({ axes }: { axes: Array<{ label: string; value: number }> }) {
  const size = 240;
  const center = size / 2;
  const radius = 90;
  const n = axes.length;

  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const pointAt = (i: number, valuePct: number) => {
    const a = angleFor(i);
    const r = radius * (valuePct / 100);
    return [center + r * Math.cos(a), center + r * Math.sin(a)] as const;
  };

  const dataPath = axes
    .map((ax, i) => {
      const [x, y] = pointAt(i, ax.value);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ") + " Z";

  const rings = [25, 50, 75, 100];

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="부자 DNA 능력치 차트">
        {/* rings */}
        {rings.map((pct) => (
          <polygon
            key={pct}
            points={Array.from({ length: n }, (_, i) => {
              const [x, y] = pointAt(i, pct);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(" ")}
            fill="none"
            stroke="rgba(208,188,255,0.12)"
            strokeWidth={1}
          />
        ))}
        {/* axes */}
        {axes.map((_, i) => {
          const [x, y] = pointAt(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(208,188,255,0.15)"
              strokeWidth={1}
            />
          );
        })}
        {/* data */}
        <path
          d={dataPath}
          fill="url(#dnaGrad)"
          fillOpacity={0.45}
          stroke="#d0bcff"
          strokeWidth={2}
        />
        {/* dots */}
        {axes.map((ax, i) => {
          const [x, y] = pointAt(i, ax.value);
          return <circle key={i} cx={x} cy={y} r={3} fill="#d0bcff" />;
        })}
        {/* labels */}
        {axes.map((ax, i) => {
          const [x, y] = pointAt(i, 122);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="#cbc3d7"
              style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 600 }}
            >
              {ax.label}
            </text>
          );
        })}
        <defs>
          <linearGradient id="dnaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d0bcff" />
            <stop offset="100%" stopColor="#a078ff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
