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

interface StarTrendPoint { name: string; 구매: number }
interface DistPoint { name: string; value: number }

interface Props {
  starPurchaseTrend: StarTrendPoint[];
  userDistribution: DistPoint[];
}

const COLORS = ["#d0bcff", "#2a2a3a"];
const PANEL = "bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-5";
const TIP_STYLE = {
  backgroundColor: "#1f1f2e",
  border: "1px solid rgba(208,188,255,0.2)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 12,
};

export default function RevenueCharts({ starPurchaseTrend, userDistribution }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Star purchase trend */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">별 구매 추이 (기간 내)</h2>
        {starPurchaseTrend.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={starPurchaseTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Bar dataKey="구매" fill="#ffb95f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* User distribution */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">유/무료 사용자 비율</h2>
        {userDistribution.every((d) => d.value === 0) ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={userDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {userDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="h-24 flex items-center justify-center text-slate-500 text-sm">데이터가 없습니다</div>
  );
}
