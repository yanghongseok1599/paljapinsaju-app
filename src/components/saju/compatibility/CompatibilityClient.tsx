"use client";

import { useState } from "react";
import { createCompatibility, payCompatibilityWithStars } from "@/services/saju/actions";
import { Link } from "@/i18n/routing";
import { COMPAT_COST } from "@/types/saju";
import type { CompatibilityAnalysis, SajuReading } from "@/types/saju";

const SIJI_OPTIONS = [
  { value: "unknown", label: "모름" },
  { value: "ja", label: "자시 (23:00~01:00)" },
  { value: "chuk", label: "축시 (01:00~03:00)" },
  { value: "in", label: "인시 (03:00~05:00)" },
  { value: "myo", label: "묘시 (05:00~07:00)" },
  { value: "jin", label: "진시 (07:00~09:00)" },
  { value: "sa", label: "사시 (09:00~11:00)" },
  { value: "o", label: "오시 (11:00~13:00)" },
  { value: "mi", label: "미시 (13:00~15:00)" },
  { value: "sin", label: "신시 (15:00~17:00)" },
  { value: "yu", label: "유시 (17:00~19:00)" },
  { value: "sul", label: "술시 (19:00~21:00)" },
  { value: "hae", label: "해시 (21:00~23:00)" },
];

const SIJI_TO_HOUR: Record<string, number | null> = {
  unknown: null, ja: 23, chuk: 1, in: 3, myo: 5, jin: 7, sa: 9,
  o: 11, mi: 13, sin: 15, yu: 17, sul: 19, hae: 21,
};

interface CompatibilityClientProps {
  readings: SajuReading[];
  defaultReadingId?: string;
  starBalance: number;
  isAdmin: boolean;
}

type Step = "input" | "generating" | "result" | "error";

function ScoreGauge({ score }: { score: number }) {
  const clamp = Math.max(0, Math.min(100, score));
  // Determine color
  const color =
    clamp >= 80 ? "#22c55e" : clamp >= 60 ? "#d0bcff" : clamp >= 40 ? "#ffb95f" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div
        className="relative w-36 h-36 flex items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${clamp * 3.6}deg, rgba(73,68,84,0.3) 0deg)`,
        }}
      >
        <div
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: "#131318" }}
        >
          <span className="text-4xl font-bold" style={{ color }}>
            {clamp}
          </span>
          <span className="text-xs text-[#958ea0] mt-0.5">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-[#cac4d0]">
        {clamp >= 80
          ? "최고의 궁합이에요 ✨"
          : clamp >= 60
          ? "잘 맞는 궁합이에요 💜"
          : clamp >= 40
          ? "노력이 필요한 궁합이에요"
          : "도전적인 궁합이에요"}
      </p>
    </div>
  );
}

