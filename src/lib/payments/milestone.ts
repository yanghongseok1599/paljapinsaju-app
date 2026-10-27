/**
 * trainer-milestone.com 외부 결제 연동.
 *
 * 흐름
 *  1. 결과 페이지에서 체크아웃 URL로 이동 (buildCheckoutUrl)
 *  2. 결제 완료 후 결제 측이 `returnUrl?orderId=xxx` 로 되돌려보낸다
 *  3. /checkout/complete 가 orderId를 받아 서버에 검증을 요청한다
 *
 * ⚠️ returnUrl에는 쿼리를 붙이지 않는다.
 * 결제 측이 returnUrl 뒤에 `?orderId=` 를 그대로 이어붙이기 때문에,
 * returnUrl이 이미 `?`를 갖고 있으면 `...?planId=x?orderId=y` 처럼 깨진다.
 * 그래서 주문 맥락(어떤 상품을 샀는지)은 URL이 아니라 세션 저장소에 남긴다.
 */
import { PAID_CATEGORIES } from "@/lib/saju/categories";

export const MILESTONE_CHECKOUT_URL = "https://trainer-milestone.com/checkout";

/** 결제 완료 후 돌아올 경로 (쿼리 없음) */
export const RETURN_PATH = "/checkout/complete";

export type PaymentMode = "onetime" | "billing";

export interface CheckoutParams {
  planId: string;
  /** 원 단위 정수 */
  amount: number;
  orderName: string;
  /** 절대 URL. 쿼리스트링을 포함하지 않아야 한다. */
  returnUrl: string;
  /** 정기결제는 "billing" */
  paymentMode?: PaymentMode;
  /** 결제한 결과지 ID. 마일스톤이 주문에 저장했다가 주문 조회 때 돌려준다 */
  resultId?: string;
}

export function buildCheckoutUrl({
  planId,
  amount,
  orderName,
  returnUrl,
  paymentMode = "onetime",
  resultId,
}: CheckoutParams): string {
  const params = new URLSearchParams({
    paymentMode,
    // 결제 페이지는 화면 표시를 type 으로 정하고, 없으면 "구독 서비스 · 월간 구독 · /월"로 보여준다.
    // 1회성 상품이 매달 결제되는 것처럼 보이지 않게 함께 넘긴다.
    type: paymentMode === "onetime" ? "onetime" : "subscription",
    // 결제 화면이 마일스톤 약관 대신 팔자핀사주 약관·환불정책을 보여주게 한다.
    // (마일스톤은 returnUrl 이 허용 목록에 있을 때만 이 값을 인정한다)
    brand: "paljapinsaju",
    planId,
    amount: String(amount),
    orderName,
  });
  // 결과는 이 결과지에서만 열린다 (claim 이 주문의 resultId 와 맞춰 본다)
  if (resultId) params.set("resultId", resultId);

  // returnUrl은 맨 뒤에 둔다. 결제 측이 이 값 뒤에 ?orderId= 를 붙이므로
  // 로그에서 눈으로 확인하기 쉬운 위치가 낫다.
  return `${MILESTONE_CHECKOUT_URL}?${params.toString()}&returnUrl=${encodeURIComponent(returnUrl)}`;
}

// ───────────────────────── 상품 ─────────────────────────

/**
 * 테스트 결제 금액.
 *
 * `NEXT_PUBLIC_PAYMENT_TEST_AMOUNT`가 설정되면 모든 상품의 **결제 금액만** 이 값으로
 * 덮어쓴다. 카탈로그의 정가는 건드리지 않으므로 상품 목록에는 원래 가격이 그대로 보인다.
 *
 * 결제 버튼(클라이언트)과 주문 검증(서버)이 반드시 같은 금액을 봐야 하므로
 * NEXT_PUBLIC_ 접두사가 필요하다. 이 값은 비밀이 아니다.
 *
 * 운영에서는 이 변수를 빼면 정가로 돌아간다.
 */
export const TEST_AMOUNT: number | null = (() => {
  // 운영 배포에서는 무시한다. 남겨두면 모든 상품이 테스트 금액에 팔리고 서버도 그 금액을 정상으로 인정한다.
  // (NEXT_PUBLIC_VERCEL_ENV 는 Vercel 이 빌드 때 넣어 주는 값이라 브라우저와 서버가 같은 값을 본다)
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") return null;
  const raw = process.env.NEXT_PUBLIC_PAYMENT_TEST_AMOUNT;
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
})();

export interface Plan {
  id: string;
  /** 실제로 결제를 요청할 금액. 테스트 모드면 TEST_AMOUNT. */
  amount: number;
  /** 카탈로그 정가. 테스트 모드에서 원래 가격을 함께 보여주기 위해 남긴다. */
  listAmount: number;
  orderName: string;
}

/** 카테고리 상담 외에 결과 페이지에서 파는 기본 상품 */
const FULL_ANALYSIS_LIST_PRICE = 19900;

export const FULL_ANALYSIS_PLAN_ID = "full_analysis";

function toPlan(id: string, listAmount: number, orderName: string): Plan {
  return {
    id,
    listAmount,
    amount: TEST_AMOUNT ?? listAmount,
    orderName,
  };
}

/**
 * planId → 상품. 금액은 **서버에서 이 값으로 검증**한다.
 * 클라이언트가 보낸 amount를 신뢰하지 않는다.
 */
export function getPlan(planId: string): Plan | undefined {
  if (planId === FULL_ANALYSIS_PLAN_ID) {
    return toPlan(FULL_ANALYSIS_PLAN_ID, FULL_ANALYSIS_LIST_PRICE, "종합 사주분석 전체 보기");
  }

  const category = PAID_CATEGORIES.find((c) => c.id === planId);
  if (!category) return undefined;

  return toPlan(category.id, category.priceKrw, `${category.name} 상담`);
}

// ───────────────────────── orderId ─────────────────────────

/**
 * 결제 측이 돌려주는 orderId 형식 검증.
 * 영문·숫자·하이픈·밑줄만 허용하고 길이를 제한한다.
 * (URL에서 그대로 받은 값이라 DB나 외부 호출에 넣기 전에 반드시 검사)
 */
const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{6,128}$/;

export function isValidOrderId(value: unknown): value is string {
  return typeof value === "string" && ORDER_ID_PATTERN.test(value);
}

// ───────────────────── 진행 중 주문 맥락 ─────────────────────

const PENDING_KEY = "paljapin.payment.pending";

export interface PendingOrder {
  planId: string;
  amount: number;
  orderName: string;
  /** 어떤 결과지에서 시작했는지 — 결제 후 그 결과지로 되돌린다 */
  readingId?: string;
  startedAt: string;
}

export function savePendingOrder(order: Omit<PendingOrder, "startedAt">): void {
  try {
    window.sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ ...order, startedAt: new Date().toISOString() }),
    );
  } catch {
    // 저장소를 못 쓰면 맥락 없이 orderId만으로 처리된다
  }
}

export function readPendingOrder(): PendingOrder | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOrder;
    return typeof parsed?.planId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingOrder(): void {
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // 무시
  }
}
