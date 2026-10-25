"use client";

import type { LuckyElements as LuckyElementsType } from "@/types/saju";

interface LuckyElementsProps {
  luckyElements: LuckyElementsType;
}

/**
 * 색 이름 → 실제 색.
 *
 * 결과지에 나오는 색 이름은 두 곳에서 온다.
 *  - 체험 분석: 오행 기반 외래어 표기 (초록/레드/골드/화이트/네이비)
 *  - AI 분석: 자유로운 한국어 표기 (빨간색/황금색/짙은 파랑 …)
 * 둘 다 받아내야 해서 한국어와 외래어를 함께 등록한다.
 */
const COLOR_MAP: Record<string, string> = {
  // 빨강
  빨강: "#EF4444", 빨간색: "#EF4444", 적색: "#EF4444", 레드: "#EF4444", 다홍: "#EF4444",
  // 주황
  주황: "#F97316", 주황색: "#F97316", 오렌지: "#F97316",
  // 노랑
  노랑: "#EAB308", 노란색: "#EAB308", 황색: "#EAB308", 옐로우: "#EAB308",
  // 초록
  초록: "#22C55E", 초록색: "#22C55E", 녹색: "#22C55E", 그린: "#22C55E", 청록: "#14B8A6", 민트: "#2DD4BF",
  // 파랑
  파랑: "#3B82F6", 파란색: "#3B82F6", 청색: "#3B82F6", 블루: "#3B82F6", 하늘색: "#7DD3FC", 스카이: "#7DD3FC",
  // 남색 계열
  남색: "#4338CA", 네이비: "#1E3A8A", 곤색: "#1E3A8A", 감청: "#1E3A8A",
  // 보라
  보라: "#A855F7", 보라색: "#A855F7", 자주: "#9333EA", 퍼플: "#A855F7", 라벤더: "#C4B5FD",
  // 분홍
  분홍: "#EC4899", 분홍색: "#EC4899", 핑크: "#EC4899",
  // 무채색
  흰색: "#F3F4F6", 하양: "#F3F4F6", 백색: "#F3F4F6", 화이트: "#F3F4F6",
  검정: "#374151", 검은색: "#374151", 흑색: "#374151", 블랙: "#374151",
  회색: "#9CA3AF", 그레이: "#9CA3AF", 실버: "#C0C0C0", 은색: "#C0C0C0",
  // 금·갈색
  금색: "#D4A017", 황금: "#D4A017", 골드: "#D4A017", 금: "#D4A017",
  갈색: "#92400E", 브라운: "#92400E", 베이지: "#D6C7A1",
};

/**
 * 색 이름에서 색을 찾는다.
 * "짙은 남색"처럼 여러 후보가 걸릴 수 있어 가장 긴(=구체적인) 이름을 우선한다.
 * (예: "네이비블루"가 "블루"로 잡히면 안 된다.)
 */
const COLOR_KEYS = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);

function getColorHex(colorName: string): string | null {
  const key = COLOR_KEYS.find((k) => colorName.includes(k));
  return key ? COLOR_MAP[key] : null;
}

export default function LuckyElements({ luckyElements }: LuckyElementsProps) {
  const colorHex = getColorHex(luckyElements.color);

  const items = [
    {
      label: "행운의 색상",
      value: luckyElements.color,
      chip: colorHex ? (
        <div
          className="w-8 h-8 rounded-full"
          style={{ border: '1px solid rgba(73,68,84,0.3)', backgroundColor: colorHex }}
          aria-label={luckyElements.color}
        />
      ) : null,
    },
    {
      label: "행운의 방향",
      value: luckyElements.direction,
      chip: null,
    },
    {
      label: "행운의 숫자",
      value: luckyElements.number,
      chip: null,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-2 rounded-xl p-4" style={{ border: '1px solid rgba(73,68,84,0.2)', backgroundColor: '#1f1f25' }}
        >
          {item.chip ? (
            item.chip
          ) : (
            <span className="text-2xl font-bold text-[#d0bcff]">
              {item.value}
            </span>
          )}
          <span className="text-xs text-[#958ea0]">{item.label}</span>
          {item.chip && (
            <span className="text-sm font-medium text-[#e4e1e9]">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
