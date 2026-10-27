/**
 * 외부 결제(trainer-milestone.com) 주문 확인 엔드포인트.
 *
 * /checkout/complete 페이지가 URL에서 받은 orderId를 여기로 보낸다.
 *
 * ⚠️ 왜 서버가 필요한가 — 두 가지 이유
 *  1. 되돌아오는 URL의 orderId는 사용자가 마음대로 바꿀 수 있다.
 *     (`/checkout/complete?orderId=아무거나`를 직접 입력하면 끝)
 *     그래서 결제사에 직접 물어봐서 확인된 주문만 인정한다.
 *  2. 결제사 조회 API는 CORS 허용목록에 이 앱 도메인이 없다.
 *     브라우저에서 부르면 막히고, 서버 호출은 CORS와 무관하다.
 *
 * 결제사 조회 명세
 *   GET {MILESTONE_API_BASE}/api/payment/verify?orderId=xxx
 *   200 → { valid: true, orderId, planId, amount, resultId, paidAt }
 *   404 → { valid: false, error: "Purchase not found" }
 *   별도 인증 키 없음.
 *
 * 환경변수
 *   MILESTONE_API_BASE  예) https://trainer-milestone.com
 */
import { NextResponse } from "next/server";
import { getPlan, isValidOrderId } from "@/lib/payments/milestone";

/** 결제사 주문조회 응답 */
interface VerifyResponse {
  valid: boolean;
  orderId?: string;
  planId?: string;
  amount?: number;
  /** 결제사가 발급한 결과 식별자 */
  resultId?: string;
  paidAt?: string;
  error?: string;
}

export type ClaimStatus =
  | "paid" // 검증 완료
  | "unverified" // 검증 수단이 없거나 조회 실패 — 지급 보류
  | "not_paid" // 결제사가 미결제/없음으로 응답
  | "invalid"; // orderId 형식이 잘못됨

export interface ClaimResult {
  status: ClaimStatus;
  orderId?: string;
  planId?: string;
  orderName?: string;
  resultId?: string;
  paidAt?: string;
  message?: string;
}

export async function POST(req: Request): Promise<NextResponse<ClaimResult>> {
  let body: { orderId?: unknown; planId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const { orderId } = body;

  if (!isValidOrderId(orderId)) {
    return NextResponse.json(
      { status: "invalid", message: "주문번호 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const apiBase = process.env.MILESTONE_API_BASE;

  // 검증할 곳이 없으면 지급하지 않는다. 열어두는 쪽으로 실패하면 안 된다.
  if (!apiBase) {
    console.warn("[Milestone] MILESTONE_API_BASE 미설정 — 검증 생략, 지급 보류");
    return NextResponse.json({
      status: "unverified",
      orderId,
      message: "결제 확인 설정이 아직 없어 지급을 보류했습니다.",
    });
  }

  // ── 1. 결제사에 주문 조회 (서버에서만 호출 — CORS 우회) ──
  let verify: VerifyResponse;
  try {
    const url = `${apiBase.replace(/\/$/, "")}/api/payment/verify?orderId=${encodeURIComponent(orderId)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    // 404 = 그런 주문 없음 → 결제 안 된 것으로 처리
    if (res.status === 404) {
      return NextResponse.json({
        status: "not_paid",
        orderId,
        message: "해당 주문을 찾을 수 없습니다.",
      });
    }

    if (!res.ok) {
      console.error(`[Milestone] 주문조회 실패 ${res.status} — orderId=${orderId}`);
      return NextResponse.json({
        status: "unverified",
        orderId,
        message: "결제 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }

    verify = (await res.json()) as VerifyResponse;
  } catch (err) {
    console.error("[Milestone] 주문조회 오류:", err instanceof Error ? err.message : err);
    return NextResponse.json({
      status: "unverified",
      orderId,
      message: "결제 확인 요청이 실패했습니다.",
    });
  }

  if (!verify.valid) {
    return NextResponse.json({
      status: "not_paid",
      orderId,
      message: verify.error ?? "결제가 확인되지 않았습니다.",
    });
  }

  // ── 2. 금액 검증 ──
  // 상품은 결제사가 알려준 planId로 조회한다. 클라이언트가 보낸 planId는
  // 조작될 수 있으므로 검증 기준으로 쓰지 않는다.
  const plan = verify.planId ? getPlan(verify.planId) : undefined;

  if (!plan) {
    console.error(`[Milestone] 알 수 없는 planId=${verify.planId} orderId=${orderId}`);
    return NextResponse.json({
      status: "unverified",
      orderId,
      message: "주문 상품을 확인할 수 없습니다.",
    });
  }

  if (verify.amount !== plan.amount) {
    console.error(
      `[Milestone] 금액 불일치 orderId=${orderId} paid=${verify.amount} expected=${plan.amount}`,
    );
    return NextResponse.json({
      status: "not_paid",
      orderId,
      message: "결제 금액이 상품 가격과 일치하지 않습니다.",
    });
  }

  // ── 3. 어느 결과지의 결제인지 ──
  // 결제할 때 결과지 ID 를 resultId 로 넘기고, 결과는 그 결과지에서만 열린다.
  // 그래서 주문번호를 다른 결과지에 다시 써도 열리지 않고, 주문을 따로 저장하지 않아도 된다.
  // (같은 주문으로 같은 결과지를 다시 여는 새로고침은 그대로 허용된다)
  if (!verify.resultId) {
    console.error(`[Milestone] resultId 없는 주문 orderId=${orderId}`);
    return NextResponse.json({
      status: "unverified",
      orderId,
      message: "어느 결과지의 결제인지 확인할 수 없습니다. 고객센터로 문의해 주세요.",
    });
  }

  return NextResponse.json({
    status: "paid",
    orderId,
    planId: plan.id,
    orderName: plan.orderName,
    resultId: verify.resultId,
    paidAt: verify.paidAt,
  });
}
