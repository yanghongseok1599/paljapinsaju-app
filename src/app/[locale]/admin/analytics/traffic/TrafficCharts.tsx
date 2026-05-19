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
  Legend,
} from "recharts";

interface TrafficData {
  totalPageViews: number;
  sources: { name: string; value: number }[];
  countries: { country_code: string; count: number }[];
  devices: { name: string; value: number }[];
  browsers: { name: string; value: number }[];
  osList: { name: string; value: number }[];
  referrers: { domain: string; count: number }[];
}

const COLORS = ["#d0bcff", "#89ceff", "#a8f0d4", "#ffb95f", "#ff8fa3", "#b4e8a0"];
const PANEL = "bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-5";
const TIP_STYLE = {
  backgroundColor: "#1f1f2e",
  border: "1px solid rgba(208,188,255,0.2)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 12,
};

function BarList({ items, labelKey, valueKey }: { items: Record<string, unknown>[]; labelKey: string; valueKey: string }) {
  const max = Math.max(...items.map((i) => i[valueKey] as number), 1);
  return (
    <div className="space-y-2">
      {items.slice(0, 10).map((item) => (
        <div key={String(item[labelKey])}>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-300 truncate max-w-[60%]">{String(item[labelKey])}</span>
            <span className="text-slate-400">{(item[valueKey] as number).toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${((item[valueKey] as number) / max) * 100}%`,
                background: "linear-gradient(90deg,#d0bcff,#89ceff)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-24 flex items-center justify-center text-slate-500 text-sm">데이터가 없습니다</div>
  );
}

export default function TrafficCharts({ data }: { data: TrafficData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Sources pie */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">유입 소스</h2>
        {data.sources.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.sources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {data.sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Devices */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">디바이스 유형</h2>
        {data.devices.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.devices} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} width={60} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Bar dataKey="value" fill="#d0bcff" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Browsers */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">브라우저</h2>
        {data.browsers.length === 0 ? <EmptyState /> : (
          <BarList items={data.browsers as Record<string, unknown>[]} labelKey="name" valueKey="value" />
        )}
      </div>

      {/* OS */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">운영체제</h2>
        {data.osList.length === 0 ? <EmptyState /> : (
          <BarList items={data.osList as Record<string, unknown>[]} labelKey="name" valueKey="value" />
        )}
      </div>

      {/* Countries */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">국가</h2>
        {data.countries.length === 0 ? <EmptyState /> : (
          <BarList items={data.countries as Record<string, unknown>[]} labelKey="country_code" valueKey="count" />
        )}
      </div>

      {/* Referrers */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">유입 도메인 (Top 10)</h2>
        {data.referrers.length === 0 ? <EmptyState /> : (
          <BarList items={data.referrers as Record<string, unknown>[]} labelKey="domain" valueKey="count" />
        )}
      </div>
    </div>
  );
}
