"use client";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface CompatibilityUpsellProps {
  readingId: string;
  name: string;
}

export default function CompatibilityUpsell({
  readingId,
  name,
}: CompatibilityUpsellProps) {
  const router = useRouter();

  return (
    <div className="glass-panel rounded-2xl p-6" style={{ borderColor: 'rgba(208,188,255,0.15)', background: 'linear-gradient(135deg, rgba(208,188,255,0.05) 0%, rgba(137,206,255,0.05) 100%)' }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(208,188,255,0.15)' }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d0bcff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold mb-1 text-[#e4e1e9]">
            {name}님과 상대방의 궁합은?
          </h3>
          <p className="text-sm mb-4 leading-relaxed text-[#958ea0]">
            사주팔자 기반 궁합 분석으로 두 사람의 케미를 확인해보세요. 연애운,
            결혼운, 갈등 포인트까지 상세하게 분석해드립니다.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={() =>
                router.push(`/reading/${readingId}/compatibility`)
              }
              className="oracle-gradient rounded-xl px-5 h-10 text-sm font-semibold hover:opacity-90 transition-opacity" style={{ color: '#3c0091' }}
            >
              궁합 분석하기 · 별 10개
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
