"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { TOSS_CONFIG, getStarPackById, type StarPack } from "@/lib/toss/config";
import { Button } from "@/components/ui/button";

interface TossCheckoutProps {
  userId: string;
  pack: StarPack;
  userEmail?: string;
  onSuccess?: () => void;
}

function generateOrderId(packId: string): string {
  // orderId 형식: {packId}__{uuid} — confirm 엔드포인트가 packId를 파싱합니다
  return `${packId}__${crypto.randomUUID()}`;
}

export default function TossCheckout({
  userId,
  pack,
  userEmail,
  onSuccess,
}: TossCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!TOSS_CONFIG.clientKey) {
      setError("결제 시스템이 초기화되지 않았습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tossPayments = await loadTossPayments(TOSS_CONFIG.clientKey);

      const widget = tossPayments.widgets({
        customerKey: userId,
      });

      const orderId = generateOrderId(pack.id);
      const successUrl = `${window.location.origin}/api/payments/toss/confirm`;
      const failUrl = `${window.location.origin}/ko/coin-shop?error=payment_cancelled`;

      // 위젯 API: setAmount 먼저 호출 후 requestPayment (WithRedirection 오버로드)
      await widget.setAmount({ currency: "KRW", value: pack.priceKrw });

      await widget.requestPayment({
        orderId,
        orderName: pack.name,
        successUrl,
        failUrl,
        customerEmail: userEmail,
        customerName: userEmail?.split("@")[0] ?? "고객",
      });

      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "결제를 시작할 수 없습니다.";
      // 사용자가 직접 닫은 경우 오류 표시 생략
      if (!msg.includes("PAY_PROCESS_CANCELED")) {
        setError("결제 시스템을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        console.error("[TossCheckout]", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full h-14 rounded-2xl text-lg font-semibold transition-colors disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)",
          color: "#ffffff",
        }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span
              className="h-5 w-5 rounded-full animate-spin"
              style={{
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#ffffff",
              }}
            />
            결제 준비 중...
          </span>
        ) : (
          `${pack.name} ${pack.priceKrw.toLocaleString("ko-KR")}원 결제하기`
        )}
      </Button>

      {error && (
        <p className="text-center text-xs mt-2 text-red-400">{error}</p>
      )}

      <p className="text-center text-xs mt-3" style={{ color: "#958ea0" }}>
        Toss Payments 안전 결제 시스템으로 처리됩니다
      </p>
    </div>
  );
}
