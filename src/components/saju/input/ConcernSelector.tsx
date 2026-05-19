"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const CONCERNS = [
  { id: "love", label: "연애/결혼" },
  { id: "career", label: "직업/진로" },
  { id: "wealth", label: "재물/금전" },
  { id: "health", label: "건강" },
  { id: "relationship", label: "대인관계" },
] as const;

type ConcernId = (typeof CONCERNS)[number]["id"];

interface ConcernSelectorProps {
  onSubmit: (concerns: ConcernId[]) => void;
  onBack: () => void;
}

export default function ConcernSelector({
  onSubmit,
  onBack,
}: ConcernSelectorProps) {
  const [selected, setSelected] = useState<ConcernId[]>([]);
  const [error, setError] = useState("");

  const toggle = (id: ConcernId) => {
    setError("");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      setError("최소 1개를 선택해주세요");
      return;
    }
    onSubmit(selected);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#e4e1e9]" style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>
          어떤 고민이 있으신가요?
        </h2>
        <p className="mt-2 text-sm text-[#958ea0]">
          궁금한 분야를 선택하면 더 정확한 분석을 받을 수 있어요
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {CONCERNS.map((concern) => {
          const isSelected = selected.includes(concern.id);
          return (
            <motion.button
              key={concern.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(concern.id)}
              className={`px-5 py-3 rounded-full text-base font-medium transition-colors ${
                isSelected
                  ? "oracle-gradient text-[#3c0091]"
                  : "bg-[#1f1f25] text-[#cac4d0] hover:bg-[rgba(208,188,255,0.1)] border border-[rgba(73,68,84,0.3)]"
              }`}
            >
              {concern.label}
            </motion.button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-xs text-center">{error}</p>
      )}

      <div className="space-y-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full oracle-gradient rounded-xl py-4 text-lg font-semibold transition-opacity hover:opacity-90" style={{ color: '#3c0091' }}
        >
          분석 시작하기
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 text-base transition-colors text-[#958ea0] hover:text-[#e4e1e9]"
        >
          이전으로
        </button>
      </div>
    </div>
  );
}
