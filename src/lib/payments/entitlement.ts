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
 */

const KEY = "paljapin.payment.unlocked";

interface UnlockRecord {
  /** 결제 확인에 사용된 주문번호 — 나중에 대조용 */
  orderId: string;
  unlockedAt: string;
}

type UnlockMap = Record<string, UnlockRecord>;

function readAll(): UnlockMap {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UnlockMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** 결제가 확인된 결과지를 해제 상태로 표시한다. */
export function markUnlocked(readingId: string, orderId: string): void {
  try {
    const all = readAll();
    all[readingId] = { orderId, unlockedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // 저장소를 못 쓰면 이번 화면에서만 열린다
  }
}

export function isUnlocked(readingId: string): boolean {
  return Boolean(readAll()[readingId]);
}

export function getUnlockRecord(readingId: string): UnlockRecord | null {
  return readAll()[readingId] ?? null;
}
