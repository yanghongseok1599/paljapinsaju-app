/**
 * 재물운 보고서(MoneyReport) 계산 라이브러리.
 * 사주 데이터(일간 + 오행 분포) → 4개 무료 섹션 데이터 생성.
 *
 * 주의: 이 계산은 사용자 경험을 위한 "재미있는 추정"이지 정밀한 명리학적 산출이 아니다.
 * 실제 사주 컨설팅 수준의 정밀도를 약속하지 말 것.
 */

import type { FiveElementDistribution, FourPillarsDetail } from '@/types/saju';
import { extractSajuSummary } from './calculator';

// ─── 1. 평생 재물운 금액 카드 ─────────────────────────────────
/**
 * 일간 + 오행 강세 + 사주 8자의 식상/재성 비중을 단순화한 점수로 환산하여
 * 5천만 ~ 250억 사이의 "추정 평생 재물운"을 결정적으로(deterministic) 산출.
 * 같은 사주는 항상 같은 값.
 */
export function estimateLifetimeWealth(
  pillars: FourPillarsDetail,
  elements: FiveElementDistribution,
): { amount: number; tier: 'starter' | 'rising' | 'wealthy' | 'tycoon'; label: string } {
  const summary = extractSajuSummary(pillars, elements);
  const dayMaster = summary.dayMaster.stem;

  // 천간별 base (10개)
  const STEM_BASE: Record<string, number> = {
    갑: 12, 을: 8, 병: 18, 정: 10, 무: 25, 기: 14, 경: 22, 신: 16, 임: 30, 계: 11,
  };
  const base = STEM_BASE[dayMaster] ?? 12;

  // 오행 균형 점수: 가장 강한/약한 오행 차이가 작을수록 균형 → 가산점
  const values = Object.values(elements) as number[];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const balanceScore = Math.max(0, 10 - (max - min));

  // 화/금/수 비중이 높을수록 재물 친화로 가정 (단순화)
  const wealthBias = (elements.fire ?? 0) * 0.8 + (elements.metal ?? 0) * 1.2 + (elements.water ?? 0) * 0.6;

  // 0~100 점수 → 5천만 ~ 250억
  const score = Math.min(100, base + balanceScore * 2 + wealthBias * 4);
  const amount = Math.round(50_000_000 + (score / 100) * (25_000_000_000 - 50_000_000));

  let tier: 'starter' | 'rising' | 'wealthy' | 'tycoon';
  let label: string;
  if (score < 30) {
    tier = 'starter';
    label = '안정형 재물 그릇';
  } else if (score < 55) {
    tier = 'rising';
    label = '상승형 재물 그릇';
  } else if (score < 80) {
    tier = 'wealthy';
    label = '풍요형 재물 그릇';
  } else {
    tier = 'tycoon';
    label = '대부호형 재물 그릇';
  }

  return { amount, tier, label };
}

