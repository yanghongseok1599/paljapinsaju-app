"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CharacterStat { name: string; value: number }
interface Segment { name: string; value: number }
interface HeatmapPoint { day: number; hour: number; value: number }

interface Props {
  characterStats: CharacterStat[];
  segments: Segment[];
  heatmap: HeatmapPoint[];
}

const COLORS = ["#d0bcff", "#89ceff", "#a8f0d4", "#ffb95f", "#ff8fa3"];
const PANEL = "bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-5";
const TIP_STYLE = {
  backgroundColor: "#1f1f2e",
  border: "1px solid rgba(208,188,255,0.2)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 12,
};

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function BehaviorCharts({ characterStats, segments, heatmap }: Props) {
  const maxHeat = Math.max(...heatmap.map((h) => h.value), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Character stats */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">캐릭터별 대화 수</h2>
        {characterStats.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={characterStats} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} width={110} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Bar dataKey="value" fill="#d0bcff" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* User segments */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">사용자 세그먼트</h2>
        {segments.every((s) => s.value === 0) ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  (percent ?? 0) > 0.04 ? `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
              >
                {segments.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Heatmap (시간대별 대화) */}
      <div className={`${PANEL} md:col-span-2`}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">시간대별 대화 히트맵 (요일 × 시간)</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5">
            {/* Day labels column */}
            <div className="flex flex-col gap-0.5 pt-5">
              {DAY_LABELS.map((d) => (
                <div key={d} className="h-5 w-6 flex items-center justify-center text-[10px] text-slate-500">
                  {d}
                </div>
              ))}
            </div>
            {/* Hour grid */}
            <div className="flex flex-col gap-0.5">
              {/* Hour header */}
              <div className="flex gap-0.5">
                {HOURS.map((h) => (
                  <div key={h} className="w-5 h-4 flex items-center justify-center text-[9px] text-slate-600">
                    {h % 6 === 0 ? h : ""}
                  </div>
                ))}
              </div>
              {/* Cells */}
              {DAY_LABELS.map((_, day) => (
                <div key={day} className="flex gap-0.5">
                  {HOURS.map((hour) => {
                    const point = heatmap.find((p) => p.day === day && p.hour === hour);
                    const intensity = point ? point.value / maxHeat : 0;
                    return (
                      <div
                        key={hour}
                        className="w-5 h-5 rounded-sm"
                        style={{
                          backgroundColor: intensity > 0
                            ? `rgba(208,188,255,${0.1 + intensity * 0.9})`
                            : "#1f1f2e",
                        }}
                        title={`${DAY_LABELS[day]} ${hour}시: ${point?.value ?? 0}건`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-24 flex items-center justify-center text-slate-500 text-sm">데이터가 없습니다</div>
  );
}
