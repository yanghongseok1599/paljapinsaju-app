'use client';

import { useState, useEffect, useRef } from 'react';
import { createReading } from '@/services/saju/actions';
import { Link } from '@/i18n/routing';

const REPORT_COST = 10;

const SIJI_OPTIONS = [
  { value: 'unknown', label: '모름' },
  { value: 'ja', label: '자시 (23:00~01:00)' },
  { value: 'chuk', label: '축시 (01:00~03:00)' },
  { value: 'in', label: '인시 (03:00~05:00)' },
  { value: 'myo', label: '묘시 (05:00~07:00)' },
  { value: 'jin', label: '진시 (07:00~09:00)' },
  { value: 'sa', label: '사시 (09:00~11:00)' },
  { value: 'o', label: '오시 (11:00~13:00)' },
  { value: 'mi', label: '미시 (13:00~15:00)' },
  { value: 'sin', label: '신시 (15:00~17:00)' },
  { value: 'yu', label: '유시 (17:00~19:00)' },
  { value: 'sul', label: '술시 (19:00~21:00)' },
  { value: 'hae', label: '해시 (21:00~23:00)' },
];

const SIJI_TO_HOUR: Record<string, number | null> = {
  unknown: null, ja: 23, chuk: 1, in: 3, myo: 5, jin: 7, sa: 9,
  o: 11, mi: 13, sin: 15, yu: 17, sul: 19, hae: 21,
};

interface PreviousBirthInfo {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  isLunar: boolean;
  birthCity?: string;
}

const HOUR_TO_SIJI: Record<number, string> = {
  23: 'ja', 0: 'ja', 1: 'chuk', 2: 'chuk', 3: 'in', 4: 'in',
  5: 'myo', 6: 'myo', 7: 'jin', 8: 'jin', 9: 'sa', 10: 'sa',
  11: 'o', 12: 'o', 13: 'mi', 14: 'mi', 15: 'sin', 16: 'sin',
  17: 'yu', 18: 'yu', 19: 'sul', 20: 'sul', 21: 'hae', 22: 'hae',
};

interface SajuReportClientProps {
  userId: string;
  starBalance: number;
  previousBirthInfo?: PreviousBirthInfo;
  isAdmin?: boolean;
}

type Step = 'input' | 'generating' | 'done' | 'error';

// ─── Progress bar stages ─────────────────────────────────────────────────────

const STAGE_LABELS = [
  '만세력 계산 중...',
  '별 차감 처리 중...',
  '오행 분석 중...',
  '십신 해석 중...',
  '대운 흐름 분석 중...',
  '연애·직업·재물운 분석 중...',
  '월별 운세 작성 중...',
  '자미두수 해석 중...',
  'PDF 리포트 생성 중...',
] as const;

interface ProgressState {
  pct: number;
  label: string;
}

function useGenerationProgress(active: boolean) {
  const [progress, setProgress] = useState<ProgressState>({ pct: 0, label: STAGE_LABELS[0] });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stagePctRef = useRef(0);
  const stageIdxRef = useRef(0);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      return;
    }

    // Reset
    stagePctRef.current = 0;
    stageIdxRef.current = 0;
    setProgress({ pct: 0, label: STAGE_LABELS[0] });

    // Phase 1: fast ramp 0→25% (만세력, 별차감) — ~3s
    timerRef.current = setInterval(() => {
      stagePctRef.current += 1.2;
      if (stagePctRef.current >= 25) {
        stagePctRef.current = 25;
        if (timerRef.current) clearInterval(timerRef.current);
        stageIdxRef.current = 2; // Move to AI stage labels

        // Phase 2: slow ease 25→92% over ~130s
        timerRef.current = setInterval(() => {
          stagePctRef.current += 0.22;
          if (stagePctRef.current >= 92) {
            stagePctRef.current = 92;
            if (timerRef.current) clearInterval(timerRef.current);
          }
          setProgress((prev) => ({ ...prev, pct: Math.round(stagePctRef.current) }));
        }, 300);
      }
      setProgress((prev) => ({ ...prev, pct: Math.round(stagePctRef.current) }));
    }, 80);

    // Cycle through sub-labels during AI phase
    stageTimerRef.current = setInterval(() => {
      stageIdxRef.current = (stageIdxRef.current + 1) % STAGE_LABELS.length;
      setProgress((prev) => ({ ...prev, label: STAGE_LABELS[stageIdxRef.current] }));
    }, 14000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    };
  }, [active]);

  const jumpTo = (pct: number, label: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    stagePctRef.current = pct;
    setProgress({ pct, label });
  };

  return { progress, jumpTo };
}

