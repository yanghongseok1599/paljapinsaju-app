"use client";

import { useState } from "react";
import PreviewCard from "@/components/saju/preview/PreviewCard";
import PaywallOverlay from "@/components/saju/preview/PaywallOverlay";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { TOSS_CONFIG, STAR_PACKS, STAR_SHOP_OPEN } from "@/lib/toss/config";
import type { SajuReading } from "@/types/saju";

interface ReadingPreviewProps {
  reading: SajuReading;
  locale: string;
}

function generateOrderId(packId: string): string {
  return `${packId}__${crypto.randomUUID()}`;
}

export default function ReadingPreview({
  reading,
  locale,
}: ReadingPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayClick = async () => {
    if (isLoading) return;
    if (!TOSS_CONFIG.clientKey) return;

    setIsLoading(true);
    try {
      // 읽기 미리보기에서는 가장 작은 팩(star_30) 기본 안내
      const pack = STAR_PACKS[0];
      const tossPayments = await loadTossPayments(TOSS_CONFIG.clientKey);
      const widget = tossPayments.widgets({
        customerKey: reading.user_id ?? "anonymous",
      });
      const orderId = generateOrderId(pack.id);

      await widget.setAmount({ currency: "KRW", value: pack.priceKrw });

      await widget.requestPayment({
        orderId,
        orderName: pack.name,
        successUrl: `${window.location.origin}/api/payments/toss/confirm`,
        failUrl: `${window.location.origin}/${locale}/coin-shop?error=payment_cancelled`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("PAY_PROCESS_CANCELED")) {
        console.error("Toss checkout error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PreviewCard reading={reading} />
      {STAR_SHOP_OPEN && <PaywallOverlay onPayClick={handlePayClick} />}
    </>
  );
}
