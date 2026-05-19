import { requireAdminOrRedirect } from "@/utils/auth/adminGuard";
import { getBehaviorData } from "@/services/analytics/actions";
import BehaviorCharts from "./BehaviorCharts";

export default async function AdminBehaviorPage() {
  await requireAdminOrRedirect("/");

  const to = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);

  const data = await getBehaviorData(from, to);

  const statsCards = [
    { label: "사주분석 수", value: data.totalReadings.toLocaleString(), color: "#d0bcff" },
    { label: "총 메시지 수", value: data.totalMessages.toLocaleString(), color: "#89ceff" },
    { label: "분석당 평균 대화", value: `${data.avgMessagesPerReading}회`, color: "#a8f0d4" },
    { label: "궁합 분석 수", value: data.compatibilityCount.toLocaleString(), color: "#ffb95f" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">행동 분석</h1>
        <p className="text-sm text-slate-400 mt-1">{from} ~ {to}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((c) => (
          <div key={c.label} className="bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <BehaviorCharts
        characterStats={data.characterStats}
        segments={data.segments}
        heatmap={data.heatmap}
      />
    </div>
  );
}