export default function SajuReportClient({
  userId,
  starBalance,
  previousBirthInfo,
  isAdmin = false,
}: SajuReportClientProps) {
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { progress, jumpTo } = useGenerationProgress(step === 'generating');

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // Form states
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthTime, setBirthTime] = useState('unknown');
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar');
  const [usedMyInfo, setUsedMyInfo] = useState(false);

  const fillMyInfo = () => {
    if (!previousBirthInfo) return;
    setName(previousBirthInfo.name);
    setGender(previousBirthInfo.gender);
    setBirthYear(previousBirthInfo.birthYear.toString());
    setBirthMonth(previousBirthInfo.birthMonth.toString());
    setBirthDay(previousBirthInfo.birthDay.toString());
    setBirthTime(previousBirthInfo.birthHour != null ? (HOUR_TO_SIJI[previousBirthInfo.birthHour] ?? 'unknown') : 'unknown');
    setCalendar(previousBirthInfo.isLunar ? 'lunar' : 'solar');
    setUsedMyInfo(true);
  };

  const handleGenerate = async () => {
    // Validation
    if (!name.trim()) { setError('이름을 입력해주세요'); return; }
    if (!birthYear || Number(birthYear) < 1940 || Number(birthYear) > 2025) { setError('올바른 년도를 입력해주세요'); return; }
    if (!birthMonth || Number(birthMonth) < 1 || Number(birthMonth) > 12) { setError('올바른 월을 입력해주세요'); return; }
    if (!birthDay || Number(birthDay) < 1 || Number(birthDay) > 31) { setError('올바른 일을 입력해주세요'); return; }
    if (!isAdmin && starBalance < REPORT_COST) { setError(`별이 부족합니다. (필요: ${REPORT_COST}개, 보유: ${starBalance}개)`); return; }

    setError(null);
    setStep('generating');

    try {
      // 1. Reading 생성 (만세력 계산 포함)
      const { data: reading, error: createError } = await createReading({
        name: name.trim(),
        gender,
        birthYear: Number(birthYear),
        birthMonth: Number(birthMonth),
        birthDay: Number(birthDay),
        birthHour: SIJI_TO_HOUR[birthTime] ?? null,
        birthMinute: 0,
        isLunar: calendar === 'lunar',
        isLeapMonth: false,
        concerns: ['career', 'love', 'wealth'],
      });

      if (createError || !reading) {
        throw new Error(createError || '분석 생성에 실패했습니다.');
      }

      // 2. 별 차감
      const deductRes = await fetch('/api/saju/deduct-stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 차감량은 서버가 정한다 (클라이언트가 amount를 보내면 조작 가능)
        body: JSON.stringify({ type: 'report', readingId: reading.id }),
      });

      if (!deductRes.ok) {
        throw new Error('별 차감에 실패했습니다.');
      }

      // 3. status는 별 차감 라우트가 서버에서 함께 올린다 (결제와 묶음)

      // 4. AI 종합 분석 생성
      jumpTo(25, 'AI 사주 분석 시작...');
      const analyzeRes = await fetch('/api/saju/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: reading.id }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || 'AI 분석 생성에 실패했습니다.');
      }

      jumpTo(93, 'PDF 생성 중...');

      // 4. PDF 다운로드
      const pdfRes = await fetch(`/api/saju/pdf/${reading.id}`);
      if (!pdfRes.ok) throw new Error('PDF 생성에 실패했습니다.');

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `팔자핀사주_${name.trim()}_종합분석리포트_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setPdfUrl(url);
      jumpTo(100, '완료!');
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setStep('error');
    }
  };

  if (step === 'generating') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#131318' }}>
        <div className="w-full max-w-sm text-center">
          {/* Spinning icon */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{ border: '3px solid rgba(208,188,255,0.12)', borderTopColor: '#d0bcff' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: 28, lineHeight: 1 }}>✦</span>
            </div>
          </div>

          <h2
            className="text-xl font-bold mb-2 text-[#e4e1e9]"
            style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}
          >
            종합 분석 리포트 생성 중
          </h2>
          <p className="text-sm text-[#958ea0] mb-1">AI가 50페이지 분량의 사주를 분석하고 있어요</p>
          <p className="text-xs text-[#494454] mb-8">보통 2~3분 정도 소요됩니다</p>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#cac4d0]" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                {progress.label}
              </span>
              <span className="text-xs font-bold tabular-nums" style={{ color: '#d0bcff' }}>
                {progress.pct}%
              </span>
            </div>
            {/* Track */}
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 8, backgroundColor: 'rgba(208,188,255,0.12)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress.pct}%`,
                  background: 'linear-gradient(90deg, #9c73d4, #d0bcff)',
                  boxShadow: '0 0 8px rgba(208,188,255,0.4)',
                }}
              />
            </div>
          </div>

          {/* Stage dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1, 2, 3, 4].map((i) => {
              const threshold = [0, 20, 40, 70, 92][i];
              const active = progress.pct >= threshold;
              return (
                <div
                  key={i}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: active ? 24 : 6,
                    height: 6,
                    backgroundColor: active ? '#d0bcff' : 'rgba(208,188,255,0.2)',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center px-4 py-12" style={{ backgroundColor: '#131318' }}>
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-[#e4e1e9]" style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>리포트가 생성되었습니다!</h2>
            <p className="text-sm mb-6 text-[#958ea0]">PDF 파일이 자동으로 다운로드되었습니다. 아래에서 바로 확인하실 수 있어요.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={`팔자핀사주_${name.trim()}_종합분석리포트_${new Date().toISOString().slice(0, 10)}.pdf`}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#d0bcff] hover:bg-[rgba(208,188,255,0.08)]"
                  style={{ border: '1px solid rgba(208,188,255,0.3)' }}
                >
                  다시 다운로드
                </a>
              )}
              <button
                onClick={() => {
                  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                  setStep('input');
                  setUsedMyInfo(false);
                }}
                className="px-5 py-2.5 rounded-xl oracle-gradient text-sm font-medium hover:opacity-90 transition-opacity" style={{ color: '#3c0091' }}
              >
                다른 사람 리포트 받기
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#cac4d0] hover:bg-[rgba(208,188,255,0.05)]" style={{ border: '1px solid rgba(73,68,84,0.3)' }}
              >
                홈으로
              </Link>
            </div>
          </div>

          {pdfUrl && (
            <div className="w-full rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(73,68,84,0.3)', backgroundColor: '#0e0e13' }}>
              <iframe
                src={pdfUrl}
                title="사주 리포트 미리보기"
                className="w-full"
                style={{ height: '80vh', minHeight: 600, border: 0 }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center px-4 py-8" style={{ backgroundColor: '#131318' }}>
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-[#e4e1e9]" style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>종합 사주 리포트</h1>
          <p className="text-sm text-[#958ea0]">
            AI가 분석한 상세 사주 리포트를 PDF로 받아보세요
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span style={{ color: '#ffb95f' }}>&#9733;</span>
            <span className="text-sm text-[#cac4d0]">{REPORT_COST}개 사용</span>
            <span className="text-xs text-[#494454]">|</span>
            <span className="text-xs text-[#958ea0]">보유: {starBalance}개</span>
          </div>
        </div>

        {/* 내 정보 사용하기 */}
        {previousBirthInfo && !usedMyInfo && (
          <button
            onClick={fillMyInfo}
            className="w-full mb-4 flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all" style={{ backgroundColor: 'rgba(208,188,255,0.08)', border: '1px solid rgba(208,188,255,0.2)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(208,188,255,0.15)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d0bcff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#d0bcff]">내 정보 사용하기</p>
              <p className="text-[11px] text-[#958ea0]">{previousBirthInfo.name} · {previousBirthInfo.birthYear}.{previousBirthInfo.birthMonth}.{previousBirthInfo.birthDay}</p>
            </div>
          </button>
        )}

        {usedMyInfo && (
          <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(208,188,255,0.08)', border: '1px solid rgba(208,188,255,0.15)' }}>
            <span className="text-xs text-[#d0bcff]">내 정보가 입력되었습니다</span>
            <button
              onClick={() => {
                setUsedMyInfo(false);
                setName(''); setBirthYear(''); setBirthMonth(''); setBirthDay('');
                setBirthTime('unknown'); setGender('male'); setCalendar('solar');
              }}
              className="text-[11px] text-[#958ea0] hover:text-[#e4e1e9] transition-colors"
            >
              초기화
            </button>
          </div>
        )}

        {/* 입력 폼 */}
        <div className="space-y-4">
          {/* 에러 */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* 이름 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">생년월일</label>
            <div className="flex gap-2">
              <input type="number" inputMode="numeric" placeholder="1990" min={1940} max={2025}
                value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                className="flex-[2] rounded-xl px-3 py-3 text-center text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
              />
              <input type="number" inputMode="numeric" placeholder="월" min={1} max={12}
                value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                className="flex-1 rounded-xl px-3 py-3 text-center text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
              />
              <input type="number" inputMode="numeric" placeholder="일" min={1} max={31}
                value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
                className="flex-1 rounded-xl px-3 py-3 text-center text-sm text-[#e4e1e9] outline-none placeholder:text-[#494454] border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
              />
            </div>
          </div>

          {/* 태어난 시간 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">태어난 시간</label>
            <select
              value={birthTime} onChange={(e) => setBirthTime(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-[#e4e1e9] outline-none border border-[rgba(73,68,84,0.3)] bg-[#0e0e13] focus:border-[rgba(208,188,255,0.4)]"
            >
              {SIJI_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* 성별 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">성별</label>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    gender === g
                      ? 'border-[rgba(208,188,255,0.5)] bg-[rgba(208,188,255,0.08)] text-[#d0bcff]'
                      : 'border-[rgba(73,68,84,0.3)] text-[#cac4d0] hover:border-[rgba(208,188,255,0.3)]'
                  }`}
                >
                  {g === 'male' ? '남' : '여'}
                </button>
              ))}
            </div>
          </div>

          {/* 달력 */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#cac4d0]">달력</label>
            <div className="grid grid-cols-2 gap-2">
              {(['solar', 'lunar'] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCalendar(c)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    calendar === c
                      ? 'border-[rgba(208,188,255,0.5)] bg-[rgba(208,188,255,0.08)] text-[#d0bcff]'
                      : 'border-[rgba(73,68,84,0.3)] text-[#cac4d0] hover:border-[rgba(208,188,255,0.3)]'
                  }`}
                >
                  {c === 'solar' ? '양력' : '음력'}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 (관리자 우회) */}
          <button
            onClick={handleGenerate}
            disabled={!isAdmin && starBalance < REPORT_COST}
            className="w-full mt-4 py-4 rounded-2xl oracle-gradient text-base font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: '#3c0091' }}
          >
            {!isAdmin && starBalance < REPORT_COST ? (
              '별이 부족합니다'
            ) : (
              <>
                종합 리포트 생성하기
                {!isAdmin && <> (&#9733; {REPORT_COST}개)</>}
                {isAdmin && <> · 관리자 무료</>}
              </>
            )}
          </button>

          {!isAdmin && starBalance < REPORT_COST && (
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
