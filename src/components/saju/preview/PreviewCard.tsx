"use client";

import { Lock } from "lucide-react";
import FiveElementChart from "./FiveElementChart";
import type { SajuReading } from "@/types/saju";

interface PreviewCardProps {
  reading: SajuReading;
}

const LOCKED_SECTIONS = [
  "2026년 연간 운세",
  "월별 운세",
  "재물운 분석",
  "연애/결혼운",
  "직업/사업운",
  "건강운",
];

function PillarDisplay({ reading }: { reading: SajuReading }) {
  const fp = reading.four_pillars;
  if (!fp) return null;

  const pillars = [
    { label: "시주", pillar: fp.hour },
    { label: "일주", pillar: fp.day },
    { label: "월주", pillar: fp.month },
    { label: "년주", pillar: fp.year },
  ];

  return (
    <div className="flex justify-center gap-3">
      {pillars.map(({ label, pillar }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-xs mb-1 text-[#958ea0]">{label}</span>
          <div className="flex flex-col items-center rounded-lg px-4 py-3 min-w-[56px]" style={{ backgroundColor: '#1f1f25' }}>
            <span className="text-lg font-bold text-[#e4e1e9]">
              {pillar.heavenlyStem}
            </span>
            <span className="text-lg font-bold text-[#e4e1e9]">
              {pillar.earthlyBranch}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlurredSection({ title }: { title: string }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-[#958ea0]" />
        <h3 className="text-base font-bold text-[#e4e1e9]">{title}</h3>
      </div>
      <div className="select-none pointer-events-none blur-[6px] text-sm leading-relaxed text-[#cac4d0]">
        이 섹션의 상세한 분석 내용은 결제 후 확인하실 수 있습니다. 사주팔자에
        기반한 깊이 있는 해석과 실질적인 조언을 제공합니다.
      </div>
    </div>
  );
}

export default function PreviewCard({ reading }: PreviewCardProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 이름 + 사주팔자 */}
      <div className="glass-panel rounded-2xl p-6" style={{ borderColor: 'rgba(73,68,84,0.2)' }}>
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold mb-1 text-[#e4e1e9]" style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>
            {reading.name}님의 사주
          </h2>
          <p className="text-sm text-[#958ea0]">
            {reading.birth_year}년 {reading.birth_month}월 {reading.birth_day}일
            {reading.birth_hour !== null && ` ${reading.birth_hour}시`}
            {reading.is_lunar && " (음력)"}
          </p>
        </div>
        <PillarDisplay reading={reading} />
      </div>

      {/* 오행 차트 */}
      {reading.five_elements && (
        <div className="glass-panel rounded-2xl p-6" style={{ borderColor: 'rgba(73,68,84,0.2)' }}>
          <h3 className="text-base font-bold text-[#e4e1e9] mb-4">
            오행 분포
          </h3>
          <FiveElementChart elements={reading.five_elements} />
        </div>
      )}

      {/* 성격 요약 (공개) */}
      {reading.preview_summary && (
        <div className="glass-panel rounded-2xl p-6" style={{ borderColor: 'rgba(73,68,84,0.2)' }}>
          <h3 className="text-base font-bold text-[#e4e1e9] mb-3">
            성격 분석
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line text-[#cac4d0]">
            {reading.preview_summary}
          </p>
        </div>
      )}

      {/* 블러 처리된 유료 섹션들 */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6" style={{ borderColor: 'rgba(73,68,84,0.2)' }}>
        {LOCKED_SECTIONS.map((title) => (
          <BlurredSection key={title} title={title} />
        ))}
      </div>
    </div>
  );
}
