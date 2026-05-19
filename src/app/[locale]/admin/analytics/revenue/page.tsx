import { requireAdminOrRedirect } from "@/utils/auth/adminGuard";
import { getRevenueData } from "@/services/analytics/actions";
import RevenueCharts from "./RevenueCharts";

export default async function AdminRevenuePage() {
  await requireAdminOrRedirect("/");

  const to = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);

  const data = await getRevenueData(from, to);

  const freeUsers = Math.max(data.totalUsers - data.paidUsers, 0);
  const paidPct = data.totalUsers > 0
    ? ((data.paidUsers / data.totalUsers) * 100).toFixed(1)
    : "0.0";

  const kpis = [
    {
      label: "예상 누적 매출",
      value: `₩${data.estimatedRevenue.toLocaleString()}`,
      sub: "사주분석 + 궁합 기준",
      color: "#ffb95f",
    },
    {
      label: "ARPU",
      value: `₩${data.arpu.toLocaleString()}`,
      sub: "사용자 평균 매출",
      color: "#d0bcff",
    },
    {
      label: "유료 사용자",
      value: `${data.paidUsers.toLocaleString()}명`,
      sub: `전체의 ${paidPct}%`,
      color: "#a8f0d4",
    },
    {
      label: "별 잔액 합계",
      value: data.totalStarBalance.toLocaleString(),
      sub: "보유 별 총합",
      color: "#89ceff",
    },
    {
      label: "사주분석 총수",
      value: data.totalReadings.toLocaleString(),
      sub: "누적",
      color: "#d0bcff",
    },
    {
      label: "궁합 분석 총수",
      value: data.totalCompatibility.toLocaleString(),
      sub: "누적",
      color: "#89ceff",
    },
    {
      label: "무료 사용자",
      value: `${freeUsers.toLocaleString()}명`,
      sub: "별 미보유",
      color: "#6b7280",
    },
    {
      label: "전체 사용자",
      value: data.totalUsers.toLocaleString(),
      sub: "가입 총수",
      color: "#9ca3af",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">매출 분석</h1>
        <p className="text-sm text-slate-400 mt-1">{from} ~ {to}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">{k.label}</p>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-slate-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <RevenueCharts
        starPurchaseTrend={data.starPurchaseTrend}
        userDistribution={data.userDistribution}
      />
    </div>
  );
}
