"use client";

import { useState, useRef } from "react";
import { ACCOUNTS_ENABLED } from "@/lib/accounts";
import { STAR_SHOP_OPEN } from "@/lib/toss/config";
import { motion, useInView, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "천기 오라클의 알고리즘은 어떻게 작동하나요?",
    a: "본 시스템은 수 세기 동안 축적된 점성술 데이터와 현대의 머신러닝 패턴을 결합하여, 천체 위치와 인간 행동 결과 사이의 통계적 정렬을 찾아냅니다.",
  },
  {
    q: "개인 정보는 안전하게 보호되나요?",
    // 개인정보처리방침(보호 조치·국외 이전)과 같은 내용만 적는다
    a: !ACCOUNTS_ENABLED
      ? "입력한 사주 정보와 결과는 서버에 저장하지 않고 쓰시는 브라우저에만 저장해요. PDF를 만들 때만 잠깐 전송되고 저장하지 않아요. 주문자 정보와 결제는 결제 페이지(trainer-milestone.com)에서만 처리돼요."
      : "가입 없이 받는 무료 체험은 입력한 정보와 결과를 서버에 저장하지 않고 쓰시는 브라우저에만 저장해요. 로그인하면 사주 정보와 상담 내용이 계정에 저장되고, 모든 전송은 HTTPS로 암호화되며 기록은 본인만 볼 수 있어요. AI 상담·해석을 위해 이름·생년월일시와 질문이 OpenAI로 전달되지만 AI 학습에는 쓰이지 않아요. 자세한 내용은 개인정보처리방침에 있어요.",
  },
  {
    q: "여러 기기에서 분석 내용을 확인할 수 있나요?",
    a: !ACCOUNTS_ENABLED
      ? "결과는 지금 쓰는 브라우저에만 저장돼요. 결제한 결과지는 '인쇄/PDF 저장'으로 보관해 두세요. 브라우저 저장 데이터를 지우면 다시 볼 수 없어요."
      : "로그인해서 받은 상담과 리포트는 계정에 저장돼 어느 기기에서든 다시 볼 수 있어요. 가입 없이 받은 무료 체험 결과와 그 결과지에서 결제한 내용은 지금 쓰는 브라우저에만 저장되니, 결과지의 '인쇄/PDF 저장'으로 보관해 두세요. 브라우저 저장 데이터를 지우면 다시 볼 수 없어요.",
  },
  ...(ACCOUNTS_ENABLED
    ? [
        {
          q: "별(★)은 뭔가요?",
          a: `별은 대화에 사용되는 포인트예요. 별 1개 = 메시지 1회이고, 모든 상담사에서 공통으로 사용됩니다. 로그인하면 총 3개를 무료로 드려요.${STAR_SHOP_OPEN ? " 더 필요하시면 코인샵에서 충전할 수 있어요." : ""}`,
        },
      ]
    : []),
  {
    q: "태어난 시간을 모르면 어떻게 하나요?",
    a: "태어난 시간 없이도 연주, 월주, 일주 3기둥으로 분석이 가능합니다.",
  },
];

export default function SajuFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="py-28 px-8 max-w-4xl mx-auto relative">
      {/* Subtle ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(208,188,255,0.04) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold mb-14 text-center"
        style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
      >
        자주 묻는 질문
      </motion.h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.08 + i * 0.06, ease: "easeOut" }}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: isOpen
                  ? "rgba(35,33,44,0.85)"
                  : "rgba(25,24,32,0.7)",
                border: isOpen
                  ? "1px solid rgba(208,188,255,0.18)"
                  : "1px solid rgba(73,68,84,0.18)",
                backdropFilter: "blur(12px)",
                boxShadow: isOpen
                  ? "0 8px 40px rgba(208,188,255,0.06), 0 2px 16px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.2)",
                transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={isOpen}
              >
                <span
                  className="font-bold text-base pr-4"
                  style={{ color: isOpen ? "#d0bcff" : "#e4e1e9" }}
                >
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-shrink-0"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isOpen ? "#d0bcff" : "#958ea0"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-8 pb-7 text-[#a8a0b8] leading-relaxed text-sm">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
