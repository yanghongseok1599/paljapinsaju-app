"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { markUnlocked } from "@/lib/payments/entitlement";
import {
  clearPendingOrder,
  isValidOrderId,
  readPendingOrder,
  type PendingOrder,
} from "@/lib/payments/milestone";
import type { ClaimResult, ClaimStatus } from "@/app/api/payments/milestone/claim/route";

type View = { phase: "checking" } | { phase: "done"; result: ClaimResult };

export default function CheckoutCompleteClient({ orderId }: { orderId: string | null }) {
  const [view, setView] = useState<View>({ phase: "checking" });
  const [pending, setPending] = useState<PendingOrder | null>(null);

  useEffect(() => {
    let alive = true;

    // 떠날 때 남겨둔 주문 맥락. 돌아오는 URL에는 orderId만 실려온다.
    const context = readPendingOrder();

    const run = async () => {
      if (!isValidOrderId(orderId)) {
        if (alive) {
          setPending(context);
          setView({
            phase: "done",
            result: { status: "invalid", message: "주문번호가 없거나 형식이 올바르지 않습니다." },
          });
        }
        return;
      }

      try {
        const res = await fetch("/api/payments/milestone/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, planId: context?.planId }),
        });
        const result = (await res.json()) as ClaimResult;
        if (!alive) return;

        setPending(context);
        setView({ phase: "done", result });

        // 확인이 끝난 주문 맥락은 치운다. 보류 상태는 남겨둬야
        // 사용자가 새로고침했을 때 무엇을 샀는지 다시 보여줄 수 있다.
        if (result.status === "paid" || result.status === "already_processed") {
          // 검증을 통과했으니 산 상품만 이 결과지에서 해제한다.
          // 상품은 결제사가 확인해 준 planId 를 쓴다 (브라우저에 남긴 맥락은 바꿀 수 있다).
          const paidPlanId = result.planId ?? context?.planId;
          if (context?.readingId && paidPlanId) {
            markUnlocked(context.readingId, paidPlanId, result.orderId ?? String(orderId));
          }
          clearPendingOrder();
        }
      } catch {
        if (!alive) return;
        setPending(context);
        setView({
          phase: "done",
          result: { status: "unverified", message: "결제 확인 요청이 실패했습니다." },
        });
      }
    };

    void run();
    return () => {
      alive = false;
    };
  }, [orderId]);

  if (view.phase === "checking") {
    return (
      <Shell>
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--read-accent)" }} />
        <h1 className="reading-heading mt-5 text-xl font-bold">결제를 확인하고 있어요</h1>
        <p className="reading-muted mt-2 text-center">잠시만 기다려 주세요.</p>
      </Shell>
    );
  }

  const { status, message } = view.result;
  const resolvedOrderId = view.result.orderId ?? orderId;
  const orderName = view.result.orderName ?? pending?.orderName;

  const presets: Record<
    ClaimStatus,
    { icon: React.ReactNode; title: string; body: string; tone: string }
  > = {
    paid: {
      icon: <CheckCircle2 className="h-10 w-10" style={{ color: "var(--read-tone-positive)" }} />,
      title: "결제가 완료됐어요",
      body: "주문이 정상적으로 확인됐습니다.",
      tone: "var(--read-tone-positive)",
    },
    already_processed: {
      icon: <CheckCircle2 className="h-10 w-10" style={{ color: "var(--read-tone-positive)" }} />,
      title: "이미 처리된 주문이에요",
      body: "결제는 정상 완료됐고, 중복으로 처리되지 않았습니다.",
      tone: "var(--read-tone-positive)",
    },
    unverified: {
      icon: <Clock className="h-10 w-10" style={{ color: "var(--read-tone-caution)" }} />,
      title: "결제 확인이 보류됐어요",
      body: "결제 자체는 진행됐을 수 있습니다. 주문번호를 보관해 주세요.",
      tone: "var(--read-tone-caution)",
    },
    not_paid: {
      icon: <AlertCircle className="h-10 w-10" style={{ color: "var(--read-tone-caution)" }} />,
      title: "결제가 확인되지 않았어요",
      body: "결제가 취소됐거나 아직 완료되지 않았습니다.",
      tone: "var(--read-tone-caution)",
    },
    invalid: {
      icon: <AlertCircle className="h-10 w-10" style={{ color: "var(--read-tone-caution)" }} />,
      title: "주문 정보를 읽을 수 없어요",
      body: "결제 페이지를 통해 다시 시도해 주세요.",
      tone: "var(--read-tone-caution)",
    },
  };

  const preset = presets[status];

  return (
    <Shell>
      {preset.icon}
      <h1 className="reading-heading mt-5 text-xl font-bold">{preset.title}</h1>
      <p className="reading-muted mt-2 text-center">{message ?? preset.body}</p>

      {(orderName || resolvedOrderId) && (
        <dl className="reading-card mt-6 w-full rounded-xl p-4">
          {orderName && (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="reading-muted">상품</dt>
              <dd className="reading-body !text-sm font-semibold">{orderName}</dd>
            </div>
          )}
          {resolvedOrderId && (
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <dt className="reading-muted">주문번호</dt>
              <dd className="reading-body !text-sm font-mono break-all">{resolvedOrderId}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-6 flex w-full flex-col gap-2">
        {pending?.readingId && (
          <Link
            href={`/reading/demo/${pending.readingId}`}
            className="w-full rounded-xl py-3.5 text-center text-sm font-semibold"
            style={{ backgroundColor: "var(--read-accent)", color: "var(--read-card)" }}
          >
            결과지로 돌아가기
          </Link>
        )}
        <Link
          href="/"
          className="reading-card reading-heading w-full rounded-xl py-3.5 text-center text-sm font-semibold"
        >
          홈으로
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="reading-surface flex min-h-screen items-center justify-center px-5 py-16">
      <div className="flex w-full max-w-sm flex-col items-center">{children}</div>
    </div>
  );
}
