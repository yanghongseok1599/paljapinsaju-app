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

export function getStarPackById(id: string): StarPack | undefined {
  return STAR_PACKS.find((p) => p.id === id);
}
