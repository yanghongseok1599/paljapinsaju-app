"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { loginWithGoogle } from "@/services/auth/actions";
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion, useInView } from "framer-motion";

interface CharacterCardsProps {
  isLoggedIn?: boolean;
}

const PRIMARY_CHARS = [
  {
    id: "soyeon",
    href: "/chat/charon_f",
    name: "소연",
    service: "연애 분석 / Love Analysis",
    tagline: "당신의 영혼을 타인과 잇는 감정의 실타래를 풀어냅니다.",
    cardImage: "/characters/soyeon-card-v3.jpg",
    color: "#d0bcff",
    glowColor: "rgba(208,188,255,0.4)",
    borderHover: "hover:border-[#d0bcff]/40",
  },
  {
    id: "minjun",
    href: "/chat/minjun",
    name: "민준",
    service: "재물 전략 / Wealth Strategy",
    tagline: "번영의 흐름과 물질적 풍요를 데이터로 계산합니다.",
    cardImage: "/characters/minjun-card-v2.jpg",
    color: "#89ceff",
    glowColor: "rgba(137,206,255,0.4)",
    borderHover: "hover:border-[#89ceff]/40",
  },
  {
    id: "haeun",
    href: "/chat/haeun",
    name: "하은",
    service: "시간 항해사 / Time Navigator",
    tagline: "과거의 순환과 미래의 문을 해독하여 방향을 제시합니다.",
    cardImage: "/characters/haeun-card-v2.jpg",
    color: "#ffb95f",
    glowColor: "rgba(255,185,95,0.4)",
    borderHover: "hover:border-[#ffb95f]/40",
  },
  {
    id: "jian",
    href: "/chat/jian",
    name: "지안",
    service: "운명 설계 / Destiny Architect",
    tagline: "당신 삶의 거대한 청사진과 아키텍처를 분석합니다.",
    cardImage: "/characters/jian-card-v2.jpg",
    color: "#cbc3d7",
    glowColor: "rgba(203,195,215,0.35)",
    borderHover: "hover:border-white/40",
    chipBg: "rgba(53,52,58,0.4)",
    chipBorder: "rgba(73,68,84,0.3)",
  },
] as const;

