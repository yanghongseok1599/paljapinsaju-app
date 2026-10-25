import type { Metadata } from "next";
import CheckoutCompleteClient from "@/components/saju/payment/CheckoutCompleteClient";

export const metadata: Metadata = {
  title: "결제 확인",
  robots: { index: false, follow: false },
};

/**
 * 외부 결제 복귀 지점.
 * 결제 측이 `/checkout/complete?orderId=xxx` 로 되돌려보낸다.
 */
export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return <CheckoutCompleteClient orderId={orderId ?? null} />;
}
