"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import {
  buildCheckoutUrl,
  getPlan,
  savePendingOrder,
  RETURN_PATH,
  TEST_AMOUNT,
} from "@/lib/payments/milestone";
import { PRICING_PROVISIONAL } from "@/lib/saju/categories";
import RefundNotice from "./RefundNotice";

interface MilestoneCheckoutButtonProps {
  /** 카테고리 id 또는 "full_analysis" */
  planId: string;
  /** 결제 후 되돌아갈 결과지 */
  readingId?: string;
  /** 버튼 위에 붙는 설명 */
  note?: string;
}

export default function MilestoneCheckoutButton({
  planId,
  readingId,
  note,
}: MilestoneCheckoutButtonProps) {
  const [leaving, setLeaving] = useState(false);
  const plan = getPlan(planId);

  if (!plan) return null;

  const isTestAmount = TEST_AMOUNT !== null && plan.amount !== plan.listAmount;

  const handleClick = () => {
    setLeaving(true);

    // 어떤 상품을 샀는지는 돌아올 때 URL로 오지 않는다 (orderId만 온다).
    // 그래서 떠나기 전에 맥락을 남겨둔다.
    savePendingOrder({
      planId: plan.id,
      amount: plan.amount,
      orderName: plan.orderName,
      readingId,
    });

    // location.href 대입은 React Compiler 린트가 막는다. assign()을 쓴다.
    window.location.assign(
      buildCheckoutUrl({
        planId: plan.id,
        amount: plan.amount,
        orderName: plan.orderName,
        returnUrl: `${window.location.origin}${RETURN_PATH}`,
        paymentMode: "onetime",
      }),
    );
  };

  return (
    <div className="reading-card flex flex-col items-center rounded-2xl p-6">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--read-accent-soft)" }}
      >
        <Lock className="h-5 w-5" style={{ color: "var(--read-accent)" }} />
      </div>

      <h3 className="reading-heading text-lg font-bold">{plan.orderName}</h3>

      {isTestAmount && (
        <span
          className="mt-2 rounded-full px-3 py-1 text-xs font-bold"
          style={{
            color: "var(--read-tone-caution)",
            backgroundColor: "color-mix(in srgb, var(--read-tone-caution) 14%, transparent)",
          }}
        >
          테스트 결제 · 정가 {plan.listAmount.toLocaleString("ko-KR")}원
        </span>
      )}

      {note && <p className="reading-muted mt-1 text-center">{note}</p>}

      <button
        type="button"
        onClick={handleClick}
        disabled={leaving}
        className="mt-5 w-full rounded-xl py-4 text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "var(--read-accent)", color: "var(--read-card)" }}
      >
        {leaving
          ? "결제 페이지로 이동 중..."
          : `${plan.amount.toLocaleString("ko-KR")}원 결제하기`}
      </button>

      <p className="reading-muted mt-3 text-center text-xs">
        결제는 trainer-milestone.com에서 진행됩니다
        {!isTestAmount && PRICING_PROVISIONAL && " · 가격 미확정(임시)"}
      </p>
      <RefundNotice kind="report" className="reading-muted mt-2 text-center" />

    </div>
  );
}
