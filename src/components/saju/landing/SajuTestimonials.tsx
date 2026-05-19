"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";

const testimonials = [
  {
    text: "정확도가 놀라울 정도입니다. 많은 운세 사이트를 이용해봤지만, 팔자핀사주의 AI 분석은 제 실제 생각을 읽는 것 같았어요. 완벽한 디자인입니다.",
    name: "사용자 A",
    location: "서울",
    accentColor: "#d0bcff",
    glowColor: "rgba(208,188,255,0.18)",
    initial: "A",
  },
  {
    text: "드디어 성능만큼이나 시각적으로도 훌륭한 운세 서비스가 나왔네요. 재물 전략 리포트가 커리어 전환을 결정하는 데 큰 도움이 되었습니다.",
    name: "사용자 B",
    location: "부산",
    accentColor: "#89ceff",
    glowColor: "rgba(137,206,255,0.18)",
    initial: "B",
  },
  {
    text: "'시간 항해사' 인터페이스는 하나의 예술 작품 같습니다. 2077년의 터미널을 사용하는 기분이에요. 분석 내용이 매우 깊고 실용적입니다.",
    name: "사용자 C",
    location: "대구",
    accentColor: "#ffb95f",
    glowColor: "rgba(255,185,95,0.18)",
    initial: "C",
  },
];

function TestimonialCard({
  t,
  index,
  isInView,
}: {
  t: typeof testimonials[number];
  index: number;
  isInView: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });
  const shadowY = useTransform(mouseY, [-0.5, 0.5], [-8, 8]);
  const shadowX = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: index === 1 ? 32 : 0 } : { opacity: 0, y: 36 }}
      transition={{
        duration: 0.75,
        delay: 0.1 + index * 0.12,
        ease: "easeOut",
      }}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: prefersReduced ? 0 : rotateX,
          rotateY: prefersReduced ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group relative rounded-3xl p-8 h-full cursor-default"
      >
        {/* Card body with layered glass depth */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(35,33,44,0.85) 0%, rgba(22,21,30,0.9) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(73,68,84,0.2)",
          }}
        />
        {/* Inner highlight line at top — creates glass edge look */}
        <div
          className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${t.accentColor}30, transparent)`,
          }}
        />
        {/* Gradient border frame */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
          style={{
            background: `linear-gradient(145deg, ${t.accentColor}18 0%, transparent 50%, ${t.accentColor}10 100%)`,
            border: `1px solid ${t.accentColor}35`,
          }}
        />

        {/* Layered shadow that lifts on hover */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: prefersReduced
              ? `0 8px 32px rgba(0,0,0,0.4), 0 0 40px ${t.glowColor}`
              : undefined,
          }}
          animate={{
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3), 0 0 60px ${t.glowColor}`,
          }}
          whileHover={{
            boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.4), 0 0 80px ${t.glowColor.replace("0.18", "0.3")}`,
          }}
        />

        {/* Accent quote icon */}
        <div
          className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center mb-6"
          style={{
            background: `radial-gradient(circle, ${t.accentColor}20 0%, ${t.accentColor}08 100%)`,
            border: `1px solid ${t.accentColor}35`,
            boxShadow: `0 0 20px ${t.glowColor}`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={t.accentColor}>
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
          </svg>
        </div>

        {/* Stars */}
        <div className="relative z-10 flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={t.accentColor}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>

        <p
          className="relative z-10 text-[#cbc3d7] leading-relaxed mb-6 italic text-sm"
          style={{ fontFamily: "Pretendard, sans-serif" }}
        >
          &ldquo;{t.text}&rdquo;
        </p>

        <div className="relative z-10 flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${t.accentColor}30 0%, ${t.accentColor}10 100%)`,
              border: `1px solid ${t.accentColor}40`,
              color: t.accentColor,
            }}
          >
            {t.initial}
          </div>
          <div>
            <p className="font-bold text-sm text-[#e4e1e9]">{t.name}</p>
            <p className="text-xs text-[#494454]">{t.location} · 베타 테스터</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SajuTestimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="py-28 relative overflow-hidden"
      style={{ backgroundColor: "#131318" }}
    >
      {/* Atmospheric background — NO horizontal line artifact */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(208,188,255,0.05) 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 40% at 20% 100%, rgba(137,206,255,0.04) 0%, transparent 50%)," +
            "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(255,185,95,0.03) 0%, transparent 50%)",
        }}
      />
      {/* Faint starfield */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(208,188,255,0.4) 0.5px, transparent 0)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span
            className="inline-block px-3 py-1 text-xs font-['Space_Grotesk'] uppercase tracking-widest bg-[#d0bcff]/08 text-[#d0bcff] rounded-full"
            style={{ border: "1px solid rgba(208,188,255,0.2)" }}
          >
            베타 테스트 후기
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.06 }}
          className="text-center text-4xl font-bold mb-16"
          style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
        >
          베타 후기
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} isInView={isInView} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-xs text-[#494454] mt-12 font-['Space_Grotesk']"
        >
          * 베타 테스트 참가자 익명 후기 (2025년)
        </motion.p>
      </div>
    </section>
  );
}
