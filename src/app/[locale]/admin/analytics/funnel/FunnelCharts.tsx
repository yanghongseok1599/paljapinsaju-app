"use client";

interface FunnelStep { label: string; count: number; rate: number }
interface CohortRow { cohortMonth: string; totalUsers: number; retention: number[] }

interface Props {
  funnel: FunnelStep[];
  cohort: CohortRow[];
}

const PANEL = "bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl p-5";

function retentionColor(pct: number) {
  if (pct >= 60) return "rgba(168,240,212,0.8)";
  if (pct >= 30) return "rgba(208,188,255,0.7)";
  if (pct >= 10) return "rgba(137,206,255,0.6)";
  if (pct > 0) return "rgba(137,206,255,0.2)";
  return "rgba(42,42,58,0.8)";
}

export default function FunnelCharts({ funnel, cohort }: Props) {
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);
  const maxMonths = Math.max(...cohort.map((c) => c.retention.length), 0);
  const monthHeaders = Array.from({ length: maxMonths }, (_, i) =>
    i === 0 ? "가입월" : `+${i}M`
  );

  return (
    <div className="space-y-5">
      {/* Conversion funnel */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-5">전환 퍼널</h2>
        <div className="space-y-4">
          {funnel.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              {/* Step number */}
              <div className="w-6 h-6 rounded-full bg-[#d0bcff]/20 flex items-center justify-center text-[10px] font-bold text-[#d0bcff] shrink-0">
                {i + 1}
              </div>
              {/* Bar + label */}
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{step.label}</span>
                  <span className="text-slate-400">
                    {step.count.toLocaleString()}명{" "}
                    <span className="text-[#d0bcff] font-semibold">({step.rate.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-3 bg-[#2a2a3a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(step.count / maxCount) * 100}%`,
                      background: "linear-gradient(90deg, #d0bcff, #89ceff)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort retention */}
      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">코호트 리텐션 (최근 6개월)</h2>
        {cohort.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-slate-500 text-sm">데이터가 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-xs min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-slate-400 pr-4 py-2 font-medium whitespace-nowrap">코호트</th>
                  <th className="text-right text-slate-400 pr-4 py-2 font-medium whitespace-nowrap">사용자</th>
                  {monthHeaders.map((h) => (
                    <th key={h} className="text-center text-slate-400 px-2 py-2 font-medium whitespace-nowrap min-w-[50px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohort.map((row) => (
                  <tr key={row.cohortMonth} className="border-t border-[#2a2a3a]">
                    <td className="pr-4 py-2 text-slate-300 whitespace-nowrap">{row.cohortMonth}</td>
                    <td className="pr-4 py-2 text-right text-slate-400 whitespace-nowrap">{row.totalUsers.toLocaleString()}</td>
                    {Array.from({ length: maxMonths }, (_, i) => {
                      const pct = row.retention[i];
                      return (
                        <td key={i} className="px-2 py-1.5 text-center whitespace-nowrap">
                          {pct !== undefined ? (
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                              style={{
                                backgroundColor: retentionColor(pct),
                                color: pct >= 10 ? "#e2e8f0" : "#6b7280",
                              }}
                            >
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
