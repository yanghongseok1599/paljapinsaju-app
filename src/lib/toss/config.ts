/**
 * Toss Payments 결제 설정
 * 환경변수: NEXT_PUBLIC_TOSS_CLIENT_KEY, TOSS_SECRET_KEY, TOSS_WEBHOOK_SECRET_KEY
 *
 * Paddle 가격 구조를 KRW로 그대로 이식했습니다.
 * TODO: confirm pricing with business owner before going live
 */

export const TOSS_CONFIG = {
  clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '',
  secretKey: process.env.TOSS_SECRET_KEY || '',
  webhookSecretKey: process.env.TOSS_WEBHOOK_SECRET_KEY || '',
} as const;

export interface StarPack {
  id: string;
  stars: number;
  priceKrw: number;
  name: string;
  badge?: string;
}

// TODO: confirm pricing with business owner before going live
export const STAR_PACKS: StarPack[] = [
  { id: 'star_30', stars: 30, priceKrw: 9900, name: '별 30개' },
  { id: 'star_70', stars: 70, priceKrw: 19900, name: '별 70개', badge: '인기' },
  // 이용약관·FAQ·구조화데이터에 고지된 금액에 맞춘다 (단가는 기존 200개/49,900원과 동일한 1별 249원).
  { id: 'star_premium', stars: 120, priceKrw: 29900, name: '별 120개', badge: '최고 가성비' },
];

/**
 * 별 상점(토스 직접 결제) 열림 여부.
 * 첫 출시는 "무료 체험 → 마일스톤 결제" 하나로 판다 (2026-10-27 결정). 닫혀 있으면 충전 링크·결제 버튼을 모두 숨긴다.
 * 다시 열기 전에: 토스 웹훅이 별을 지급하지 못하는 문제, 결과지 결제 버튼이 표시와 다른 상품(별 30개)을 파는 문제부터
 * (claudedocs/launch-audit-2026-10-26.md 결정 2·6).
 */
export const STAR_SHOP_OPEN = false;

export function getStarPackById(id: string): StarPack | undefined {
  return STAR_PACKS.find((p) => p.id === id);
}
