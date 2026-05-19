/**
 * Toss Payments 서버사이드 API 클라이언트
 * 기본 인증: Base64("${secret}:") — Toss 공식 인증 방식
 */

const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

function getAuthHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) {
    throw new Error('[Toss] TOSS_SECRET_KEY가 설정되지 않았습니다.');
  }
  return `Basic ${Buffer.from(`${secret}:`).toString('base64')}`;
}

export interface TossPayment {
  paymentKey: string;
  orderId: string;
  status: string; // 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED'
  totalAmount: number;
  currency: string;
  method: string;
  approvedAt?: string;
  requestedAt?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

/**
 * 결제를 최종 승인합니다 (클라이언트 → 서버 흐름에서 호출).
 * @see https://docs.tosspayments.com/reference#결제-승인
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<TossPayment> {
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`[Toss] confirmPayment 실패: ${err.message ?? JSON.stringify(err)}`);
  }

  return res.json() as Promise<TossPayment>;
}

/**
 * paymentKey로 결제 정보를 조회합니다 (웹훅 수신 후 서버사이드 검증용).
 * @see https://docs.tosspayments.com/reference#paymentkey로-결제-조회
 */
export async function getPayment(paymentKey: string): Promise<TossPayment> {
  const res = await fetch(`${TOSS_API_BASE}/payments/${encodeURIComponent(paymentKey)}`, {
    headers: {
      Authorization: getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`[Toss] getPayment 실패: ${err.message ?? JSON.stringify(err)}`);
  }

  return res.json() as Promise<TossPayment>;
}
