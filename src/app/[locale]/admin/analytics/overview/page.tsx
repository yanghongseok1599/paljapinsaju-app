import { requireAdminOrRedirect } from "@/utils/auth/adminGuard";
import { getOverviewMetrics, getDailyTrend, getFunnelData } from "@/services/analytics/actions";
import OverviewCharts from "./OverviewCharts";

export default async function AdminOverviewPage() {
  await requireAdminOrRedirect("/");

  const to = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);

  const [metrics, trend, funnel] = await Promise.all([
    getOverviewMetrics(from, to),
    getDailyTrend(from, to),
    getFunnelData(from, to),
  ]);

  const kpis = [
    { label: "전체 사용자", value: metrics.totalUsers.toLocaleString(), sub: `신규 ${metrics.newSignups}명 (30일)`, color: "#d0bcff" },
    { label: "DAU", value: metrics.dau.toLocaleString(), sub: "오늘 활성 사용자", color: "#89ceff" },
    { label: "WAU", value: metrics.wau.toLocaleString(), sub: "주간 활성 사용자", color: "#a8f0d4" },
    { label: "MAU", value: metrics.mau.toLocaleString(), sub: "월간 활성 사용자", color: "#ffb95f" },
    { label: "사주분석 수", value: metrics.totalReadings.toLocaleString(), sub: "최근 30일", color: "#d0bcff" },
    { label: "총 대화 수", value: metrics.totalChats.toLocaleString(), sub: "최근 30일", color: "#89ceff" },
    { label: "유료 사용자", value: metrics.paidUsers.toLocaleString(), sub: "별 보유 사용자", color: "#ffb95f" },
    { label: "신규 가입", value: metrics.newSignups.toLocaleString(), sub: `${from} ~ ${to}`, color: "#a8f0d4" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">개요 대시보드</h1>
        <p className="text-sm text-slate-400 mt-1">
          {from} ~ {to} (최근 30일)
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-4"
          >
            <p className="text-xs text-slate-400 mb-1">{kpi.label}</p>
            <p
              className="text-2xl font-bold"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts (client component — recharts) */}
      <OverviewCharts
        activityTrend={trend.activityTrend}
        signupTrend={trend.signupTrend}
        funnel={funnel.funnel}
      />
    </div>
  );
}
