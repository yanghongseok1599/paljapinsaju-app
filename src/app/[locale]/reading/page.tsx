"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import BirthDateForm, {
  type BirthDateFormData,
} from "@/components/saju/input/BirthDateForm";
import ConcernSelector from "@/components/saju/input/ConcernSelector";
import AnalysisLoading from "@/components/saju/input/AnalysisLoading";
import {
  readDemoAuth,
  saveDemoAuth,
  type DemoAuth,
  type DemoAuthProvider,
} from "@/lib/saju/demo-auth";
import { createDemoReading, saveDemoReading } from "@/lib/saju/demo-reading";
import type { ConcernType } from "@/types/saju";

/** 시진 value를 시간(hour)으로 변환 */
const SIJI_TO_HOUR: Record<string, number | null> = {
  unknown: null,
  ja: 23,
  chuk: 1,
  in: 3,
  myo: 5,
  jin: 7,
  sa: 9,
  o: 11,
  mi: 13,
  sin: 15,
  yu: 17,
  sul: 19,
  hae: 21,
};

type Step = 1 | 2 | 3;

export default function ReadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<BirthDateFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoAuth, setDemoAuth] = useState<DemoAuth | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDemoAuth(readDemoAuth());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // URL search params에서 히어로 폼 데이터 읽기
  useEffect(() => {
    const name = searchParams.get("name");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const day = searchParams.get("day");
    const hour = searchParams.get("hour");
    const gender = searchParams.get("gender");
    const calendar = searchParams.get("calendar");

    if (name && year && month && day && gender) {
      const timer = window.setTimeout(() => {
        setFormData({
          name,
          year,
          month,
          day,
          time: hour || "unknown",
          gender: gender as "male" | "female",
          calendar: (calendar as "solar" | "lunar") || "solar",
        });
        setStep(2);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  const handleBirthDateSubmit = (data: BirthDateFormData) => {
    setFormData(data);
    setStep(2);
  };

  const handleDemoLogin = (provider: DemoAuthProvider) => {
    setDemoAuth(saveDemoAuth(provider));
    setError(null);
  };

  const handleConcernSubmit = async (concerns: string[]) => {
    if (!formData || isSubmitting) return;

    if (!readDemoAuth()) {
      setError("Google 또는 카카오 버튼을 눌러 체험 계정으로 로그인해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStep(3);

    try {
      const birthHour = SIJI_TO_HOUR[formData.time] ?? null;
      const readingId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `demo-${crypto.randomUUID()}`
          : `demo-${Date.now()}`;

      const reading = createDemoReading(readingId, {
        name: formData.name,
        gender: formData.gender,
        birthYear: Number(formData.year),
        birthMonth: Number(formData.month),
        birthDay: Number(formData.day),
        birthHour,
        birthMinute: 0,
        isLunar: formData.calendar === "lunar",
        isLeapMonth: false,
        concerns: concerns as ConcernType[],
      });

      saveDemoReading(reading);

      window.setTimeout(() => {
        router.push(`/reading/demo/${reading.id}`);
      }, 700);
    } catch (err) {
      console.error("Reading creation error:", err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setStep(2);
      setIsSubmitting(false);
    }
  };

  const handleAnalysisComplete = useCallback(() => {
    // AnalysisLoading 애니메이션 완료 시 호출되지만,
    // 실제 리다이렉트는 handleConcernSubmit에서 처리
  }, []);

  const totalSteps = 2;
  const currentProgress = step <= 2 ? step : 2;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131318' }}>
      {/* 진행 바 (Step 3에서는 숨김) */}
      {step <= 2 && (
        <div className="sticky top-0 z-10" style={{ backgroundColor: '#131318', borderBottom: '1px solid rgba(73,68,84,0.2)' }}>
          <div className="max-w-md mx-auto px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#cac4d0]">
                {currentProgress}/{totalSteps}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(73,68,84,0.3)' }}>
              <motion.div
                className="h-full rounded-full oracle-gradient"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentProgress / totalSteps) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="max-w-md mx-auto px-5 py-8">
        {step <= 2 && (
          <div className="mb-6 rounded-2xl border border-[rgba(73,68,84,0.35)] bg-[#1a1a20] p-4">
            {demoAuth ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#958ea0]">체험 계정</p>
                  <p className="text-sm font-semibold text-[#e4e1e9]">
                    {demoAuth.name}
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(208,188,255,0.12)] px-3 py-1 text-xs font-semibold text-[#d0bcff]">
                  로그인됨
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[#e4e1e9]">
                    체험 계정으로 시작하기
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#958ea0]">
                    실제 OAuth 설정 없이 버튼만 누르면 임시 계정으로 결과지를 받을 수 있습니다.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("google")}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[rgba(73,68,84,0.45)] bg-[#0e0e13] text-sm font-semibold text-[#e4e1e9] transition-colors hover:bg-[#24242b]"
                  >
                    <LogIn size={16} />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("kakao")}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-sm font-semibold text-[#191600] transition-opacity hover:opacity-90"
                  >
                    <LogIn size={16} />
                    Kakao
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BirthDateForm onSubmit={handleBirthDateSubmit} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ConcernSelector
                onSubmit={handleConcernSubmit}
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnalysisLoading onComplete={handleAnalysisComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
