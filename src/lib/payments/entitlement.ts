/**
 * 체험 결과지의 결제 해제 상태.
 *
 * ⚠️ 이 값은 브라우저에 저장된다. 즉 사용자가 직접 바꿀 수 있다.
 * 결제 **검증**은 서버(/api/payments/milestone/claim)가 결제사에 직접 물어봐서
 * 하고 있고, 여기 저장되는 건 "검증을 통과했으니 이 브라우저에서 열어준다"는
 * 표시일 뿐이다.
 *
 * 체험 플로우는 로그인도 DB도 없어서(결과지 자체가 localStorage에 있다)
 * 서버가 기억할 주인이 없다. 실제 계정·DB가 붙으면 이 파일 대신
 * 서버측 entitlement 테이블로 옮겨야 한다.
 *
 * 해제는 상품(planId) 단위다. 고민 상담(예: reunion)을 사면 그 주제 리포트만,
 * 종합 분석(full_analysis)을 사면 종합 분석만 열린다. 예전엔 결과지 단위로 열어
 * 9,900원 고민 상담이 19,900원 종합 분석까지 열었다.
 */

const KEY = "paljapin.payment.unlocked";

interface UnlockRecord {
  /** 결제 확인에 사용된 주문번호 — 나중에 대조용, 종합 분석 PDF 요청에 쓴다 */
  orderId: string;
  unlockedAt: string;
}

/** readingId → planId → 해제 기록 */
type UnlockMap = Record<string, Record<string, UnlockRecord>>;

function readAll(): UnlockMap {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: UnlockMap = {};
    for (const [readingId, plans] of Object.entries(parsed ?? {})) {
      // 상품 구분이 없던 옛 형식({ orderId, unlockedAt })은 무시한다
      if (plans && typeof plans === "object" && !("orderId" in plans)) {
        out[readingId] = plans as Record<string, UnlockRecord>;
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** 결제가 확인된 상품을 이 결과지에서 해제 상태로 표시한다. */
export function markUnlocked(readingId: string, planId: string, orderId: string): void {
  try {
    const all = readAll();
    all[readingId] = {
      ...all[readingId],
      [planId]: { orderId, unlockedAt: new Date().toISOString() },
    };
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // 저장소를 못 쓰면 이번 화면에서만 열린다
  }
}

export function isUnlocked(readingId: string, planId: string): boolean {
  return Boolean(readAll()[readingId]?.[planId]);
}

export function getUnlockRecord(readingId: string, planId: string): UnlockRecord | null {
  return readAll()[readingId]?.[planId] ?? null;
}
