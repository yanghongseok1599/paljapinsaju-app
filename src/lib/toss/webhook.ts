/**
 * Toss Payments 웹훅 서명 검증
 *
 * Toss는 웹훅 요청 헤더 `Toss-Signature`에 HMAC-SHA256 서명을 포함합니다.
 * 서명값은 rawBody를 TOSS_WEBHOOK_SECRET_KEY로 서명한 hex digest입니다.
 *
 * 보안 요건:
 *  - crypto.timingSafeEqual 로 타이밍 공격 방지 (=== 절대 금지)
 *  - 길이가 다른 경우 false 반환 (에러 발생 방지)
 *
 * @see https://docs.tosspayments.com/guides/webhook
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyTossWebhookSignature(
  rawBody: string,
  headerSignature: string,
): boolean {
  const secret = process.env.TOSS_WEBHOOK_SECRET_KEY;
  if (!secret) {
    console.error('[Toss Webhook] TOSS_WEBHOOK_SECRET_KEY가 설정되지 않았습니다.');
    return false;
  }

  const computed = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

  try {
    return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(headerSignature, 'hex'));
  } catch {
    // 길이 불일치 (hex 디코딩 실패 포함) → 잘못된 서명으로 처리
    return false;
  }
}

/**
 * Toss 웹훅 이벤트 타입
 * @see https://docs.tosspayments.com/guides/webhook#이벤트-종류
 */
export type TossWebhookEventType =
  | 'PAYMENT_STATUS_CHANGED'
  | 'TRANSACTION_STATUS_CHANGED'
  | 'BILLING_KEY_STATUS_CHANGED';

/**
 * Toss 웹훅 페이로드 (필요한 필드만)
 */
export interface TossWebhookPayload {
  eventType: TossWebhookEventType;
  createdAt: string; // ISO 8601 — replay window 검증에 사용
  data: {
    paymentKey: string;
    orderId: string;
    status: string;
    approvedAt?: string;
    requestedAt?: string;
    totalAmount?: number;
    metadata?: Record<string, string>;
  };
}
