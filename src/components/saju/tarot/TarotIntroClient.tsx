"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { SPREADS, type SpreadType } from "@/lib/tarot/spreads";
import { loginWithGoogle } from "@/services/auth/actions";

interface TarotIntroClientProps {
  isLoggedIn: boolean;
  starBalance: number;
  isAdmin: boolean;
}

const SPREAD_META: Record<SpreadType, { label: string; desc: string; emoji: string }> = {
  one: {
    label: "원 카드",
    desc: "오늘 하루를 관통하는 한 장의 카드",
    emoji: "🌙",
  },
  three: {
    label: "쓰리 카드",
    desc: "과거 · 현재 · 미래의 흐름",
    emoji: "✨",
  },
  celtic: {
    label: "켈틱 크로스",
    desc: "10장으로 펼치는 본격 리딩",
    emoji: "🔮",
  },
};

export default function TarotIntroClient({ isLoggedIn, starBalance }: TarotIntroClientProps) {
  return (
    <div className="relative font-['Pretendard']">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/tarot/characters/luna.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
            style={{ objectPosition: "center 20%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(19,19,24,0.6) 0%, rgba(19,19,24,0.85) 60%, #131318 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d0bcff]/10 border border-[#d0bcff]/30 text-[#d0bcff] text-xs tracking-wider uppercase mb-6"
          >
            ✦ Luna Tarot Reading
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white mb-5"
          >
            달빛이 펼쳐 보이는,<br />
            <span className="bg-gradient-to-r from-[#d0bcff] to-[#a078ff] bg-clip-text text-transparent">
              너의 카드
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-[#cbc3d7] text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            달빛의 점술가 <span className="text-[#d0bcff] font-semibold">루나</span>가 당신의 질문을
            카드 위에 펼칩니다. 원하는 스프레드를 골라보세요.
          </motion.p>

          {isLoggedIn && (
            <p className="mt-5 text-sm text-[#ffb95f]">
              ★ 현재 별 잔액: <span className="font-semibold">{starBalance}</span>
            </p>
          )}
        </div>
      </section>

      {/* Spread cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(Object.keys(SPREAD_META) as SpreadType[]).map((type, i) => {
            const meta = SPREAD_META[type];
            const cost = SPREADS[type].cost;
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
              >
                <Link
                  href={isLoggedIn ? `/tarot/draw?spread=${type}` : `/tarot`}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      void loginWithGoogle("/tarot");
                    }
                  }}
                  className="group block rounded-2xl border border-[#d0bcff]/15 bg-[#1f1f25]/70 backdrop-blur-md p-6 hover:border-[#d0bcff]/50 hover:bg-[#1f1f25] transition-all hover:-translate-y-1"
                >
                  <div className="text-5xl mb-4">{meta.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d0bcff] transition-colors">
                    {meta.label}
                  </h3>
                  <p className="text-sm text-[#cbc3d7] leading-relaxed mb-6 min-h-[3rem]">
                    {meta.desc}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#d0bcff]/10">
                    <span className="text-[#ffb95f] text-sm font-semibold">
                      ★ 별 {cost}개
                    </span>
                    <span className="text-[#d0bcff] text-sm group-hover:translate-x-1 transition-transform">
                      뽑으러 가기 →
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Note */}
        <p className="mt-12 text-center text-xs text-[#cbc3d7]/60">
          ※ 타로 카드는 미래를 단정짓지 않습니다. 당신의 상황과 가능성을 비추는 거울입니다.
        </p>
      </section>
    </div>
  );
}
