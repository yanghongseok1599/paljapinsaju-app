/**
 * 월별 운세 생성기.
 *
 * 기존에는 3가지 문구를 12개월에 돌려쓰고 뒷문장이 전부 같았다.
 * 여기서는 각 달의 지지(地支)와 내 일지(日支)의 관계, 그리고 그 달이
 * 내 일간(日干)에게 어떤 십신에 해당하는지를 계산해 달마다 다른 조언을 만든다.
 *
 * 판단 재료
 *  - 관계: 충 > 육합 > 삼합 > 형 > 파·해 > 비화 > 중립
 *  - 영역: 그 달 지지의 본기(本氣)를 일간과 대조한 십신 (재성·관성·인성·식상·비겁)
 */
import type { MonthlyFortune } from "@/types/saju";

const STEMS_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

/** 월 → 지지 인덱스 (절기 기준: 2월=寅) */
const MONTH_BRANCH: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
  7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 0,
};

/** 지지 본기(本氣) 천간 인덱스 */
const MAIN_QI: Record<number, number> = {
  0: 9, 1: 5, 2: 0, 3: 1, 4: 4, 5: 2,
  6: 3, 7: 5, 8: 6, 9: 7, 10: 4, 11: 8,
};

const SIX_HARMONY: Record<number, number> = {
  0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6,
};

const TRIPLE: number[][] = [
  [8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1],
];

/** 삼형·상형 조합 */
const PUNISH: number[][] = [
  [2, 5, 8],   // 寅巳申
  [1, 10, 7],  // 丑戌未
  [0, 3],      // 子卯
];
/** 자형 (같은 글자끼리) */
const SELF_PUNISH = [4, 6, 9, 11];

/** 파(破) */
const BREAK_PAIRS: [number, number][] = [
  [0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10],
];
/** 해(害) */
const HARM_PAIRS: [number, number][] = [
  [0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10],
];

type Relation = "충" | "육합" | "삼합" | "형" | "파해" | "비화" | "중립";
type Domain = "재성" | "관성" | "인성" | "식상" | "비겁";

