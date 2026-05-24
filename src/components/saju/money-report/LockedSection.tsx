"use client";

import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface LockedSectionProps {
  number: number;
  title: string;
  teaser: string;          // 한 줄 미리보기
  previewLines?: string[]; // 블러 처리된 가짜 본문 (몇 줄)
  badge?: string;          // 예: 'MBTI 입력 필요'
  height?: number;         // 본문 영역 최소 높이 (디자인 일관성)
}

const DEFAULT_LINES = [
  "이 영역에는 사용자의 사주 데이터를 바탕으로 한 상세한 분석이 들어갑니다.",
  "구체적인 시기, 금액, 직업, 행동 가이드가 포함됩니다.",
  "잠금을 해제하면 평생 동안 다시 볼 수 있습니다.",
  "함께 표시되는 그래프와 표는 본인의 사주 그래프와 1:1로 매핑됩니다.",
];

export default function LockedSection({
  number,
  title,
  teaser,
  previewLines,
  badge,
  height = 160,
}: LockedSectionProps) {
  const lines = previewLines ?? DEFAULT_LINES;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border border-[#d0bcff]/15 bg-[#1f1f25]/70 backdrop-blur-md p-5 md:p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-widest uppercase text-[#d0bcff]/60 mb-1">
            #{String(number).padStart(2, "0")} · Premium
          </p>
          <h3 className="text-base md:text-lg font-bold text-white">{title}</h3>
          <p className="text-xs md:text-sm text-[#cbc3d7]/80 mt-1.5 leading-relaxed">
            {teaser}
          </p>
        </div>
        {badge ? (
          <span className="ml-3 shrink-0 text-[10px] px-2 py-1 rounded-full bg-[#ffb95f]/15 text-[#ffb95f] border border-[#ffb95f]/20">
            {badge}
          </span>
        ) : (
          <Lock className="ml-3 shrink-0 w-4 h-4 text-[#d0bcff]/50" aria-hidden />
        )}
      </div>

      {/* Blurred body */}
      <div
        className="relative rounded-xl bg-[#131318]/60 px-4 py-3 select-none"
        style={{ minHeight: height }}
        aria-hidden
      >
        <div
          className="text-[13px] leading-relaxed text-[#cbc3d7]/70"
          style={{ filter: "blur(6px)", userSelect: "none" }}
        >
          {lines.map((l, i) => (
            <p key={i} className="mb-1.5">
              {l}
            </p>
          ))}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={() =>
              toast("프리미엄 잠금 해제는 곧 열릴 예정이에요 ✨", {
                description: "이 영역은 현재 미리보기 상태입니다.",
              })
            }
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#3c0091] text-xs font-bold shadow-lg shadow-[#d0bcff]/15 hover:shadow-xl hover:shadow-[#d0bcff]/25 transition-shadow"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden />
            잠금 해제하기
          </button>
        </div>
      </div>
    </motion.section>
  );
}
