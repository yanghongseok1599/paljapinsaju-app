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
import { createClient as createServiceClient } from "@supabase/supabase-js";
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
  | "already_processed" // 같은 주문을 이미 처리함
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

  // ── 3. 멱등 처리 ──
  // 사용자가 완료 페이지를 새로고침해도 두 번 지급되지 않아야 한다.
  // webhook_events(provider, event_id)에 PK가 걸려 있어 두 번째 삽입은 충돌한다.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    const supabase = createServiceClient(supabaseUrl, serviceKey);
    const { error } = await supabase
      .from("webhook_events")
      .insert({ provider: "milestone", event_id: orderId });

    if (error) {
      // 23505 = unique_violation → 이미 처리한 주문
      if (error.code === "23505") {
        return NextResponse.json({
          status: "already_processed",
          orderId,
          planId: plan.id,
          orderName: plan.orderName,
          resultId: verify.resultId,
          paidAt: verify.paidAt,
        });
      }
      console.error("[Milestone] 멱등 기록 실패:", error);
      return NextResponse.json({
        status: "unverified",
        orderId,
        message: "주문 기록에 실패해 지급을 보류했습니다.",
      });
    }

    // ── 지급 지점 ──
    // 여기서 상품을 지급한다. 지급 대상(별 충전 / 카테고리 상담 열기)은
    // 가격 정책이 확정된 뒤에 연결한다. 지금은 주문만 기록한다.
  } else if (process.env.NODE_ENV === "production") {
    // 운영에서 Supabase가 없으면 중복 지급을 막을 방법이 없다.
    // 결제는 확인됐더라도 지급은 보류한다 (fail closed).
    console.error("[Milestone] 운영 환경에 Supabase 미설정 — 중복 방지 불가, 지급 보류");
    return NextResponse.json({
      status: "unverified",
      orderId,
      message: "주문 처리 설정이 완료되지 않았습니다. 고객센터로 문의해 주세요.",
    });
  } else {
    // 로컬(목 모드)에는 DB가 없어 중복 방지를 못 한다.
    // 검증 자체는 정상이므로 개발 중에는 통과시킨다.
    console.warn("[Milestone] Supabase 미설정 — 중복 방지 기록 없이 진행 (로컬 전용)");
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
