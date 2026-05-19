"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ActivityPoint {
  name: string;
  사주분석: number;
  대화: number;
}

interface SignupPoint {
  date: string;
  가입: number;
  활성사용자: number;
}

interface FunnelStep {
  label: string;
  count: number;
  rate: number;
}

interface Props {
  activityTrend: ActivityPoint[];
  signupTrend: SignupPoint[];
  funnel: FunnelStep[];
}

const PANEL = "bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-5";
const TIP_STYLE = {
  backgroundColor: "#1f1f2e",
  border: "1px solid rgba(208,188,255,0.2)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 12,
};

export default function OverviewCharts({ activityTrend, signupTrend, funnel }: Props) {
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-5">
      {/* Activity trend */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">일별 활동 추이 (사주분석 / 대화)</h2>
        {activityTrend.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gReading" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d0bcff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d0bcff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gChat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#89ceff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#89ceff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
              <Area type="monotone" dataKey="사주분석" stroke="#d0bcff" fill="url(#gReading)" strokeWidth={2} />
              <Area type="monotone" dataKey="대화" stroke="#89ceff" fill="url(#gChat)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Signup trend */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">일별 신규 가입 / 활성 사용자</h2>
        {signupTrend.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signupTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
              <Bar dataKey="가입" fill="#d0bcff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="활성사용자" fill="#89ceff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Funnel */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">전환 퍼널 (기간 내 신규 가입자 기준)</h2>
        <div className="space-y-3">
          {funnel.map((step, i) => (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">
                  {i + 1}. {step.label}
                </span>
                <span className="text-xs font-medium text-slate-300">
                  {step.count.toLocaleString()}명{" "}
                  <span className="text-[#d0bcff]">({step.rate.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(step.count / maxCount) * 100}%`,
                    background: `linear-gradient(90deg, #d0bcff, #89ceff)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[120px] flex items-center justify-center text-slate-500 text-sm">
      데이터가 없습니다
    </div>
  );
}
