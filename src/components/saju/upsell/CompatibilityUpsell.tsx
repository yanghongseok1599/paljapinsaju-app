"use client";

import { useRouter } from "next/navigation";

interface CompatibilityUpsellProps {
  readingId: string;
}

export default function CompatibilityUpsell({
  readingId,
}: CompatibilityUpsellProps) {
  const router = useRouter();

  return (
    <section className="mt-10 mx-auto max-w-md px-5">
      <div className="glass-panel rounded-2xl p-8" style={{ borderColor: 'rgba(208,188,255,0.15)' }}>
        <h3 className="text-xl font-bold text-[#e4e1e9] text-center">
          궁합도 확인해보세요!
        </h3>

        <p className="text-sm text-center mt-3 leading-relaxed text-[#958ea0]">
          상대방과의 사주 궁합을 AI가 분석해드려요
        </p>

        <div className="text-center mt-6 mb-6 flex items-center justify-center gap-2">
          <span style={{ color: '#ffb95f', fontSize: '1.75rem' }}>&#9733;</span>
          <span className="text-3xl font-bold text-[#e4e1e9]">10</span>
          <span className="text-base text-[#958ea0]">개</span>
        </div>

        <button
          onClick={() => router.push(`/reading/${readingId}/compatibility`)}
          className="w-full oracle-gradient rounded-xl py-4 text-lg font-semibold transition-opacity hover:opacity-90" style={{ color: '#3c0091' }}
        >
          궁합 분석 · 별 10개
        </button>
      </div>
    </section>
  );
}
