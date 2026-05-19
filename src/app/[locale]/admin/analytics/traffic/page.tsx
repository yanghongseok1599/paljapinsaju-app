import { requireAdminOrRedirect } from "@/utils/auth/adminGuard";
import { getTrafficData } from "@/services/analytics/actions";
import TrafficCharts from "./TrafficCharts";

export default async function AdminTrafficPage() {
  await requireAdminOrRedirect("/");

  const to = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);

  const data = await getTrafficData(from, to);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">트래픽 분석</h1>
        <p className="text-sm text-slate-400 mt-1">
          {from} ~ {to} · 총 페이지뷰:{" "}
          <span className="text-[#89ceff] font-semibold">
            {data.totalPageViews.toLocaleString()}
          </span>
        </p>
      </div>
      <TrafficCharts data={data} />
    </div>
  );
}
