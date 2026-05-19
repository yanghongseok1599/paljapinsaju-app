"use client";

import type { MonthlyFortune } from "@/types/saju";

interface MonthlyFortuneGridProps {
  monthlyFortune: MonthlyFortune[];
}

export default function MonthlyFortuneGrid({
  monthlyFortune,
}: MonthlyFortuneGridProps) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {monthlyFortune.map((item) => (
        <div
          key={item.month}
          className="rounded-xl p-4"
          style={item.month === currentMonth ? {
            border: '1px solid rgba(208,188,255,0.4)',
            backgroundColor: 'rgba(208,188,255,0.08)',
          } : {
            border: '1px solid rgba(73,68,84,0.2)',
            backgroundColor: '#1f1f25',
          }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: item.month === currentMonth ? '#d0bcff' : '#958ea0' }}
          >
            {item.month}월
          </span>
          <p className="mt-1 text-sm leading-relaxed text-[#cac4d0]">
            {item.fortune}
          </p>
        </div>
      ))}
    </div>
  );
}
