"use client";

import Image from "next/image";
import { STAR_SHOP_OPEN } from "@/lib/toss/config";
import { useRouter } from "@/i18n/routing";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleDeck, type TarotCard } from "@/lib/tarot/cards";
import { SPREADS, type SpreadType } from "@/lib/tarot/spreads";
import { toast } from "sonner";

interface TarotDrawClientProps {
  spread: SpreadType;
  cost: number;
  isLoggedIn: boolean;
  isAdmin: boolean;
  starBalance: number;
}

type Phase = "greet" | "shuffling" | "picking" | "submitting";

const SPREAD_LABEL: Record<SpreadType, string> = {
  one: "원 카드",
  three: "쓰리 카드",
  celtic: "켈틱 크로스 (10장)",
};

export default function TarotDrawClient({
  spread,
  cost,
  isLoggedIn,
  isAdmin,
  starBalance,
}: TarotDrawClientProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("greet");
  const [question, setQuestion] = useState("");
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [picked, setPicked] = useState<Array<{ card: TarotCard; reversed: boolean; index: number }>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const targetCount = SPREADS[spread].count;
  const positions = SPREADS[spread].positions;

  const insufficient = !isAdmin && starBalance < cost;

  const handleStart = useCallback(() => {
    if (!isLoggedIn) {
      toast.error("로그인이 필요해요");
      return;
    }
    if (insufficient) {
      toast.error(`별이 ${cost - starBalance}개 부족해요.${STAR_SHOP_OPEN ? " 충전이 필요합니다." : ""}`);
      return;
    }
    setPhase("shuffling");
    // 셔플 애니메이션 후 picking 단계 진입
    setTimeout(() => {
      setDeck(shuffleDeck());
      setPhase("picking");
    }, 1400);
  }, [isLoggedIn, insufficient, cost, starBalance]);

  const handlePick = useCallback(
    (index: number) => {
      if (picked.some((p) => p.index === index)) return;
      const card = deck[index];
      const reversed = Math.random() < 0.5;
      setPicked((prev) => [...prev, { card, reversed, index }]);
    },
    [deck, picked],
  );

  // 모두 뽑으면 submit
  const submit = useCallback(async () => {
    if (picked.length !== targetCount) return;
    setPhase("submitting");
    setErrorMsg(null);
    try {
      const body = {
        spread,
        cards: picked.map((p, i) => ({
          cardId: p.card.id,
          reversed: p.reversed,
          position: positions[i],
        })),
        characterId: "luna_f",
        question: question.trim() || undefined,
      };
      const res = await fetch("/api/saju/tarot/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setErrorMsg("로그인이 필요해요. 다시 로그인 후 시도해주세요.");
        return;
      }
      if (res.status === 402) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(`별이 부족해요. 필요: ${data.required ?? cost}개`);
        return;
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setErrorMsg(`리딩 생성 실패 (${res.status}): ${txt || "잠시 후 다시 시도해주세요"}`);
        return;
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/tarot/result/${id}`);
    } catch (e) {
      setErrorMsg(`네트워크 오류: ${(e as Error).message}`);
    }
  }, [picked, targetCount, spread, positions, question, cost, router]);

  // 자동 submit — 모두 뽑힌 직후 단 1회만. 실패 시 자동 재시도하지 않음(에러 화면에서 사용자가 결정).
  // submit 내부에서 setState를 즉시 호출하므로, effect와 분리하기 위해 다음 tick으로 미룬다.
  useEffect(() => {
    if (phase === "picking" && picked.length === targetCount && !submittedRef.current) {
      submittedRef.current = true;
      const t = setTimeout(() => {
        void submit();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [phase, picked.length, targetCount, submit]);

  return (
    <div className="font-['Pretendard'] max-w-5xl mx-auto px-6 pt-12 pb-24">
      {/* 캐릭터 + 인사 */}
      {phase === "greet" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-8 mb-10"
        >
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-[#d0bcff]/30 flex-shrink-0">
            <Image
              src="/tarot/characters/luna.webp"
              alt="루나"
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs tracking-wider uppercase text-[#d0bcff] mb-2">
              ✦ {SPREAD_LABEL[spread]}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              안녕, <span className="text-[#d0bcff]">루나</span>야
            </h1>
            <p className="text-[#cbc3d7] text-base leading-relaxed max-w-xl">
              오늘은 어떤 마음으로 카드를 펼치고 싶어? 묻고 싶은 게 있다면 적어줘. 없어도 괜찮아 —
              카드가 알아서 흐름을 보여줄 거야.
            </p>
          </div>
        </motion.div>
      )}

      {phase === "greet" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
            placeholder="예) 다음 달부터 시작하는 새 프로젝트, 어떻게 풀릴까?"
            rows={3}
            className="w-full px-5 py-4 rounded-2xl bg-[#1f1f25] border border-[#d0bcff]/15 focus:border-[#d0bcff]/50 outline-none text-white placeholder:text-[#cbc3d7]/40 text-sm md:text-base resize-none transition-colors"
          />
          <div className="flex items-center justify-between text-xs text-[#cbc3d7]/60 px-2">
            <span>{question.length}/300</span>
            <span>
              {isAdmin ? "★ 어드민 (무료)" : `★ 비용 ${cost}개 · 잔액 ${starBalance}개`}
            </span>
          </div>
          <button
            onClick={handleStart}
            disabled={!isLoggedIn || insufficient}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#3c0091] font-bold text-base shadow-lg shadow-[#d0bcff]/20 hover:shadow-xl hover:shadow-[#d0bcff]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoggedIn ? "로그인이 필요해요" : insufficient ? `★ ${cost - starBalance}개 부족` : "카드 셔플 시작"}
          </button>
        </motion.div>
      )}

      {/* 셔플 애니메이션 */}
      {phase === "shuffling" && (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-32 h-48 mb-6" aria-live="polite" role="status">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#d0bcff] to-[#a078ff] border-2 border-[#d0bcff]/40 shadow-xl shadow-[#d0bcff]/20"
                initial={{ rotate: 0, x: 0, y: 0 }}
                animate={{
                  rotate: [0, (i - 2) * 15, 0],
                  x: [0, (i - 2) * 25, 0],
                  y: [0, Math.abs(i - 2) * -10, 0],
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
          <p className="text-[#cbc3d7] text-sm">루나가 카드를 섞는 중...</p>
        </div>
      )}

      {/* 카드 픽킹 */}
      {phase === "picking" && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              카드를 {targetCount}장 골라줘
            </h2>
            <p className="text-sm text-[#cbc3d7]">
              현재 {picked.length} / {targetCount} 장 선택됨
            </p>
            {question && (
              <p className="mt-3 text-xs text-[#d0bcff]/80 italic">&ldquo;{question}&rdquo;</p>
            )}
          </div>

          {/* 카드 부채 */}
          <div className="relative h-[320px] md:h-[400px] flex items-center justify-center overflow-x-auto pb-4">
            <div className="relative" style={{ width: "min(900px, 90vw)" }}>
              {deck.slice(0, 78).map((card, i) => {
                const isPicked = picked.some((p) => p.index === i);
                const angle = ((i - 39) / 39) * 28; // -28 ~ +28도
                const offsetX = ((i - 39) / 39) * 280;
                return (
                  <motion.button
                    key={card.id}
                    onClick={() => handlePick(i)}
                    disabled={isPicked || picked.length >= targetCount}
                    className={`absolute top-1/2 left-1/2 w-16 h-24 md:w-20 md:h-32 rounded-lg border-2 transition-all ${
                      isPicked
                        ? "border-[#ffb95f] opacity-30 cursor-not-allowed"
                        : "border-[#d0bcff]/40 hover:border-[#d0bcff] hover:scale-110 hover:-translate-y-3 cursor-pointer"
                    }`}
                    style={{
                      transform: `translate(calc(-50% + ${offsetX}px), -50%) rotate(${angle}deg)`,
                      background: "linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)",
                      boxShadow: isPicked ? "none" : "0 4px 12px rgba(208,188,255,0.15)",
                      zIndex: i,
                    }}
                    aria-label={`카드 ${i + 1}`}
                  >
                    <span className="block w-full h-full bg-[url('/tarot/back.webp')] bg-cover bg-center rounded-md opacity-90" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 선택된 카드 표시 */}
          {picked.length > 0 && (
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              {picked.map((p, i) => (
                <motion.div
                  key={`picked-${p.index}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-10 h-14 rounded-md bg-gradient-to-br from-[#d0bcff] to-[#a078ff] border border-[#ffb95f] flex items-center justify-center text-[10px] font-bold text-[#3c0091]"
                  title={`${positions[i]}: ${p.card.nameEn}${p.reversed ? " (R)" : ""}`}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === "submitting" && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-6">
          {!errorMsg ? (
            <>
              <motion.div
                className="w-12 h-12 rounded-full border-4 border-[#d0bcff]/20 border-t-[#d0bcff]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-[#cbc3d7] text-sm">결과 페이지로 이동 중...</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-rose-300 text-sm md:text-base max-w-md leading-relaxed mb-6">
                {errorMsg}
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => {
                    submittedRef.current = false;
                    setErrorMsg(null);
                    setPhase("picking");
                    setTimeout(() => {
                      submittedRef.current = true;
                      void submit();
                    }, 0);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#3c0091] font-semibold text-sm"
                >
                  다시 시도
                </button>
                <button
                  onClick={() => {
                    submittedRef.current = false;
                    setErrorMsg(null);
                    setPicked([]);
                    setPhase("greet");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#1f1f25] border border-[#d0bcff]/20 text-[#d0bcff] text-sm"
                >
                  처음부터
                </button>
              </div>
              <p className="mt-4 text-[11px] text-[#cbc3d7]/50">
                Supabase 마이그레이션이 적용됐는지 확인이 필요할 수 있어요 (tarot_readings 테이블).
              </p>
            </>
          )}
        </div>
      )}

      <AnimatePresence />
    </div>
  );
}