function CompatibilityResult({
  analysis,
  myName,
  partnerName,
}: {
  analysis: CompatibilityAnalysis;
  myName: string;
  partnerName: string;
}) {
  return (
    <div className="space-y-5">
      {/* Score */}
      <div
        className="glass-panel rounded-2xl p-6 text-center"
        style={{ borderColor: "rgba(208,188,255,0.15)" }}
      >
        <h2 className="text-lg font-bold text-[#e4e1e9] mb-1">
          {myName} · {partnerName} 궁합 결과
        </h2>
        <ScoreGauge score={analysis.score} />
      </div>

      {/* Summary */}
      <div
        className="glass-panel rounded-2xl p-6"
        style={{ borderColor: "rgba(208,188,255,0.15)" }}
      >
        <h3 className="text-sm font-semibold text-[#d0bcff] mb-3 flex items-center gap-2">
          <span>🔮</span> 종합 분석
        </h3>
        <p className="text-sm leading-relaxed text-[#cac4d0]">{analysis.summary}</p>
      </div>

      {/* Strengths */}
      <div
        className="glass-panel rounded-2xl p-6"
        style={{ borderColor: "rgba(137,206,255,0.15)" }}
      >
        <h3 className="text-sm font-semibold text-[#89ceff] mb-3 flex items-center gap-2">
          <span>✨</span> 두 사람의 강점
        </h3>
        <ul className="space-y-2">
          {analysis.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#cac4d0]">
              <span className="mt-0.5 text-[#89ceff] shrink-0">•</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Challenges */}
      <div
        className="glass-panel rounded-2xl p-6"
        style={{ borderColor: "rgba(255,185,95,0.15)" }}
      >
        <h3 className="text-sm font-semibold text-[#ffb95f] mb-3 flex items-center gap-2">
          <span>⚡</span> 주의할 점
        </h3>
        <ul className="space-y-2">
          {analysis.challenges.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#cac4d0]">
              <span className="mt-0.5 text-[#ffb95f] shrink-0">•</span>
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Advice */}
      <div
        className="glass-panel rounded-2xl p-6"
        style={{ borderColor: "rgba(208,188,255,0.15)", background: "linear-gradient(135deg, rgba(208,188,255,0.05) 0%, rgba(137,206,255,0.05) 100%)" }}
      >
        <h3 className="text-sm font-semibold text-[#d0bcff] mb-3 flex items-center gap-2">
          <span>💌</span> 조언
        </h3>
        <p className="text-sm leading-relaxed text-[#cac4d0]">{analysis.advice}</p>
      </div>

      {/* CTA */}
      <div className="flex gap-3 pt-2">
        <Link
          href="/"
          className="flex-1 py-3.5 rounded-xl border text-sm font-medium text-center text-[#cac4d0] hover:bg-[rgba(208,188,255,0.05)] transition-colors"
          style={{ borderColor: "rgba(73,68,84,0.3)" }}
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

export default function CompatibilityClient({
  readings,
  defaultReadingId,
  starBalance,
  isAdmin,
}: CompatibilityClientProps) {
  const completedReadings = readings.filter((r) => r.status === "completed");

  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");

  // Reading selection
  const [selectedReadingId, setSelectedReadingId] = useState<string>(
    defaultReadingId ?? completedReadings[0]?.id ?? ""
  );

  // Partner form
  const [pName, setPName] = useState("");
  const [pGender, setPGender] = useState<"male" | "female">("male");
  const [pYear, setPYear] = useState("");
  const [pMonth, setPMonth] = useState("");
  const [pDay, setPDay] = useState("");
  const [pTime, setPTime] = useState("unknown");
  const [pCalendar, setPCalendar] = useState<"solar" | "lunar">("solar");

  const selectedReading = completedReadings.find((r) => r.id === selectedReadingId);

  const handleSubmit = async () => {
    // Validation
    if (!selectedReadingId) {
      setError("사주를 선택해주세요.");
      return;
    }
    if (!pName.trim()) {
      setError("상대방 이름을 입력해주세요.");
      return;
    }
    if (!pYear || Number(pYear) < 1940 || Number(pYear) > 2025) {
      setError("올바른 출생년도를 입력해주세요.");
      return;
    }
    if (!pMonth || Number(pMonth) < 1 || Number(pMonth) > 12) {
      setError("올바른 월을 입력해주세요.");
      return;
    }
    if (!pDay || Number(pDay) < 1 || Number(pDay) > 31) {
      setError("올바른 일을 입력해주세요.");
      return;
    }
    if (!isAdmin && starBalance < COMPAT_COST) {
      setError(`별이 부족합니다. (필요: ${COMPAT_COST}개, 보유: ${starBalance}개)`);
      return;
    }

    setError(null);
    setStep("generating");

    try {
      // 1. 궁합 레코드 생성 (status='pending')
      const { data: compat, error: createError } = await createCompatibility({
        readingId: selectedReadingId,
        partnerName: pName.trim(),
        partnerGender: pGender,
        partnerBirthYear: Number(pYear),
        partnerBirthMonth: Number(pMonth),
        partnerBirthDay: Number(pDay),
        partnerBirthHour: SIJI_TO_HOUR[pTime] ?? null,
        partnerBirthMinute: 0,
        partnerIsLunar: pCalendar === "lunar",
        partnerIsLeapMonth: false,
      });

      if (createError || !compat) {
        throw new Error(createError || "궁합 레코드 생성에 실패했습니다.");
      }

      // 2. 별 차감 + status='paid' (서버액션, 관리자 바이패스 포함)
      const { error: payError } = await payCompatibilityWithStars(compat.id);
      if (payError) {
        throw new Error(payError);
      }

      // 3. AI 궁합 분석 호출
      const analyzeRes = await fetch("/api/saju/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compatibilityId: compat.id }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || "AI 궁합 분석에 실패했습니다.");
      }

      const { analysis: resultAnalysis } = await analyzeRes.json();

      setAnalysis(resultAnalysis as CompatibilityAnalysis);
      setMyName(selectedReading?.name ?? "");
      setPartnerName(pName.trim());
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setStep("error");
    }
  };

  if (step === "generating") {
    return (
      <div
        className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#131318" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full animate-spin mx-auto mb-6"
            style={{
              border: "3px solid rgba(208,188,255,0.2)",
              borderTopColor: "#d0bcff",
            }}
          />
          <h2
            className="text-xl font-bold mb-2 text-[#e4e1e9]"
            style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
          >
            궁합 분석 중...
          </h2>
          <p className="text-sm text-[#958ea0]">
            AI가 두 사람의 사주팔자를 분석하고 있어요.
          </p>
          <p className="text-xs mt-4 text-[#494454]">보통 30초 ~ 1분 소요됩니다</p>
        </div>
      </div>
    );
  }

  if (step === "result" && analysis) {
    return (
      <div
        className="min-h-[calc(100vh-64px)] px-5 py-8"
        style={{ backgroundColor: "#131318" }}
      >
        <div className="max-w-xl mx-auto">
          <CompatibilityResult
            analysis={analysis}
            myName={myName}
            partnerName={partnerName}
          />
        </div>
      </div>
    );
  }

  // Input step (also shows after error)
  return (
    <div
      className="min-h-[calc(100vh-64px)] flex flex-col items-center px-4 py-8"
      style={{ backgroundColor: "#131318" }}
    >
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(208,188,255,0.12)" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d0bcff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold mb-2 text-[#e4e1e9]"
            style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
          >
            사주 궁합 분석
          </h1>
          <p className="text-sm text-[#958ea0]">
            두 사람의 사주팔자로 궁합을 알아보세요
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span style={{ color: "#ffb95f" }}>&#9733;</span>
            <span className="text-sm text-[#cac4d0]">{COMPAT_COST}개 사용</span>
            <span className="text-xs text-[#494454]">|</span>
            <span className="text-xs text-[#958ea0]">보유: {starBalance}개</span>
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* 내 사주 선택 */}
          {completedReadings.length > 1 && (
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">
                내 사주 선택
              </label>
              <select
                value={selectedReadingId}
                onChange={(e) => setSelectedReadingId(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-[#e4e1e9] outline-none border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
              >
                {completedReadings.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.birth_year}.{r.birth_month}.{r.birth_day})
                  </option>
                ))}
              </select>
            </div>
          )}

          {completedReadings.length === 1 && selectedReading && (
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: "rgba(208,188,255,0.06)",
                border: "1px solid rgba(208,188,255,0.15)",
              }}
            >
              <p className="text-xs text-[#958ea0] mb-0.5">내 사주</p>
              <p className="text-sm font-semibold text-[#d0bcff]">
                {selectedReading.name} ({selectedReading.birth_year}.
                {selectedReading.birth_month}.{selectedReading.birth_day})
              </p>
            </div>
          )}

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(73,68,84,0.3)" }} />
            <span className="text-xs text-[#494454]">상대방 정보</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(73,68,84,0.3)" }} />
          </div>

          {/* 상대방 이름 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">
              상대방 이름
            </label>
            <input
              type="text"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
            />
          </div>

          {/* 상대방 생년월일 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">
              상대방 생년월일
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="1990"
                min={1940}
                max={2025}
                value={pYear}
                onChange={(e) => setPYear(e.target.value)}
                className="flex-[2] rounded-xl px-3 py-3 text-center text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="월"
                min={1}
                max={12}
                value={pMonth}
                onChange={(e) => setPMonth(e.target.value)}
                className="flex-1 rounded-xl px-3 py-3 text-center text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="일"
                min={1}
                max={31}
                value={pDay}
                onChange={(e) => setPDay(e.target.value)}
                className="flex-1 rounded-xl px-3 py-3 text-center text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
              />
            </div>
          </div>

          {/* 상대방 태어난 시간 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">
              상대방 태어난 시간
            </label>
            <select
              value={pTime}
              onChange={(e) => setPTime(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-[#e4e1e9] outline-none border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
            >
              {SIJI_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* 상대방 성별 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">
              상대방 성별
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setPGender(g)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    pGender === g
                      ? "border-[rgba(208,188,255,0.5)] bg-[rgba(208,188,255,0.08)] text-[#d0bcff]"
                      : "border-[rgba(73,68,84,0.3)] text-[#cac4d0] hover:border-[rgba(208,188,255,0.3)]"
                  }`}
                >
                  {g === "male" ? "남" : "여"}
                </button>
              ))}
            </div>
          </div>

          {/* 상대방 달력 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">
              달력
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["solar", "lunar"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPCalendar(c)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    pCalendar === c
                      ? "border-[rgba(208,188,255,0.5)] bg-[rgba(208,188,255,0.08)] text-[#d0bcff]"
                      : "border-[rgba(73,68,84,0.3)] text-[#cac4d0] hover:border-[rgba(208,188,255,0.3)]"
                  }`}
                >
                  {c === "solar" ? "양력" : "음력"}
                </button>
              ))}
            </div>
          </div>

          {/* 분석 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!isAdmin && starBalance < COMPAT_COST}
            className="w-full mt-4 py-4 rounded-2xl oracle-gradient text-base font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "#3c0091" }}
          >
            {!isAdmin && starBalance < COMPAT_COST ? (
              "별이 부족합니다"
            ) : (
              <>
                궁합 분석하기
                {!isAdmin && <> (&#9733; {COMPAT_COST}개)</>}
                {isAdmin && <> · 관리자 무료</>}
              </>
            )}
          </button>

          {!isAdmin && starBalance < COMPAT_COST && (
            <Link
              href="/coin-shop"
              className="block text-center text-sm transition-colors mt-2 text-[#d0bcff] hover:text-[#e4e1e9]"
            >
              별 충전하러 가기 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
