"use client";

import { useState } from "react";

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export type BloodType = "A" | "B" | "O" | "AB";
const BLOOD_TYPES: BloodType[] = ["A", "B", "O", "AB"];

interface MbtiPromptProps {
  mbti: string | null;
  blood: BloodType | null;
  onMbtiChange: (v: string | null) => void;
  onBloodChange: (v: BloodType | null) => void;
}

export default function MbtiPrompt({ mbti, blood, onMbtiChange, onBloodChange }: MbtiPromptProps) {
  const [openMbti, setOpenMbti] = useState(false);
  const hasAny = !!mbti || !!blood;

  return (
    <div className="rounded-2xl border border-[#d0bcff]/15 bg-[#1f1f25]/70 backdrop-blur-md p-5 md:p-6">
      <div className="mb-4">
        <p className="text-[10px] tracking-widest uppercase text-[#d0bcff]/60 mb-1">
          MBTI × 혈액형 × 사주
        </p>
        <h3 className="text-base md:text-lg font-bold text-white">
          {hasAny ? "5번 섹션이 활성화됐어요" : "정보를 더 주면 분석이 깊어져요"}
        </h3>
        <p className="text-xs md:text-sm text-[#cbc3d7]/80 mt-1.5 leading-relaxed">
          {hasAny
            ? "둘 다 입력하면 'MBTI × 혈액형 × 사주' 3중 조합 분석이 됩니다."
            : "MBTI나 혈액형 중 하나만 입력해도 5번 섹션이 잠금 해제 우선 대상이 됩니다."}
        </p>
      </div>

      {/* MBTI row */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <span className="text-sm text-[#cbc3d7] font-semibold">
            MBTI {mbti ? <span className="text-[#d0bcff]">· {mbti}</span> : <span className="text-[#cbc3d7]/40">미입력</span>}
          </span>
          <button
            onClick={() => setOpenMbti((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-[#d0bcff]/10 border border-[#d0bcff]/30 text-[#d0bcff] text-xs font-semibold hover:bg-[#d0bcff]/20 transition-colors"
          >
            {openMbti ? "닫기" : mbti ? "변경" : "선택"}
          </button>
        </div>

        {openMbti && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {MBTI_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  onMbtiChange(t);
                  setOpenMbti(false);
                }}
                className={`px-2 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  mbti === t
                    ? "bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#3c0091]"
                    : "bg-[#131318] border border-[#d0bcff]/15 text-[#cbc3d7] hover:border-[#d0bcff]/40 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
            {mbti && (
              <button
                onClick={() => {
                  onMbtiChange(null);
                  setOpenMbti(false);
                }}
                className="col-span-4 mt-1 px-3 py-2 rounded-lg text-xs text-[#cbc3d7]/60 hover:text-rose-300 transition-colors"
              >
                MBTI 입력 취소
              </button>
            )}
          </div>
        )}
      </div>

      {/* Blood row (항상 인라인, MBTI보다 부담 작은 4지선다라 토글 안 함) */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <span className="text-sm text-[#cbc3d7] font-semibold">
            혈액형 {blood ? <span className="text-[#d0bcff]">· {blood}형</span> : <span className="text-[#cbc3d7]/40">미입력</span>}
          </span>
          {blood && (
            <button
              onClick={() => onBloodChange(null)}
              className="text-xs text-[#cbc3d7]/50 hover:text-rose-300 transition-colors"
            >
              입력 취소
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {BLOOD_TYPES.map((b) => (
            <button
              key={b}
              onClick={() => onBloodChange(b)}
              className={`px-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                blood === b
                  ? "bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#3c0091]"
                  : "bg-[#131318] border border-[#d0bcff]/15 text-[#cbc3d7] hover:border-[#d0bcff]/40 hover:text-white"
              }`}
            >
              {b}형
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