export default function CharacterCards({ isLoggedIn = false }: CharacterCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const children = el.children;
    if (!children.length) return;
    const firstChild = children[0] as HTMLElement;
    const cardWidth = firstChild.offsetWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    if (index >= 0 && index < PRIMARY_CHARS.length) {
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const children = el.children;
    if (!children[index]) return;
    const child = children[index] as HTMLElement;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
          >
            운세 전문가를 만나보세요
          </h2>
          <p className="text-[#958ea0] text-lg leading-relaxed">
            시간을 관통하는 네 가지 관점으로 당신의 여정을 안내합니다.
          </p>
        </div>
        <span className="font-['Space_Grotesk'] text-[#e9ddff]/60 text-xs tracking-widest uppercase">
          디지털 엔티티 v2.4
        </span>
      </motion.div>

      {/* Mobile: horizontal scroll carousel */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[78vw] gap-4 overflow-x-auto snap-x snap-mandatory px-2 scrollbar-hide"
        >
          {PRIMARY_CHARS.map((char) => (
            <div key={char.id} className="snap-center">
              <CharacterCard char={char} isLoggedIn={isLoggedIn} index={0} isInView={isInView} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 pt-4">
          {PRIMARY_CHARS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-[#d0bcff]" : "w-1.5 bg-[#494454]"
              }`}
              aria-label={`캐릭터 ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRIMARY_CHARS.map((char, i) => (
          <CharacterCard key={char.id} char={char} isLoggedIn={isLoggedIn} index={i} isInView={isInView} />
        ))}
      </div>
    </section>
  );
}

type PrimaryChar = typeof PRIMARY_CHARS[number];

function CharacterCard({
  char,
  isLoggedIn = false,
  index,
  isInView,
}: {
  char: PrimaryChar;
  isLoggedIn?: boolean;
  index: number;
  isInView: boolean;
}) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const prefersReduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 25 });
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["20%", "80%"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const chipBg = "chipBg" in char ? (char as { chipBg?: string }).chipBg : `${char.color}28`;
  const chipBorder = "chipBorder" in char ? (char as { chipBorder?: string }).chipBorder : `${char.color}45`;
  const textColor = char.id === "jian" ? "#cbc3d7" : char.color;

  const cardContent = (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: prefersReduced ? 0 : rotateX,
        rotateY: prefersReduced ? 0 : rotateY,
        transformOrigin: "center center",
      }}
      className="group relative rounded-t-3xl h-[520px] flex flex-col cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      aria-label={`${char.name} - ${char.service}`}
    >
      {/* Inner clip wrapper — keeps image within border-radius */}
      <div className="absolute inset-0 rounded-t-3xl overflow-hidden" />

      {/* Base card glass layer */}
      <div
        className="absolute inset-0 rounded-t-3xl"
        style={{
          background: "rgba(20,19,26,0.6)",
          border: "1px solid rgba(73,68,84,0.25)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Character image — bright, premium treatment */}
      <div className="absolute inset-0 z-0 rounded-t-3xl overflow-hidden">
        <Image
          src={char.cardImage}
          alt={char.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            filter: "saturate(0.95) brightness(1.05) contrast(1.02)",
          }}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 78vw"
        />

        {/* Atmospheric color tint — transparent enough to see character */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-50"
          style={{
            background: `linear-gradient(160deg, ${char.color}18 0%, rgba(13,13,24,0.3) 50%, rgba(13,13,24,0.1) 100%)`,
            mixBlendMode: "color",
            opacity: 0.8,
          }}
        />

        {/* Per-character glow on hover that intensifies */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 60% 50% at ${glowX} ${glowY}, ${char.color}30 0%, transparent 70%)`,
            mixBlendMode: "screen",
          }}
        />

        {/* Bottom gradient for text legibility — stronger */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0e0e13] via-[#131318]/80 via-[40%] to-transparent pointer-events-none"
        />
        {/* Left edge vignette */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0e0e13]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0e0e13]/40 to-transparent pointer-events-none" />
      </div>

      {/* Hover glow border ring */}
      <div
        className="absolute -inset-px rounded-t-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: `0 0 0 1px ${char.color}50, 0 0 60px ${char.color}25 inset`,
        }}
      />
      {/* Outer glow halo */}
      <div
        className="absolute -inset-1 rounded-t-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          boxShadow: `0 8px 60px ${char.color}30, 0 0 80px ${char.color}15`,
        }}
      />

      {/* Scanline texture — subtle */}
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.02] mix-blend-overlay pointer-events-none transition-opacity duration-700 rounded-t-3xl overflow-hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(208,188,255,0.3) 4px, transparent 5px)",
        }}
      />

      {/* Content pinned to bottom */}
      <div className="relative z-10 p-7 mt-auto" style={{ transform: "translateZ(20px)" }}>
        {/* Service chip */}
        <div
          className="backdrop-blur-md px-3 py-1 rounded-full w-fit mb-4"
          style={{
            backgroundColor: chipBg,
            border: `1px solid ${chipBorder}`,
          }}
        >
          <span
            className="font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-tight"
            style={{ color: textColor }}
          >
            {char.service}
          </span>
        </div>

        <h3
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif",
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          {char.name}
        </h3>
        <p className="text-[#a8a0b8] text-sm leading-snug opacity-0 group-hover:opacity-100 mt-2 rounded-none transition-opacity duration-500 ease-out">
          {char.tagline}
        </p>
      </div>
    </motion.div>
  );

  const motionWrapper = (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{
        duration: 0.7,
        delay: 0.15 + index * 0.1,
        ease: "easeOut",
      }}
      className="h-full"
      style={{ perspective: "1200px" }}
    >
      {cardContent}
    </motion.div>
  );

  if (isLoggedIn) {
    return (
      <Link href={char.href} className="block h-full">
        {motionWrapper}
      </Link>
    );
  }

  return (
    <>
      <div className="h-full" onClick={() => setShowLoginPrompt(true)}>
        {motionWrapper}
      </div>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#131318]/70 backdrop-blur-md px-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel rounded-3xl p-8 max-w-sm w-full glow-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#d0bcff]/15 flex items-center justify-center">
                <span className="text-2xl text-[#ffb95f]">★</span>
              </div>
              <h3
                className="text-xl font-bold text-[#e4e1e9] mb-2"
                style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
              >
                가입하고 바로 시작하세요
              </h3>
              <p className="text-sm text-[#958ea0] mb-6 leading-relaxed">
                가입하면{" "}
                <span className="text-[#ffb95f] font-semibold">★ 3개</span>를 무료로 드려요!
                <br />
                바로 대화를 시작할 수 있어요.
              </p>

              <form action={async () => { await loginWithGoogle(char.href); }}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 glass-panel font-semibold py-3.5 rounded-2xl transition-colors cursor-pointer text-sm text-[#e4e1e9] hover:border-[rgba(208,188,255,0.3)]"
                  style={{ borderColor: "rgba(73,68,84,0.3)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google로 시작하기
                </button>
              </form>

              <button
                onClick={() => setShowLoginPrompt(false)}
                className="mt-3 text-sm text-[#958ea0] hover:text-[#cbc3d7] transition-colors"
              >
                나중에 할게요
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
