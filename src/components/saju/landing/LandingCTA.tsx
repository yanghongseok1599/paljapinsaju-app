"use client";

import { Link } from "@/i18n/routing";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export default function LandingCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();

  return (
    <section ref={sectionRef} className="py-40 relative text-center overflow-hidden">
      {/* Full atmospheric backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(160,120,255,0.18) 0%, rgba(208,188,255,0.06) 40%, transparent 70%)," +
            "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(137,206,255,0.08) 0%, transparent 50%)," +
            "radial-gradient(ellipse 50% 50% at 80% 20%, rgba(255,185,95,0.05) 0%, transparent 50%)," +
            "#0e0e13",
        }}
      />
      {/* Dense starfield */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 0.5px, transparent 0)," +
            "radial-gradient(circle at 1px 1px, rgba(208,188,255,0.4) 0.5px, transparent 0)",
          backgroundSize: "55px 55px, 37px 37px",
          backgroundPosition: "0 0, 18px 20px",
        }}
      />
      {/* Bright stars */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.85) 1px, transparent 0)",
          backgroundSize: "130px 130px",
          backgroundPosition: "50px 60px",
        }}
      />

      {/* Animated central glow orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(160,120,255,0.2) 0%, rgba(208,188,255,0.06) 50%, transparent 70%)",
          filter: "blur(40px)",
          animation: prefersReduced ? "none" : "orbFloat 10s ease-in-out infinite",
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="max-w-4xl mx-auto px-8 relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="font-['Space_Grotesk'] text-[#89ceff] tracking-[0.4em] uppercase text-[0.7rem] opacity-80">
            운명은 기다리지 않습니다
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.08, ease: "easeOut" }}
          className="font-black leading-[1.1] tracking-tighter mb-16"
          style={{
            fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif",
            fontSize: "clamp(3.5rem, 9vw, 7rem)",
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #d0bcff 45%, #a078ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 0 40px rgba(208,188,255,0.3))",
            }}
          >
            당신의 운명을
          </span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #d0bcff 0%, #89ceff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(137,206,255,0.25))",
            }}
          >
            직접 설계하세요.
          </span>
        </motion.h2>

        {/* CTA Button — substantial with glow */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <Link
            href="/chat/charon_m"
            className="group relative inline-flex items-center gap-4 px-14 py-6 font-bold text-xl rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.05]"
            style={{
              background: "linear-gradient(135deg, #d0bcff 0%, #a078ff 50%, #7040cc 100%)",
              color: "#1a0050",
              boxShadow:
                "0 0 60px rgba(208,188,255,0.35), 0 0 100px rgba(160,120,255,0.2), 0 16px 48px rgba(160,120,255,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <span className="relative z-10">지금 시작하기</span>
            {/* Arrow icon */}
            <svg
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            {/* Shimmer sweep on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </Link>
        </motion.div>

        {/* Secondary micro-copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-[#494454] text-sm font-['Space_Grotesk']"
        >
          가입 즉시 ★ 3개 무료 제공 · 신용카드 불필요
        </motion.p>
      </div>
    </section>
  );
}