function inPair(pairs: [number, number][], a: number, b: number) {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function relationOf(dayBranch: number, monthBranch: number): Relation {
  if ((dayBranch + 6) % 12 === monthBranch) return "충";
  if (SIX_HARMONY[dayBranch] === monthBranch) return "육합";
  if (TRIPLE.some((g) => g.includes(dayBranch) && g.includes(monthBranch) && dayBranch !== monthBranch))
    return "삼합";
  if (dayBranch === monthBranch) {
    return SELF_PUNISH.includes(dayBranch) ? "형" : "비화";
  }
  if (PUNISH.some((g) => g.includes(dayBranch) && g.includes(monthBranch))) return "형";
  if (inPair(BREAK_PAIRS, dayBranch, monthBranch) || inPair(HARM_PAIRS, dayBranch, monthBranch))
    return "파해";
  return "중립";
}

/** 일간 대비 대상 천간(인덱스)의 십신 그룹 */
function domainOf(dayStemIdx: number, targetStemIdx: number): Domain {
  const diff = (Math.floor(targetStemIdx / 2) - Math.floor(dayStemIdx / 2) + 5) % 5;
  const order: Record<number, Domain> = {
    0: "비겁", 1: "식상", 2: "재성", 3: "관성", 4: "인성",
  };
  return order[diff];
}

/** 달마다 고유한 계절·일정 맥락. 같은 관계·영역이 겹쳐도 문장이 반복되지 않게 한다. */
const MONTH_CONTEXT: Record<number, string> = {
  1: "한 해를 여는 달",
  2: "겨울 기운이 풀리는 달",
  3: "본격적으로 움직이기 시작하는 달",
  4: "벌인 일이 자리를 잡는 달",
  5: "활동량이 가장 늘어나는 달",
  6: "상반기를 매듭짓는 달",
  7: "더위에 체력이 먼저 떨어지는 달",
  8: "하반기 방향을 정하는 달",
  9: "결과가 드러나기 시작하는 달",
  10: "정리와 수확이 겹치는 달",
  11: "내년 준비를 시작할 달",
  12: "한 해를 닫는 달",
};

/** 관계 × 영역 — 그래서 어떻게 하라는 것인지 */
const ADVICE: Record<Relation, Record<Domain, string>> = {
  충: {
    재성: "큰 지출과 계약은 다음 달로 미루세요. 이번 달 충동구매가 가장 큽니다.",
    관성: "직장에서 부딪히기 쉽습니다. 그만두겠다는 말은 이번 달에 꺼내지 마세요.",
    인성: "마음이 붕 떠서 집중이 안 됩니다. 새 공부보다 하던 것 마무리에 집중하세요.",
    식상: "말이 앞서 사고가 납니다. 보내기 전에 한 번 더 읽는 습관이 필요합니다.",
    비겁: "사람 때문에 돈이나 시간을 뺏깁니다. 부탁은 이번 달만 거절하세요.",
  },
  육합: {
    재성: "돈 이야기가 잘 풀립니다. 미뤄둔 정산이나 협상을 이번 달에 하세요.",
    관성: "윗사람과 말이 통합니다. 승진이나 조건 이야기를 꺼내기 좋습니다.",
    인성: "머리가 맑습니다. 시험, 자격, 계약서 검토처럼 집중이 필요한 일에 좋습니다.",
    식상: "표현한 것이 잘 받아들여집니다. 발표나 제안을 이번 달에 배치하세요.",
    비겁: "사람 덕을 봅니다. 오래 미룬 연락을 먼저 해보세요.",
  },
  삼합: {
    재성: "여럿이 함께할 때 돈이 붙습니다. 혼자 하던 일에 사람을 붙여보세요.",
    관성: "조직 안에서 지지받습니다. 큰 일을 맡아도 되는 달입니다.",
    인성: "배움이 잘 들어옵니다. 스터디나 멘토처럼 함께 하는 방식이 효율이 높습니다.",
    식상: "협업으로 결과물이 나옵니다. 아이디어를 혼자 쥐고 있지 마세요.",
    비겁: "모임과 소개가 늘어납니다. 여기서 생기는 인연이 오래 갑니다.",
  },
  형: {
    재성: "돈 문제로 감정이 상하기 쉽습니다. 금액은 반드시 문서로 남기세요.",
    관성: "책임 소재를 두고 얽힙니다. 지시받은 내용을 기록해두세요.",
    인성: "생각이 많아 잠을 설칩니다. 결정을 미루고 몸부터 챙기세요.",
    식상: "한마디가 오해를 만듭니다. 농담도 이번 달은 줄이는 편이 낫습니다.",
    비겁: "가까운 사람과 부딪힙니다. 거리를 조금 두면 지나갑니다.",
  },
  파해: {
    재성: "예상 못한 지출이 생깁니다. 여유분을 남겨두세요.",
    관성: "일정이 자꾸 어긋납니다. 마감을 이틀 앞당겨 잡으세요.",
    인성: "하던 공부나 계획이 끊깁니다. 완벽하게 하려 말고 이어가는 데 집중하세요.",
    식상: "벌인 일이 마무리가 안 됩니다. 새로 시작하지 말고 정리부터 하세요.",
    비겁: "약속이 자주 깨집니다. 사람에 기대는 계획은 대안을 만들어두세요.",
  },
  비화: {
    재성: "쓰는 만큼 벌립니다. 수입보다 지출 관리가 성과를 좌우합니다.",
    관성: "평소만큼만 하면 됩니다. 무리해서 존재감을 내려 하지 마세요.",
    인성: "혼자 있는 시간이 필요합니다. 일정을 비워두면 회복이 빠릅니다.",
    식상: "하고 싶은 게 많아집니다. 한 번에 두 가지 이상 벌이지 마세요.",
    비겁: "고집이 세지는 달입니다. 남의 말을 한 번은 끝까지 들어보세요.",
  },
  중립: {
    재성: "무리하지 않으면 돈은 안정적입니다. 고정비를 한 번 점검하세요.",
    관성: "맡은 일을 눈에 보이는 형태로 정리해두면 다음 기회로 이어집니다.",
    인성: "조용히 쌓기 좋은 달입니다. 미뤄둔 정리와 공부를 하세요.",
    식상: "가볍게 시도해보기 좋습니다. 작게 시작해서 반응을 보세요.",
    비겁: "관계에 큰 변화는 없습니다. 오래된 관계를 챙기기 좋습니다.",
  },
};

/** 관계별 흐름 한 마디 */
const RELATION_FLOW: Record<Relation, string> = {
  충: "흔들림이 큰 흐름입니다",
  육합: "일이 잘 맞물리는 흐름입니다",
  삼합: "사람이 붙어 힘이 커지는 흐름입니다",
  형: "부딪힘이 잦은 흐름입니다",
  파해: "계획이 어긋나기 쉬운 흐름입니다",
  비화: "내 색이 진해지는 흐름입니다",
  중립: "큰 굴곡 없는 흐름입니다",
};

export interface MonthlyFortuneInput {
  /** 일간 (한글, 예: "경") */
  dayStem: string;
  /** 일지 (한글, 예: "인") */
  dayBranch: string;
}

/**
 * 12개월 운세를 생성한다. 달마다 지지 관계와 십신이 달라 문장이 겹치지 않는다.
 */
export function buildMonthlyFortune(input: MonthlyFortuneInput): MonthlyFortune[] {
  const dayStemIdx = STEMS_KO.indexOf(input.dayStem);
  const dayBranchIdx = BRANCHES_KO.indexOf(input.dayBranch);

  // 간지를 못 읽으면 달마다 다른 내용을 만들 수 없으므로 중립으로 채운다.
  if (dayStemIdx < 0 || dayBranchIdx < 0) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      fortune: "생년월일시 정보가 정확해야 월별 흐름을 잡을 수 있습니다.",
    }));
  }

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const branch = MONTH_BRANCH[month];
    const relation = relationOf(dayBranchIdx, branch);
    const domain = domainOf(dayStemIdx, MAIN_QI[branch]);

    return {
      month,
      fortune: `${MONTH_CONTEXT[month]}, ${RELATION_FLOW[relation]}. ${ADVICE[relation][domain]}`,
    };
  });
}
