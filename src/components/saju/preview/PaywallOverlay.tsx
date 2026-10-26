"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { getPlan, FULL_ANALYSIS_PLAN_ID } from "@/lib/payments/milestone";

interface PaywallOverlayProps {
  onPayClick: () => void;
}

export default function PaywallOverlay({ onPayClick }: PaywallOverlayProps) {
  // 가격을 하드코딩하면 카탈로그를 고쳐도 여기만 남는다.
  const plan = getPlan(FULL_ANALYSIS_PLAN_ID)!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky bottom-0 left-0 right-0 pt-16 pb-8 px-5 -mt-24"
      style={{ background: 'linear-gradient(to top, #131318 60%, rgba(19,19,24,0.95) 80%, transparent 100%)' }}
    >
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(208,188,255,0.15)' }}>
          <Lock className="w-5 h-5 text-[#d0bcff]" />
        </div>
        <h3 className="text-lg font-bold mb-1 text-[#e4e1e9]">
          전체 분석 결과 보기
        </h3>
        <p className="text-sm mb-5 text-[#958ea0]">
          결제하면 잠긴 항목이 모두 열려요
        </p>
        <button
          onClick={onPayClick}
          className="w-full oracle-gradient active:scale-[0.98] font-semibold text-base py-4 rounded-xl transition-opacity hover:opacity-90"
          style={{ color: '#3c0091' }}
        >
          {plan.amount.toLocaleString("ko-KR")}원에 전체 분석 보기
        </button>
        <p className="text-xs mt-3 text-[#958ea0]">
          결제 즉시 전체 분석 PDF를 받아보세요
        </p>
      </div>
    </motion.div>
  );
}