export function formatKRW(amount: number): string {
  // 한국식 단위 (억, 만)
  if (amount >= 1_0000_0000) {
    const eok = amount / 1_0000_0000;
    if (eok >= 100) return `${Math.round(eok)}억원`;
    if (eok >= 10) return `${eok.toFixed(0)}억원`;
    return `${eok.toFixed(1)}억원`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString('ko-KR')}만원`;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
}

// ─── 2. 오행 프로필 (MZ세대가 열광하는 오행 타입) ─────────────
export interface ElementProfile {
  element: string;          // '목' | '화' | '토' | '금' | '수'
  emoji: string;
  type: string;             // 'The Visionary', 'The Sparkler' 등
  korTag: string;           // '#비전메이커'
  vibe: string;             // 한 줄 정체성
  strengths: string[];      // 3-4개
}

const ELEMENT_PROFILES: Record<string, ElementProfile> = {
  목: {
    element: '목',
    emoji: '🌱',
    type: 'The Visionary',
    korTag: '#비전메이커',
    vibe: '새로운 흐름을 가장 먼저 알아채고 직접 만들어가는 타입.',
    strengths: ['트렌드 감각', '성장 마인드', '확장 욕구', '리더십'],
  },
  화: {
    element: '화',
    emoji: '🔥',
    type: 'The Sparkler',
    korTag: '#원샷원킬',
    vibe: '한 번에 큰 임팩트를 내며 주목받는 화려한 타입.',
    strengths: ['표현력', '추진력', '카리스마', '네트워킹'],
  },
  토: {
    element: '토',
    emoji: '🏔️',
    type: 'The Anchor',
    korTag: '#든든한기둥',
    vibe: '꾸준히 쌓아 올려 결국 가장 안정된 부를 만드는 타입.',
    strengths: ['신뢰감', '꾸준함', '실행력', '관리력'],
  },
  금: {
    element: '금',
    emoji: '🗡️',
    type: 'The Strategist',
    korTag: '#계산기',
    vibe: '냉정한 판단과 정교한 전략으로 부를 설계하는 타입.',
    strengths: ['논리력', '결단력', '냉철한 분석', '디테일'],
  },
  수: {
    element: '수',
    emoji: '🌊',
    type: 'The Flow',
    korTag: '#흐름타기',
    vibe: '시장의 흐름을 읽고 유연하게 갈아타며 부를 모으는 타입.',
    strengths: ['직관', '적응력', '정보력', '커뮤니케이션'],
  },
};

export function getElementProfile(pillars: FourPillarsDetail, elements: FiveElementDistribution): ElementProfile {
  const summary = extractSajuSummary(pillars, elements);
  const el = summary.dayMaster.element;
  return ELEMENT_PROFILES[el] ?? ELEMENT_PROFILES.토;
}

// ─── 3. 돈 버는 스타일 ─────────────────────────────────────
export interface EarningStyle {
  headline: string;
  description: string;
  bestPaths: string[];   // 3-4개 (예: '플랫폼 비즈니스', '전문직')
  warning: string;       // 1줄 경고
}

const STYLE_BY_STEM: Record<string, EarningStyle> = {
  갑: {
    headline: '0 → 1을 만드는 창업가',
    description: '큰 그림을 그리고 새로운 시장을 여는 데서 가장 큰 돈을 번다. 안정적 월급 구조보다는 본인 사업·지분형 보상이 잘 맞는다.',
    bestPaths: ['스타트업 창업', '신사업 기획', '브랜드 런칭', '에이전시'],
    warning: '초기 동력에 비해 마무리 디테일이 약하다. 운영 파트너가 꼭 필요.',
  },
  을: {
    headline: '연결과 협업으로 부를 키우는 코디네이터',
    description: '직접 칼을 들기보다, 사람·자원·정보를 엮어 가치를 만들 때 돈이 따라온다.',
    bestPaths: ['컨설팅', '에이전트', '큐레이션', '커뮤니티 비즈니스'],
    warning: '거절을 잘 못해 일이 몰린다. 페이 라인을 명확히 그어야 한다.',
  },
  병: {
    headline: '브랜드와 영향력으로 버는 셀러브리티형',
    description: '본인이 곧 상품. 노출과 표현으로 직접적인 수익을 만들 수 있다.',
    bestPaths: ['크리에이터', '연예·미디어', '브랜드 대표', '강연'],
    warning: '감정 기복이 매출에 직결된다. 운영팀이 곁에 있어야 한다.',
  },
  정: {
    headline: '디테일 장인으로 신뢰를 쌓는 전문가형',
    description: '꼼꼼한 작업과 따뜻한 관계로 단골을 만든다. 큰 폭의 성장보단 안정 누적형.',
    bestPaths: ['전문직(법·의·회계)', '디자인·예술', '교육', '소규모 브랜드'],
    warning: '본인 능력을 저평가하는 경향. 가격을 더 받아도 된다.',
  },
  무: {
    headline: '자산 축적의 마스터',
    description: '한 번에 큰돈보다는 시간을 들여 자산을 쌓는 데 최적화. 부동산·장기 투자에 강하다.',
    bestPaths: ['부동산', '리츠/인덱스 장기 투자', '관리·운영', '프랜차이즈'],
    warning: '결정을 너무 늦게 한다. 기회가 지나간 뒤 후회하는 패턴.',
  },
  기: {
    headline: '근면한 실속파',
    description: '눈에 띄지 않지만 꾸준한 수익 구조를 잘 만든다. 거품 없는 부의 정석.',
    bestPaths: ['전문 자영업', '서비스업', '실용 콘텐츠', '안정 직장'],
    warning: '큰 도약 기회가 와도 보수적이라 지나치기 쉽다.',
  },
  경: {
    headline: '결단력 있는 의사결정자',
    description: '핵심을 빠르게 판별하고 단기간에 큰 결과를 만들 수 있다. 영업/세일즈에 강함.',
    bestPaths: ['B2B 세일즈', '투자', '경영진', '시장 진입형 비즈니스'],
    warning: '단호함이 과해 사람을 잃는 경우. 인간관계가 곧 자산임을 잊지 말 것.',
  },
  신: {
    headline: '정교한 가치 설계자',
    description: '품질·디테일·미감으로 프리미엄 시장을 공략. 단가가 높은 비즈니스에 어울림.',
    bestPaths: ['디자인 스튜디오', '주얼리·럭셔리', '전문 컨설팅', '큐레이션 커머스'],
    warning: '완벽주의가 출시를 늦춘다. "80% 완성도로 빠르게"가 필요.',
  },
  임: {
    headline: '흐름을 읽는 운용자',
    description: '시장의 큰 물결을 잘 본다. 트레이딩·매크로 투자·플랫폼 사업이 잘 맞음.',
    bestPaths: ['자산 운용', '플랫폼/네트워크', '글로벌 무역', '기획'],
    warning: '아이디어가 너무 많아 흩어진다. 한 줄기에 집중하는 훈련 필요.',
  },
  계: {
    headline: '직관과 영감의 크리에이터',
    description: '데이터로 잡히지 않는 흐름을 읽고, 콘텐츠·아이디어로 부를 만든다.',
    bestPaths: ['크리에이티브 직군', 'IP 비즈니스', '컨설팅', '신사업 R&D'],
    warning: '실행을 미루는 습관. 협업자나 매니저 도움이 필요.',
  },
};

export function getEarningStyle(pillars: FourPillarsDetail): EarningStyle {
  const stem = pillars.day?.heavenlyStem ?? '갑';
  return STYLE_BY_STEM[stem] ?? STYLE_BY_STEM.갑;
}

// ─── 4. 부자 DNA (5축 능력치) ─────────────────────────────────
export interface RichDNA {
  axes: Array<{ key: string; label: string; value: number }>;  // value: 0-100
  topAxis: string;
}

/**
 * 사주 데이터 → 5축 능력치
 * - moneySense (재물 감각): 화/금 가중치
 * - execution (실행력): 갑/병/경 일간 + 토
 * - patience (인내심): 토/수 + 일간이 무/기일 때 가산
 * - network (네트워크): 을/임 + 화
 * - intuition (직관력): 계/신 + 수
 */
export function getRichDNA(pillars: FourPillarsDetail, elements: FiveElementDistribution): RichDNA {
  const stem = pillars.day?.heavenlyStem ?? '갑';
  const fire = elements.fire ?? 0;
  const water = elements.water ?? 0;
  const earth = elements.earth ?? 0;
  const metal = elements.metal ?? 0;
  const wood = elements.wood ?? 0;

  const clamp = (v: number) => Math.max(10, Math.min(95, Math.round(v)));

  const STEM_BIAS: Record<string, Partial<Record<keyof typeof acc, number>>> = {
    갑: { execution: 15, patience: -5 },
    을: { network: 15, patience: 5 },
    병: { execution: 10, network: 10 },
    정: { intuition: 10, patience: 10 },
    무: { patience: 20, execution: 10 },
    기: { patience: 15, moneySense: 5 },
    경: { execution: 20, moneySense: 5 },
    신: { intuition: 10, moneySense: 10 },
    임: { network: 10, intuition: 5 },
    계: { intuition: 20 },
  };

  const acc = {
    moneySense: 30 + fire * 6 + metal * 7,
    execution: 30 + wood * 6 + fire * 4 + earth * 3,
    patience: 30 + earth * 8 + water * 4,
    network: 30 + wood * 4 + fire * 5 + water * 3,
    intuition: 30 + water * 7 + metal * 4,
  };

  const bias = STEM_BIAS[stem] ?? {};
  (Object.keys(bias) as Array<keyof typeof acc>).forEach((k) => {
    acc[k] = (acc[k] ?? 0) + (bias[k] ?? 0);
  });

  const axes = [
    { key: 'moneySense', label: '재물 감각', value: clamp(acc.moneySense) },
    { key: 'execution', label: '실행력', value: clamp(acc.execution) },
    { key: 'patience', label: '인내심', value: clamp(acc.patience) },
    { key: 'network', label: '인간관계', value: clamp(acc.network) },
    { key: 'intuition', label: '직관력', value: clamp(acc.intuition) },
  ];

  const topAxis = axes.reduce((a, b) => (a.value >= b.value ? a : b)).label;

  return { axes, topAxis };
}
