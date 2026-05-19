import { redirect } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/server";
import { getUserReadings } from "@/services/saju/actions";
import SajuNavbar from "@/components/saju/landing/SajuNavbar";
import { Link } from "@/i18n/routing";
import type { ReadingStatus } from "@/types/saju";

const STATUS_BADGE: Record<
  ReadingStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "대기", bg: "bg-[#1f1f25]", text: "text-[#958ea0]" },
  preview: { label: "미리보기", bg: "bg-[#1f1f25]", text: "text-[#958ea0]" },
  paid: { label: "결제완료", bg: "bg-[#E8F3FF]", text: "text-[#3182F6]" },
  generating: {
    label: "분석중",
    bg: "bg-[#FFF8E1]",
    text: "text-[#F59E0B]",
  },
  completed: {
    label: "완료",
    bg: "bg-[#E8F7EF]",
    text: "text-[#10B981]",
  },
  failed: { label: "실패", bg: "bg-[#FFF0F0]", text: "text-[#EF4444]" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatBirthDate(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

export default async function MyReadingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/", locale: "ko" });
    return null;
  }

  const { data: readings } = await getUserReadings(user.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131318', color: '#e4e1e9' }}>
      <SajuNavbar />

      <main className="max-w-3xl mx-auto px-5 py-8 pt-24">
        <h1 className="text-2xl font-bold text-[#e4e1e9] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>
          내 분석 내역
        </h1>

        {readings.length === 0 ? (
          /* 빈 상태 */
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(208,188,255,0.1)' }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B95A1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="font-semibold mb-1 text-[#e4e1e9]">
              아직 분석한 사주가 없어요
            </p>
            <p className="text-sm mb-6 text-[#958ea0]">
              지금 바로 사주 분석을 시작해보세요
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              지금 시작하기
            </Link>
          </div>
        ) : (
          /* 분석 목록 */
          <div className="space-y-3">
            {readings.map((reading) => {
              const badge = STATUS_BADGE[reading.status];
              return (
                <Link
                  key={reading.id}
                  href={`/reading/${reading.id}`}
                  className="block glass-panel rounded-2xl p-5 hover:border-[rgba(208,188,255,0.2)] transition-all" style={{ borderColor: 'rgba(73,68,84,0.2)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold truncate text-[#e4e1e9]">
                          {reading.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#958ea0]">
                        {formatBirthDate(
                          reading.birth_year,
                          reading.birth_month,
                          reading.birth_day,
                        )}
                        {reading.is_lunar ? " (음력)" : " (양력)"}
                      </p>
                    </div>
                    <span className="text-xs ml-3 flex-shrink-0 text-[#958ea0]">
                      {formatDate(reading.created_at)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
