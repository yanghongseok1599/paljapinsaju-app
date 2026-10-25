/**
 * 카테고리별 상세 분석 생성기.
 *
 * 유료 상담 카테고리(재회, 상대의 마음, 이직 등)를 선택했을 때
 * 그 주제에 맞는 해석을 실제 사주 계산값으로 만들어낸다.
 *
 * AI를 쓰지 않고 saju-engine의 계산 결과(십신·합충·대운·신살)만으로 구성하므로
 * API 키 없이도 동작한다. AI 상담은 이 결과 위에 대화를 얹는 구조다.
 */
import {
  calculateSaju,
  toHangul,
  type SajuResult,
  type DaewoonItem,
} from "@/lib/saju/saju-engine";
import { getPaidCategory, type PaidCategoryId } from "@/lib/saju/categories";
import type { Gender } from "@/types/saju";

// ──────────────────────────────────────────────
// 결과 타입
// ──────────────────────────────────────────────

export interface CategorySection {
  heading: string;
  body: string;
}

export interface TimingItem {
  label: string;
  note: string;
  tone: "good" | "caution" | "neutral";
}

export interface CategoryReport {
  categoryId: PaidCategoryId;
  name: string;
  subtitle: string;
  /** 한 문단 결론 */
  verdict: string;
  verdictTone: "positive" | "caution" | "neutral";
  /** 판단의 사주 근거 */
  evidence: string[];
  sections: CategorySection[];
  timing: TimingItem[];
  actions: string[];
}

export interface CategoryAnalysisInput {
  name: string;
  gender: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  isLunar: boolean;
}

// ──────────────────────────────────────────────
// 상수
// ──────────────────────────────────────────────

const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BRANCH_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const BRANCH_ANIMAL = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/** 지지 인덱스 → 절기 기준 월 (寅=2월) */
const BRANCH_TO_MONTH: Record<number, number> = {
  2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 0: 12, 1: 1,
};

/** 육합: 인덱스 → 짝 인덱스 */
const SIX_HARMONY: Record<number, number> = {
  0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6,
};

/** 삼합 그룹 */
const TRIPLE: number[][] = [
  [8, 0, 4], // 申子辰 수
  [11, 3, 7], // 亥卯未 목
  [2, 6, 10], // 寅午戌 화
  [5, 9, 1], // 巳酉丑 금
];

const SIPSIN_GROUP: Record<string, SipsinGroup> = {
  비견: "비겁", 겁재: "비겁",
  식신: "식상", 상관: "식상",
  편재: "재성", 정재: "재성",
  편관: "관성", 정관: "관성",
  편인: "인성", 정인: "인성",
};

type SipsinGroup = "비겁" | "식상" | "재성" | "관성" | "인성";

const ELEMENT_KO: Record<string, string> = {
  wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
};

// ──────────────────────────────────────────────
// 사주에서 뽑아내는 사실들
// ──────────────────────────────────────────────

interface Facts {
  result: SajuResult;
  dayStem: string;
  dayStemKo: string;
  dayBranchIdx: number;
  dayBranchLabel: string;
  counts: Record<SipsinGroup, number>;
  /** 배우자성 — 남자는 재성, 여자는 관성 */
  spouseStar: SipsinGroup;
  spouseCount: number;
  /** 일지(배우자궁)에 붙은 합·충 */
  dayHarmony: boolean;
  dayClash: boolean;
  clashCount: number;
  harmonyCount: number;
  hasDohwa: boolean;
  hasYeokma: boolean;
  yangin: boolean;
  goegang: boolean;
  currentAge: number;
  currentDaewoon?: DaewoonItem;
  yearSipsin: string;
  yearGanzi: string;
  strongest: string;
  weakest: string;
  ohang: Record<string, number>;
}

function branchLabel(idx: number) {
  return `${BRANCHES[idx]}(${BRANCH_KO[idx]}, ${BRANCH_ANIMAL[idx]})`;
}

/** 해당 연도의 간지 인덱스 */
function yearGanziIdx(year: number) {
  return { stem: (year - 4) % 10, branch: (year - 4) % 12 };
}

function collectFacts(input: CategoryAnalysisInput): Facts {
  const result = calculateSaju({
    year: input.birthYear,
    month: input.birthMonth,
    day: input.birthDay,
    hour: input.birthHour ?? 12,
    minute: 0,
    gender: input.gender,
    isLunar: input.isLunar,
    unknownTime: input.birthHour === null,
  });

  // pillars 순서: 0=시주, 1=일주, 2=월주, 3=년주
  const dayPillar = result.pillars[1];
  const dayStem = dayPillar.pillar.stem;
  const dayBranchIdx = BRANCHES.indexOf(dayPillar.pillar.branch);

  const counts: Record<SipsinGroup, number> = {
    비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0,
  };
  result.pillars.forEach((p, i) => {
    // 일간 자신은 십신 계산에서 제외
    if (i !== 1) {
      const g = SIPSIN_GROUP[p.stemSipsin];
      if (g) counts[g]++;
    }
    const bg = SIPSIN_GROUP[p.branchSipsin];
    if (bg) counts[bg]++;
  });

  // 일지에 걸린 합·충
  let dayHarmony = false;
  let dayClash = false;
  let clashCount = 0;
  let harmonyCount = 0;
  result.relations.pairs.forEach((rel, key) => {
    const [i, j] = key.split(",").map(Number);
    const touchesDay = i === 1 || j === 1;
    rel.branch.forEach((r) => {
      if (r.type === "합") {
        harmonyCount++;
        if (touchesDay) dayHarmony = true;
      }
      if (r.type === "충") {
        clashCount++;
        if (touchesDay) dayClash = true;
      }
    });
  });

  const spirits = result.pillars.map((p) => p.spirit);
  const hasDohwa = spirits.some((s) => s.includes("연살"));
  const hasYeokma = spirits.some((s) => s.includes("역마"));

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - input.birthYear + 1;
  const currentDaewoon = result.daewoon.find(
    (d) => currentAge >= d.age && currentAge < d.age + 10
  );

  const gz = yearGanziIdx(currentYear);
  const yearStem = STEMS[gz.stem];
  const yearSipsin = sipsinOf(dayStem, yearStem);

  const ohang = result.ohang as unknown as Record<string, number>;
  const entries = Object.entries(ohang).sort((a, b) => b[1] - a[1]);

  return {
    result,
    dayStem,
    dayStemKo: toHangul(dayStem),
    dayBranchIdx,
    dayBranchLabel: branchLabel(dayBranchIdx),
    counts,
    spouseStar: input.gender === "male" ? "재성" : "관성",
    spouseCount: input.gender === "male" ? counts.재성 : counts.관성,
    dayHarmony,
    dayClash,
    clashCount,
    harmonyCount,
    hasDohwa,
    hasYeokma,
    yangin: result.specialSals.yangin.length > 0,
    goegang: result.specialSals.goegang,
    currentAge,
    currentDaewoon,
    yearSipsin,
    yearGanzi: `${yearStem}${BRANCHES[gz.branch]}`,
    strongest: ELEMENT_KO[entries[0][0]] ?? entries[0][0],
    weakest: ELEMENT_KO[entries[entries.length - 1][0]] ?? entries[entries.length - 1][0],
    ohang,
  };
}

/** 일간 대비 대상 천간의 십신 */
function sipsinOf(dayStem: string, targetStem: string): string {
  const d = STEMS.indexOf(dayStem);
  const t = STEMS.indexOf(targetStem);
  if (d < 0 || t < 0) return "";
  const dEl = Math.floor(d / 2);
  const tEl = Math.floor(t / 2);
  const same = d % 2 === t % 2;
  const diff = (tEl - dEl + 5) % 5;
  const table = ["비겁", "식상", "재성", "관성", "인성"];
  const pair: Record<string, [string, string]> = {
    비겁: ["비견", "겁재"],
    식상: ["식신", "상관"],
    재성: ["편재", "정재"],
    관성: ["편관", "정관"],
    인성: ["편인", "정인"],
  };
  // diff: 0=비겁, 1=내가 생함(식상), 4=나를 생함(인성), 2=내가 극함(재성), 3=나를 극함(관성)
  const order: Record<number, string> = { 0: "비겁", 1: "식상", 2: "재성", 3: "관성", 4: "인성" };
  const group = order[diff] ?? table[0];
  return pair[group][same ? 0 : 1];
}

/** 일지 기준 유리/주의 월 */
function monthsFor(dayBranchIdx: number) {
  const harmony = SIX_HARMONY[dayBranchIdx];
  const clash = (dayBranchIdx + 6) % 12;
  const tripleGroup = TRIPLE.find((g) => g.includes(dayBranchIdx)) ?? [];
  const tripleOthers = tripleGroup.filter((b) => b !== dayBranchIdx);
  return {
    harmonyMonth: BRANCH_TO_MONTH[harmony],
    harmonyBranch: branchLabel(harmony),
    clashMonth: BRANCH_TO_MONTH[clash],
    clashBranch: branchLabel(clash),
    tripleMonths: tripleOthers.map((b) => BRANCH_TO_MONTH[b]).sort((a, b) => a - b),
    tripleBranches: tripleOthers.map(branchLabel),
  };
}

// ──────────────────────────────────────────────
// 공통 문장 조각
// ──────────────────────────────────────────────

function spouseStarLine(f: Facts, gender: Gender) {
  const star = f.spouseStar === "재성" ? "재성(財星)" : "관성(官星)";
  const who = gender === "male" ? "남성 사주에서 배우자·연인을 뜻하는" : "여성 사주에서 배우자·연인을 뜻하는";
  if (f.spouseCount === 0) {
    return `${who} ${star}이 사주 원국에 드러나 있지 않습니다. 인연이 없다는 뜻이 아니라, 관계가 '겉으로 보이는 조건'보다 지장간(支藏干, 지지 속에 숨은 기운)처럼 내면에서 움직인다는 의미입니다. 그래서 감정을 표현하는 속도가 상대보다 느리고, 상대는 그걸 무관심으로 오해하기 쉽습니다.`;
  }
  if (f.spouseCount >= 3) {
    return `${who} ${star}이 ${f.spouseCount}개로 많습니다. 인연의 기회 자체는 자주 오지만, 하나에 깊게 머무르기보다 여러 관계에 에너지가 분산되는 구조입니다. 관계가 흔들릴 때 원인이 상대가 아니라 '동시에 여러 선택지를 열어두는 습관'인 경우가 많습니다.`;
  }
  return `${who} ${star}이 ${f.spouseCount}개로 적절히 자리잡고 있습니다. 관계를 맺는 방식이 극단적이지 않고, 한 사람에게 집중할 수 있는 구조입니다.`;
}

function dayPalaceLine(f: Facts) {
  if (f.dayClash && f.dayHarmony) {
    return `배우자궁인 일지(日支) ${f.dayBranchLabel}에 합(合, 끌어당김)과 충(沖, 부딪힘)이 동시에 걸려 있습니다. 끌리는 힘과 밀어내는 힘이 같이 작동하는 자리라, 관계가 좋았다 나빴다를 반복합니다. 헤어지고 다시 만나는 패턴이 실제로 잘 나타나는 배치입니다.`;
  }
  if (f.dayClash) {
    return `배우자궁인 일지(日支) ${f.dayBranchLabel}가 충(沖)을 맞고 있습니다. 관계에 균열이 생길 때 서서히가 아니라 한 번에 끊기는 방식으로 갑니다. 이미 끝난 관계라면, 감정이 남아 있어도 구조적으로는 정리된 상태로 봅니다.`;
  }
  if (f.dayHarmony) {
    return `배우자궁인 일지(日支) ${f.dayBranchLabel}에 합(合)이 걸려 있습니다. 관계를 끌어당기고 붙잡는 힘이 남아 있는 자리라, 완전히 끊겼다기보다 연결의 여지가 남아 있는 구조입니다.`;
  }
  return `배우자궁인 일지(日支) ${f.dayBranchLabel}는 다른 기둥과 합(合)이나 충(沖)으로 얽혀 있지 않습니다. 외부 자극에 관계가 크게 휘둘리지 않는 대신, 스스로 움직이지 않으면 상황이 그대로 멈춰 있습니다.`;
}

function daewoonLine(f: Facts) {
  if (!f.currentDaewoon) {
    return `현재 대운(大運, 10년 단위 큰 흐름) 정보가 잡히지 않았습니다. 세운(歲運, 그 해의 운) 중심으로 판단합니다.`;
  }
  const d = f.currentDaewoon;
  return `현재 ${f.currentAge}세로 ${d.ganzi} 대운(${d.age}~${d.age + 9}세) 구간입니다. 천간은 ${d.stemSipsin}, 지지는 ${d.branchSipsin}이고 운성은 ${d.unseong}입니다. 앞으로 ${d.age + 10 - f.currentAge}년간 이 흐름이 이어집니다.`;
}

function timingBase(f: Facts): TimingItem[] {
  const m = monthsFor(f.dayBranchIdx);
  const items: TimingItem[] = [
    {
      label: `${m.harmonyMonth}월`,
      note: `일지와 육합(六合)하는 ${m.harmonyBranch} 달입니다. 대화를 꺼내거나 관계·일을 진전시키기에 저항이 가장 적습니다.`,
      tone: "good",
    },
  ];
  m.tripleMonths.forEach((mo, i) => {
    items.push({
      label: `${mo}월`,
      note: `일지와 삼합(三合)을 이루는 ${m.tripleBranches[i]} 달입니다. 주변 도움이나 소개가 붙기 쉬운 구간입니다.`,
      tone: "good",
    });
  });
  items.push({
    label: `${m.clashMonth}월`,
    note: `일지를 충(沖)하는 ${m.clashBranch} 달입니다. 감정이 격해지고 결정이 극단으로 흐르기 쉬우니 중요한 통보나 계약은 피하세요.`,
    tone: "caution",
  });
  return items.sort((a, b) => parseInt(a.label) - parseInt(b.label));
}

// ──────────────────────────────────────────────
// 카테고리별 리포트
// ──────────────────────────────────────────────

type Builder = (f: Facts, input: CategoryAnalysisInput) =>
  Pick<CategoryReport, "verdict" | "verdictTone" | "evidence" | "sections" | "timing" | "actions">;

const BUILDERS: Record<PaidCategoryId, Builder> = {
  // ── 재회 / 이별 후 ─────────────────────────
  reunion: (f, input) => {
    const m = monthsFor(f.dayBranchIdx);
    const possible = f.dayHarmony || f.harmonyCount > f.clashCount;
    const tone: CategoryReport["verdictTone"] = f.dayClash && !f.dayHarmony ? "caution" : possible ? "positive" : "neutral";

    return {
      verdictTone: tone,
      verdict:
        f.dayClash && !f.dayHarmony
          ? `${input.name}님의 재회 가능성은 낮은 쪽으로 봅니다. 배우자궁이 충(沖)으로 끊어져 있고, 사주 전체로 봐도 합(合) ${f.harmonyCount}개에 충(沖) ${f.clashCount}개입니다. 감정이 아직 남아 있어도 관계를 다시 붙이는 힘 자체가 약합니다. 다만 ${m.harmonyMonth}월 이후 흐름이 바뀌므로, 그 전까지는 연락을 미루는 편이 낫습니다.`
          : possible
            ? `${input.name}님의 재회 가능성은 남아 있습니다. 배우자궁에 합(合)의 기운이 걸려 있어 관계를 다시 끌어당기는 힘이 작동합니다. 다만 저절로 되는 구조는 아니고, ${m.harmonyMonth}월 전후에 ${input.name}님이 먼저 움직였을 때 열립니다.`
            : `${input.name}님의 재회는 '가능하지만 조건부'입니다. 배우자궁이 합이나 충으로 얽혀 있지 않아 관계가 그 자리에 멈춰 있는 상태입니다. 아무도 움직이지 않으면 이대로 흐지부지되고, 움직이면 그때부터 다시 흐름이 생깁니다.`,
      evidence: [
        dayPalaceLine(f),
        `사주 전체에서 합(合)이 ${f.harmonyCount}개, 충(沖)이 ${f.clashCount}개입니다. ${f.harmonyCount >= f.clashCount ? "붙는 힘이 끊는 힘보다 우세합니다." : "끊는 힘이 우세해, 관계를 유지하려면 의식적인 노력이 더 필요합니다."}`,
        spouseStarLine(f, input.gender),
        daewoonLine(f),
      ],
      sections: [
        {
          heading: "이별이 일어난 구조",
          body: `일간 ${f.dayStem}(${f.dayStemKo})을 기준으로 보면 ${input.name}님은 ${f.strongest}의 기운이 가장 강하고 ${f.weakest}이 약합니다. 강한 ${f.strongest}은 관계에서 주도권과 기준으로 나타나는데, 상대 입장에서는 "맞춰주지 않는다"로 읽히기 쉽습니다. 반대로 부족한 ${f.weakest}은 관계를 부드럽게 마감하는 능력이라, 갈등이 생겼을 때 설명 대신 침묵이나 단절로 끝내는 패턴이 나옵니다.\n\n${f.counts.비겁 >= 3 ? `비겁(比劫, 나와 같은 기운)이 ${f.counts.비겁}개로 강합니다. 자기 기준이 뚜렷해 관계에서 양보의 총량이 부족했을 가능성이 큽니다. 이별의 원인을 상대에게서만 찾으면 같은 패턴이 반복됩니다.` : ""}${f.counts.관성 === 0 ? `관성(官星, 규범과 책임의 기운)이 원국에 없습니다. 관계를 '형식'으로 묶는 힘이 약해, 확실한 약속 없이 흐름에 맡기다 어긋난 구조로 봅니다.` : ""}${f.counts.식상 >= 3 ? `식상(食傷, 표현의 기운)이 ${f.counts.식상}개로 많습니다. 하고 싶은 말을 참지 못하는 편이라, 결정적인 순간의 한마디가 관계를 끊었을 수 있습니다.` : ""}`,
        },
        {
          heading: "지금 연락해도 되는가",
          body: `${f.dayHarmony ? `배우자궁에 합이 살아 있어 연락 자체가 거부당할 확률은 낮습니다. 다만 "잘 지내?" 같은 안부는 흐지부지되기 쉽고, 헤어질 때 정리하지 못한 한 가지를 짚는 연락이 반응을 만듭니다.` : `배우자궁에 붙잡는 힘이 약합니다. 지금 보내는 연락은 상대에게 부담으로 먼저 도착합니다.`}\n\n시기로 보면 ${m.clashMonth}월은 피해야 합니다. 일지를 정면으로 충(沖)하는 ${m.clashBranch} 달이라 감정이 격해지고, 이때 오간 말이 관계를 완전히 닫아버립니다. 반대로 ${m.harmonyMonth}월은 일지와 육합(六合)하는 ${m.harmonyBranch} 달이라 같은 말을 해도 부드럽게 전달됩니다.${m.tripleMonths.length ? ` ${m.tripleMonths.join("월, ")}월은 삼합(三合)이 작동해 공통 지인을 통한 자연스러운 접점이 생기기 쉽습니다.` : ""}`,
        },
        {
          heading: "재회한다면 무엇이 달라져야 하는가",
          body: `${f.hasDohwa ? "사주에 도화(桃花, 연살)가 있어 매력으로 관계를 다시 여는 것 자체는 어렵지 않습니다. 문제는 다시 열린 뒤입니다. " : ""}${f.dayClash ? "충이 걸린 배우자궁은 재회하더라도 같은 지점에서 다시 부딪힙니다. " : ""}이별의 원인이 성격 차이로 정리되어 있다면 재회는 대체로 실패합니다. ${f.weakest}이 부족한 구조에서는 "이번엔 잘하겠다"는 다짐이 두 달을 넘기지 못합니다. 대신 갈등이 생겼을 때 대화를 멈추는 시간을 미리 정해두는 것처럼, 규칙을 만드는 방식이 이 사주에는 잘 맞습니다.`,
        },
      ],
      timing: timingBase(f),
      actions: [
        `${m.clashMonth}월에는 감정적인 연락·통보·정리 대화를 하지 않는다.`,
        `연락한다면 안부가 아니라, 헤어질 때 매듭짓지 못한 한 가지를 짚는 내용으로 한다.`,
        `재회를 결정하기 전에 부족한 ${f.weakest}을 보완할 구체적인 규칙을 하나 정해둔다.`,
      ],
    };
  },

  // ── 상대의 마음 ─────────────────────────────
  their_heart: (f, input) => {
    const m = monthsFor(f.dayBranchIdx);
    const warm = f.spouseCount > 0 || f.hasDohwa;
    return {
      verdictTone: warm ? "positive" : "neutral",
      verdict: warm
        ? `상대에게 호감이 있을 가능성이 높습니다. ${f.hasDohwa ? "사주에 도화(桃花)가 있어 상대가 먼저 끌리는 구조이고, " : ""}${f.spouseStar}이 ${f.spouseCount}개로 인연을 끌어오는 힘이 작동하고 있습니다. 다만 지금은 상대가 확신을 못 잡은 단계라, 밀어붙이면 오히려 물러납니다.`
        : `상대의 마음은 아직 호감 이전 단계로 봅니다. ${f.spouseStar}이 원국에 드러나 있지 않아, 관계가 감정보다 상황과 접촉 빈도로 움직이는 구조입니다. 지금 고백하면 거절보다 "생각해본 적 없다"는 반응이 나옵니다.`,
      evidence: [
        spouseStarLine(f, input.gender),
        f.hasDohwa
          ? `사주에 도화(桃花, 연살)가 있습니다. 본인이 의식하지 않아도 상대가 먼저 관심을 갖게 되는 배치입니다. 다만 관심이 곧 진심은 아니라, 초반 반응만 보고 판단하면 어긋납니다.`
          : `사주에 도화(桃花)가 없습니다. 첫인상으로 확 끌어당기는 타입이 아니라, 시간이 쌓이면서 신뢰로 평가받는 구조입니다. 지금 반응이 미지근해도 그게 결론이 아닙니다.`,
        dayPalaceLine(f),
        `일간 ${f.dayStem}(${f.dayStemKo})에 ${f.strongest}이 강합니다. 좋아하는 마음을 표현할 때 ${f.strongest === "화(火)" ? "감정이 그대로 드러나" : f.strongest === "수(水)" ? "직접 말하기보다 돌려서 표현해" : f.strongest === "금(金)" ? "필요 이상으로 담백하게 말해" : f.strongest === "목(木)" ? "먼저 계획부터 제안해" : "천천히 곁에 머무는 방식으로"} 상대가 온도를 오해하기 쉽습니다.`,
      ],
      sections: [
        {
          heading: "상대가 지금 나를 두는 위치",
          body: `${f.counts.재성 >= 2 ? `재성(財星)이 ${f.counts.재성}개로 관계에서 주도권을 쥐는 쪽은 ${input.name}님입니다. 상대는 반응하는 입장이라, ${input.name}님이 멈추면 관계도 멈춥니다.` : `재성(財星)이 ${f.counts.재성}개로 적습니다. 관계를 끌고 가는 쪽이 상대일 가능성이 높고, ${input.name}님은 확인하고 싶어도 먼저 묻지 못하는 구조입니다.`}\n\n${f.counts.인성 >= 2 ? `인성(印星)이 ${f.counts.인성}개로 강해, 상대의 말을 곱씹으며 의미를 확대 해석하는 경향이 있습니다. 상대가 보낸 짧은 답장 하나로 며칠을 소모하고 있다면, 그건 상대의 신호가 아니라 ${input.name}님의 해석입니다.` : ""}${f.counts.관성 >= 2 ? `관성(官星)이 ${f.counts.관성}개라 관계를 '정의'하고 싶어 합니다. 애매한 상태를 오래 못 견디는 편이라, 확인을 서두르다 관계를 앞당겨 끝내는 패턴을 조심해야 합니다.` : ""}`,
        },
        {
          heading: "이 관계가 갈 수 있는 거리",
          body: `${f.dayHarmony ? `배우자궁에 합(合)이 있어 연인 관계로 넘어갈 통로 자체는 열려 있습니다. ` : f.dayClash ? `배우자궁이 충(沖)을 맞고 있어, 가까워지는 속도만큼 부딪히는 속도도 빠릅니다. 급하게 가까워지면 급하게 식습니다. ` : `배우자궁이 조용해 관계가 저절로 진전되지는 않습니다. `}${f.spouseCount === 0 ? `배우자성이 드러나 있지 않은 구조에서는 '고백'이라는 이벤트보다, 함께하는 일상의 반복이 관계를 만듭니다. 이벤트를 만들려 할수록 어색해집니다.` : `${f.spouseStar}이 자리잡고 있어 관계를 정의하는 순간이 오면 비교적 빠르게 정리됩니다.`}\n\n${daewoonLine(f)}`,
        },
        {
          heading: "고백 타이밍",
          body: `${m.harmonyMonth}월이 가장 유리합니다. 일지와 육합하는 ${m.harmonyBranch} 달이라 같은 말이라도 상대가 방어적으로 받지 않습니다.${m.tripleMonths.length ? ` ${m.tripleMonths.join("월, ")}월도 삼합(三合)이 작동해 분위기가 자연스럽게 만들어집니다.` : ""} 반대로 ${m.clashMonth}월은 피하세요. 일지를 충하는 ${m.clashBranch} 달이라 상대의 판단이 평소보다 냉정해집니다.\n\n판단 기준은 시기보다 신호입니다. ${f.hasDohwa ? "도화가 있는 사주는 호의와 호감을 구분하기 어렵습니다. " : ""}상대가 먼저 다음 약속을 잡는지, 그리고 대화가 끊겼을 때 상대 쪽에서 다시 여는지 — 이 두 가지가 두 번 이상 반복되면 그때가 타이밍입니다.`,
        },
      ],
      timing: timingBase(f),
      actions: [
        `${m.harmonyMonth}월을 목표로 잡고, 그 전까지는 접점의 빈도만 늘린다.`,
        `상대가 먼저 다음 약속을 잡는지 2회 이상 확인한 뒤 고백 여부를 결정한다.`,
        `${m.clashMonth}월에는 관계를 정의하려는 대화를 시도하지 않는다.`,
      ],
    };
  },

  // ── 환승 · 바람 의심 ────────────────────────
  infidelity: (f, input) => {
    const m = monthsFor(f.dayBranchIdx);
    const risk = f.hasDohwa || f.dayClash || f.counts.재성 >= 3;
    return {
      verdictTone: risk ? "caution" : "neutral",
      verdict: risk
        ? `${input.name}님이 느낀 위화감에는 사주상 근거가 있습니다. 사주에서 ${[f.dayClash ? "배우자궁의 충(沖)" : "", f.hasDohwa ? "도화(桃花)" : "", f.counts.재성 >= 3 ? `재성(財星) 과다(${f.counts.재성}개)` : ""].filter(Boolean).join(", ")}이 잡힙니다. 다만 이건 '관계가 흔들리는 구조'라는 뜻이지, 상대의 행동을 증명하는 것이 아닙니다. 확인이 필요한 사실과 사주가 말하는 경향을 반드시 구분하세요.`
        : `사주에서는 지금 관계에 뚜렷한 배신 신호가 잡히지 않습니다. 배우자궁이 충으로 흔들리지 않고 도화도 없습니다. ${input.name}님이 느끼는 불안은 상대의 변화보다, ${f.weakest}이 부족한 구조에서 오는 본인 쪽 불안정에 가깝습니다.`,
      evidence: [
        dayPalaceLine(f),
        f.hasDohwa
          ? `도화(桃花, 연살)가 있습니다. 본인이든 상대든 관계 밖의 접점이 자주 생기는 배치입니다. 이 자체가 바람을 뜻하지는 않지만, 경계가 흐려지기 쉬운 환경이라는 신호는 맞습니다.`
          : `도화(桃花)가 없습니다. 관계 밖으로 시선이 흩어지는 배치는 아닙니다.`,
        `${f.spouseStar}이 ${f.spouseCount}개입니다. ${f.spouseCount >= 3 ? "배우자성이 과다해 관계가 한 곳에 머물지 못하고 분산되는 구조입니다. 이 경우 의심의 방향이 상대만이 아닐 수 있습니다." : f.spouseCount === 0 ? "배우자성이 드러나 있지 않아 관계의 실체를 확인하기 어렵고, 그래서 불안이 커지기 쉽습니다." : "배우자성이 안정적으로 자리잡고 있어 관계 자체가 흔들리는 구조는 아닙니다."}`,
        `${f.counts.인성 >= 2 ? `인성(印星)이 ${f.counts.인성}개로 강합니다. 생각이 깊은 만큼 근거 없는 정황을 논리로 엮어버리는 경향이 있습니다. 의심이 확신으로 굳는 속도가 빠르니, 사실 확인 없이 결론을 내리지 마세요.` : `인성(印星)이 적어 상황을 곱씹기보다 즉각 반응하는 편입니다. 감정이 올라온 자리에서 바로 따지면 관계가 회복 불가능해집니다.`}`,
      ],
      sections: [
        {
          heading: "지금 잡히는 신호",
          body: `${f.dayClash ? `배우자궁 ${f.dayBranchLabel}가 충(沖)을 맞고 있습니다. 충은 '깨진다'가 아니라 '흔들려서 자리를 이탈한다'는 뜻입니다. 관계 안에 있던 사람이 밖으로 시선을 돌리기 쉬운 구조이고, 이미 그런 시기를 지나고 있을 수 있습니다.` : `배우자궁 ${f.dayBranchLabel}는 충을 맞고 있지 않습니다. 관계의 자리 자체는 흔들리지 않은 상태입니다.`}\n\n사주 전체 충이 ${f.clashCount}개, 합이 ${f.harmonyCount}개입니다. ${f.clashCount > f.harmonyCount ? "충이 우세해 관계 전반이 불안정한 시기를 지나고 있습니다. 이때는 사실과 감정이 뒤섞이기 쉽습니다." : "합이 우세해 관계를 유지하려는 힘이 아직 더 큽니다."}`,
        },
        {
          heading: "예민한 것인가, 근거 있는 직감인가",
          body: `${risk ? `사주 구조상 ${input.name}님의 직감은 근거가 있는 쪽입니다. 다만 사주는 '환경의 위험도'를 말할 뿐, 특정 행동을 증명하지 않습니다. 지금 필요한 건 추궁이 아니라 확인입니다.` : `사주 구조로는 관계 밖 요인보다 ${input.name}님 내부의 불안이 더 크게 잡힙니다. ${f.weakest}이 부족한 구조에서는 상대의 침묵이나 피로를 거절로 해석하기 쉽습니다.`}\n\n구분하는 기준은 단순합니다. 반복되는 사실(패턴)이 있는지, 아니면 한 번의 장면을 계속 재해석하고 있는지. 후자라면 이건 관계의 문제가 아니라 ${input.name}님이 지쳐 있다는 신호입니다.`,
        },
        {
          heading: "이 관계를 가져갈 것인가",
          body: `${f.dayClash && f.hasDohwa ? `충과 도화가 함께 있는 배치는 관계를 유지하는 비용이 큽니다. 이 상태로 끌고 가면 ${input.name}님의 에너지가 먼저 소진됩니다.` : f.dayHarmony ? `배우자궁에 합이 남아 있어 회복의 여지가 있습니다. 다만 덮고 넘어가는 방식으로는 같은 자리에서 반복됩니다.` : `관계를 유지할지 정리할지는 사주보다 확인된 사실이 결정해야 합니다.`}\n\n${m.clashMonth}월은 대화를 피하세요. 일지를 충하는 ${m.clashBranch} 달이라 확인이 추궁으로 변하고, 되돌릴 수 없는 말이 나옵니다. 대화가 필요하다면 ${m.harmonyMonth}월이 적절합니다.`,
        },
      ],
      timing: timingBase(f),
      actions: [
        `추측이 아니라 반복되는 사실 두 가지 이상을 확인하기 전까지 결론을 내리지 않는다.`,
        `${m.clashMonth}월에는 관계를 확인하는 대화를 하지 않는다.`,
        `대화는 ${m.harmonyMonth}월에, 추궁이 아니라 "내가 무엇을 느꼈는지"로 시작한다.`,
      ],
    };
  },

  // ── 이직 · 합격 ─────────────────────────────
  career_move: (f, input) => {
    const m = monthsFor(f.dayBranchIdx);
    const favorable = f.counts.관성 > 0 && f.counts.인성 > 0;
    return {
      verdictTone: favorable ? "positive" : f.counts.관성 === 0 ? "caution" : "neutral",
      verdict: favorable
        ? `${input.name}님은 지금 움직여도 되는 시기입니다. 관성(官星)이 ${f.counts.관성}개로 자리를 잡아주고 인성(印星)이 ${f.counts.인성}개로 그걸 받쳐줍니다. 합격·성사 가능성이 구조적으로 열려 있는 배치이고, ${f.hasYeokma ? "역마(驛馬)까지 있어 이동 자체가 순조롭습니다." : "실행 시기만 맞추면 됩니다."} ${m.harmonyMonth}월을 기준으로 움직이세요.`
        : f.counts.관성 === 0
          ? `${input.name}님은 이직 자체는 가능하지만 '합격'의 형태로는 쉽지 않습니다. 관성(官星)이 원국에 없어 조직이 요구하는 규격에 자신을 맞추는 힘이 약합니다. 공채나 시험처럼 정형화된 관문보다, 사람을 통해 들어가는 경로가 훨씬 유리합니다.`
          : `${input.name}님은 조건부로 유리합니다. 관성(官星)이 ${f.counts.관성}개 있어 자리는 만들어지지만 인성(印星)이 ${f.counts.인성}개로 받쳐주는 힘이 부족합니다. 준비 없이 지원하면 최종에서 밀리는 패턴이 나옵니다.`,
      evidence: [
        `관성(官星, 직위·조직·규범)이 ${f.counts.관성}개입니다. ${f.counts.관성 === 0 ? "조직의 틀에 맞추기보다 스스로 만든 방식으로 성과를 내는 구조입니다." : f.counts.관성 >= 3 ? "책임과 압박을 동시에 많이 받는 배치라, 자리를 옮겨도 부담의 총량은 줄지 않습니다." : "조직 안에서 안정적으로 자리를 잡는 구조입니다."}`,
        `인성(印星, 배움·자격·인정)이 ${f.counts.인성}개입니다. ${f.counts.인성 === 0 ? "자격이나 문서로 증명하는 경로가 약합니다. 포트폴리오처럼 결과물로 보여주는 방식이 유리합니다." : "준비한 것을 인정받는 힘이 있습니다. 서류·자격 기반의 관문에서 유리합니다."}`,
        `식상(食傷, 실행과 표현)이 ${f.counts.식상}개입니다. ${f.counts.식상 >= 3 ? "만들고 표현하는 힘이 강해, 정해진 절차보다 실무 성과로 평가받는 곳에서 빠르게 인정받습니다." : "실행보다 구조와 안정 쪽에 강점이 있습니다."}`,
        daewoonLine(f),
        f.hasYeokma
          ? `역마(驛馬)가 있습니다. 이동·전환이 사주에 내장된 배치라 옮기는 결정 자체는 무리가 없습니다.`
          : `역마(驛馬)가 없습니다. 한 자리에서 깊게 쌓는 구조라, 잦은 이동은 오히려 성과를 깎아먹습니다. 옮긴다면 마지막이라는 각오로 고르세요.`,
      ],
      sections: [
        {
          heading: "지금이 옮길 시기인가",
          body: `${daewoonLine(f)}\n\n${f.currentDaewoon ? `대운 지지가 ${f.currentDaewoon.branchSipsin}입니다. ${SIPSIN_GROUP[f.currentDaewoon.branchSipsin] === "관성" ? "조직과 직책의 기운이 들어오는 구간이라 이직·승진에 유리합니다. 이 시기를 놓치면 다음 기회까지 간격이 큽니다." : SIPSIN_GROUP[f.currentDaewoon.branchSipsin] === "재성" ? "성과와 보상의 기운이 들어오는 구간입니다. 연봉 협상력이 평소보다 높습니다." : SIPSIN_GROUP[f.currentDaewoon.branchSipsin] === "인성" ? "배움과 자격의 기운이 들어오는 구간입니다. 지금은 옮기기보다 준비를 채울 때 유리합니다." : SIPSIN_GROUP[f.currentDaewoon.branchSipsin] === "식상" ? "실행과 확장의 기운이 들어오는 구간입니다. 새 일을 벌이기에 좋지만 조직 적응에는 마찰이 있습니다." : "경쟁과 자립의 기운이 들어오는 구간입니다. 조직 이동보다 독립·프리랜스가 잘 맞습니다."}` : ""}\n\n올해 세운은 ${f.yearGanzi}이고 일간 기준 ${f.yearSipsin}입니다. ${SIPSIN_GROUP[f.yearSipsin] === "관성" ? "합격·임용의 기운이 들어오는 해라 지원을 미룰 이유가 없습니다." : SIPSIN_GROUP[f.yearSipsin] === "인성" ? "문서와 자격의 해입니다. 시험·자격증·서류 기반 지원에 유리합니다." : SIPSIN_GROUP[f.yearSipsin] === "재성" ? "실질적인 보상이 들어오는 해입니다. 조건 협상에 집중하세요." : SIPSIN_GROUP[f.yearSipsin] === "식상" ? "성과를 드러내는 해입니다. 결과물 중심으로 어필하세요." : "경쟁이 심해지는 해입니다. 같은 자리를 두고 겨루는 상황이 많아지니 차별점을 분명히 하세요."}`,
        },
        {
          heading: "합격 가능성",
          body: `${favorable ? `관성과 인성이 함께 있어 '지원 → 검증 → 합격'의 경로가 온전히 작동합니다. 서류에서 걸러지는 유형이 아닙니다.` : f.counts.인성 === 0 ? `인성이 없어 서류·자격 단계에서 밀릴 수 있습니다. 대신 실무 과제나 면접처럼 직접 보여주는 관문에서는 강합니다. 지원 채널을 그쪽으로 몰아주세요.` : `관성이 약해 최종 결정 단계에서 다른 후보에게 밀리는 패턴이 나옵니다. 추천이나 내부 연결을 확보하면 이 약점이 크게 줄어듭니다.`}\n\n${f.goegang ? "괴강(魁罡)이 있습니다. 강한 인상을 주는 배치라 평가가 극단으로 갈립니다. 무난하게 통과하기보다 확실히 선택되거나 확실히 탈락합니다. 지원처를 넓게 잡으세요." : ""}${f.yangin ? "양인(羊刃)이 있습니다. 추진력이 강한 만큼 면접에서 과하게 단정적으로 들릴 수 있으니, 결론보다 근거를 먼저 말하는 연습이 필요합니다." : ""}`,
        },
        {
          heading: "움직여야 할 달",
          body: `${m.harmonyMonth}월이 핵심입니다. 일지와 육합하는 ${m.harmonyBranch} 달이라 제안·면접·협상이 부드럽게 풀립니다.${m.tripleMonths.length ? ` ${m.tripleMonths.join("월, ")}월은 삼합이 작동해 추천이나 소개로 기회가 들어오기 쉽습니다. 이 시기에 인맥을 정리해 두세요.` : ""}\n\n${m.clashMonth}월은 피하세요. 일지를 충하는 ${m.clashBranch} 달이라 급하게 결정하고 나중에 후회하는 패턴이 나옵니다. 이 달에 받은 오퍼는 최소 2주 미루고 판단하세요.`,
        },
      ],
      timing: timingBase(f),
      actions: [
        `${m.harmonyMonth}월에 지원·면접 일정이 걸리도록 역산해서 준비한다.`,
        f.counts.인성 === 0
          ? `서류보다 실무 과제·포트폴리오로 평가받는 채널을 우선한다.`
          : `자격·문서로 증명 가능한 항목을 먼저 정리한다.`,
        `${m.clashMonth}월에 들어온 제안은 즉답하지 않고 2주 뒤 다시 판단한다.`,
      ],
    };
  },

  // ── 궁합 · 결혼 결정 ────────────────────────
  marriage: (f, input) => {
    const m = monthsFor(f.dayBranchIdx);
    const stable = f.dayHarmony && !f.dayClash;
    return {
      verdictTone: stable ? "positive" : f.dayClash ? "caution" : "neutral",
      verdict: stable
        ? `결혼으로 가기에 무리가 없는 구조입니다. 배우자궁에 합(合)이 걸려 있어 관계를 오래 붙잡는 힘이 있습니다. 다만 궁합의 최종 판단은 상대의 사주와 맞춰봐야 하고, 이 결과지는 ${input.name}님 쪽 구조만 본 것입니다.`
        : f.dayClash
          ? `결혼을 결정하기 전에 확인할 게 있습니다. 배우자궁이 충(沖)을 맞고 있어, 함께 사는 형태로 들어갔을 때 부딪히는 지점이 분명히 생깁니다. 이건 상대가 나빠서가 아니라 ${input.name}님의 관계 구조가 원래 그렇습니다. 미리 알고 규칙을 만들면 넘어갈 수 있는 문제입니다.`
          : `가능은 하지만 추진력이 부족한 구조입니다. 배우자궁이 조용해서 관계가 저절로 결혼까지 굴러가지 않습니다. 누군가 결정을 만들어야 진행됩니다.`,
      evidence: [
        dayPalaceLine(f),
        spouseStarLine(f, input.gender),
        `${f.counts.관성}개의 관성(官星)과 ${f.counts.인성}개의 인성(印星)을 가지고 있습니다. ${f.counts.관성 >= 2 && f.counts.인성 >= 2 ? "책임과 안정을 동시에 중시해, 결혼을 '형식'으로 완성하려는 성향이 강합니다." : f.counts.관성 === 0 ? "제도나 형식보다 관계의 실질을 중시합니다. 결혼이라는 절차 자체에는 큰 의미를 두지 않는 편입니다." : "관계의 안정을 원하지만, 형식보다 생활의 합이 더 중요합니다."}`,
        `오행에서 ${f.strongest}이 강하고 ${f.weakest}이 부족합니다. 함께 사는 관계에서는 부족한 ${f.weakest}이 갈등의 지점으로 반복해서 나타납니다.`,
      ],
      sections: [
        {
          heading: "이 사람과 살았을 때 부딪히는 지점",
          body: `강한 ${f.strongest}은 생활에서 기준과 속도로 드러납니다. ${input.name}님이 옳다고 생각하는 방식이 분명해서, 상대가 다른 속도로 움직일 때 답답함이 먼저 올라옵니다. ${f.counts.비겁 >= 3 ? `비겁(比劫)이 ${f.counts.비겁}개로 강해 '내 방식'을 양보하는 폭이 좁습니다. 집안일 분담이나 돈 관리처럼 매일 반복되는 영역에서 마찰이 생깁니다.` : ""}\n\n부족한 ${f.weakest}은 갈등을 마무리하는 능력입니다. 싸움이 길어지는 게 아니라, 끝내지 않고 덮어두는 방식으로 쌓입니다. ${f.dayClash ? "배우자궁에 충이 있어 쌓인 것이 한 번에 터지는 형태로 나옵니다. 그때는 이미 대화로 풀 수 있는 단계를 지나 있습니다." : ""}`,
        },
        {
          heading: "서로를 버티게 하는 지점",
          body: `${f.dayHarmony ? `배우자궁에 합이 있어, 크게 부딪힌 뒤에도 다시 붙는 힘이 있습니다. 이 구조는 갈등의 유무보다 회복 속도가 관계를 결정합니다.` : `배우자궁에 합이 없어 자동 회복은 기대하기 어렵습니다. 화해를 위한 절차를 미리 정해두는 편이 안전합니다.`}\n\n${f.counts.인성 >= 2 ? `인성(印星)이 ${f.counts.인성}개로 상대를 이해하려는 힘이 있습니다. 설명을 들으면 납득하는 타입이라, 상대가 이유를 말해주는 관계에서 안정적입니다.` : `인성(印星)이 적어 설명보다 행동으로 확인받아야 안심합니다. 말로 하는 약속보다 실제로 지켜지는 작은 습관이 신뢰를 만듭니다.`}${f.counts.식상 >= 2 ? ` 식상(食傷)이 ${f.counts.식상}개라 표현을 아끼지 않습니다. 감정을 쌓아두지 않는 건 장점이지만, 말이 앞서 상처를 남기기도 합니다.` : ""}`,
        },
        {
          heading: "결혼에 유리한 시기",
          body: `${m.harmonyMonth}월이 일지와 육합하는 ${m.harmonyBranch} 달로, 관계를 한 단계 진전시키기에 가장 안정적입니다. 상견례나 결정 대화를 이 시기에 배치하세요.${m.tripleMonths.length ? ` ${m.tripleMonths.join("월, ")}월도 삼합이 작동해 양가가 얽히는 일이 순조롭습니다.` : ""}\n\n${m.clashMonth}월은 피하세요. 일지를 충하는 ${m.clashBranch} 달이라 사소한 조율이 감정 문제로 번집니다.\n\n${daewoonLine(f)} 올해 세운 ${f.yearGanzi}은 ${f.yearSipsin}으로, ${SIPSIN_GROUP[f.yearSipsin] === "관성" ? "결혼·책임의 기운이 들어오는 해입니다. 결정하기 좋은 시기입니다." : SIPSIN_GROUP[f.yearSipsin] === "인성" ? "안정과 정착의 기운이 들어옵니다. 준비를 구체화하기 좋습니다." : SIPSIN_GROUP[f.yearSipsin] === "재성" ? "현실적인 조건이 정리되는 해입니다. 집·비용 문제를 먼저 매듭짓는 게 순서입니다." : SIPSIN_GROUP[f.yearSipsin] === "식상" ? "변화와 확장의 기운이라 마음이 자주 바뀝니다. 결정을 서두르지 마세요." : "경쟁과 비교가 심해지는 해입니다. 남과 비교해 결정하면 후회가 남습니다."}`,
        },
      ],
      timing: timingBase(f),
      actions: [
        `상대의 생년월일시를 확보해 두 사람 궁합을 함께 봐야 판단이 완성된다.`,
        `${m.harmonyMonth}월에 결정 대화나 상견례를 배치한다.`,
        `부족한 ${f.weakest} 때문에 반복되는 갈등을 어떻게 끝낼지, 규칙 하나를 미리 합의한다.`,
      ],
    };
  },

  // ── 금전 · 투자 ─────────────────────────────
  money: (f, input) => {
    const m = monthsFor(f.dayBranchIdx);
    const leak = f.counts.비겁 >= 3 && f.counts.재성 <= 1;
    const strong = f.counts.재성 >= 2 && f.counts.식상 >= 1;
    return {
      verdictTone: leak ? "caution" : strong ? "positive" : "neutral",
      verdict: leak
        ? `${input.name}님은 지금 벌기보다 지킬 때입니다. 비겁(比劫)이 ${f.counts.비겁}개인데 재성(財星)은 ${f.counts.재성}개입니다. 재물을 나눠 갖는 힘이 재물 자체보다 강한 구조라, 수익이 나도 남에게 흘러가거나 예상 못한 지출로 빠집니다. 이 구간에서 레버리지를 쓰면 손실이 증폭됩니다.`
        : strong
          ? `${input.name}님의 재물 구조는 안정적입니다. 재성(財星) ${f.counts.재성}개를 식상(食傷) ${f.counts.식상}개가 생(生)해주는 배치라, 만들어낸 결과물이 돈으로 연결되는 흐름이 살아 있습니다. 확장을 검토해도 되는 구간입니다.`
          : `${input.name}님은 공격보다 균형이 맞는 구간입니다. 재성이 ${f.counts.재성}개로 큰 손실도 큰 확장도 나오기 어려운 구조입니다. 수익률을 높이려다 원금을 흔들기보다, 새는 지출을 막는 쪽이 실질 이득이 큽니다.`,
      evidence: [
        `재성(財星, 재물)이 ${f.counts.재성}개입니다. ${f.counts.재성 === 0 ? "재물이 겉으로 드러나지 않는 구조입니다. 목돈보다 꾸준한 현금흐름 쪽이 맞습니다." : f.counts.재성 >= 3 ? "재물의 기회가 많은 대신, 관리하지 않으면 들어온 만큼 나갑니다." : "재물을 다루는 감각이 안정적입니다."}`,
        `비겁(比劫, 나와 같은 기운 = 경쟁·분배)이 ${f.counts.비겁}개입니다. ${f.counts.비겁 >= 3 ? "재물을 나누는 힘이 강합니다. 동업, 지인 대여, 공동 투자에서 손실이 나기 쉽습니다." : "재물이 밖으로 새는 압력은 크지 않습니다."}`,
        `식상(食傷, 생산·표현)이 ${f.counts.식상}개입니다. ${f.counts.식상 >= 2 ? "식상생재(食傷生財) — 만들어서 파는 구조가 작동합니다. 노동 소득보다 결과물 기반 소득이 유리합니다." : "생산으로 재물을 만드는 힘은 약한 편이라, 안정적인 소득원을 지키는 쪽이 낫습니다."}`,
        daewoonLine(f),
      ],
      sections: [
        {
          heading: "돈이 들어오는 방식",
          body: `${f.counts.식상 >= 2 && f.counts.재성 >= 1 ? `식상(食傷)이 재성(財星)을 생(生)하는 배치입니다. 만든 것을 파는 구조 — 콘텐츠, 제품, 전문 서비스처럼 결과물이 남는 일에서 돈이 붙습니다. 시간을 파는 형태의 소득은 이 사주의 장점을 살리지 못합니다.` : f.counts.관성 >= 2 ? `관성(官星)이 ${f.counts.관성}개로 강합니다. 조직 안에서의 직위와 안정적인 급여가 주된 재물 통로입니다. 사업보다 커리어를 올리는 쪽이 수익률이 높습니다.` : `재물이 한 가지 통로로 크게 들어오기보다 여러 갈래로 나뉘어 들어옵니다. 부업이나 병행 수입이 자연스러운 구조입니다.`}\n\n오행에서 ${f.strongest}이 강하고 ${f.weakest}이 부족합니다. 부족한 ${f.weakest}은 재물 관리에서 ${f.weakest === "금(金)" ? "정리하고 끊어내는 능력" : f.weakest === "수(水)" ? "유연하게 방향을 바꾸는 능력" : f.weakest === "토(土)" ? "쌓아두고 지키는 능력" : f.weakest === "화(火)" ? "확산시키고 알리는 능력" : "새로 시작하고 확장하는 능력"}으로 나타납니다. 여기가 약점이니 시스템으로 보완해야 합니다.`,
        },
        {
          heading: "돈이 새는 지점",
          body: `${f.counts.비겁 >= 3 ? `비겁(比劫)이 ${f.counts.비겁}개로 과다합니다. 이 구조에서 가장 흔한 손실은 투자 실패가 아니라 사람입니다. 지인 대여, 동업, 보증, 체면 때문에 쓰는 돈 — 여기서 빠져나가는 총액이 투자 손실보다 큽니다.` : `재물이 급격히 새는 구조는 아닙니다. 다만 ${f.counts.식상 >= 3 ? "식상이 강해 새로운 걸 시도하는 데 드는 비용이 누적됩니다." : "고정비가 조용히 늘어나는 형태로 빠져나갑니다."}`}\n\n${f.yangin ? "양인(羊刃)이 있습니다. 결단이 빠른 만큼 손실 구간에서 물타기나 몰빵 같은 극단적 선택이 나오기 쉽습니다. 손절 기준을 숫자로 미리 정해두지 않으면 반드시 한 번은 크게 당합니다." : ""}${f.hasYeokma ? " 역마(驛馬)가 있어 이동·해외와 관련된 지출과 수입이 함께 커집니다." : ""}`,
        },
        {
          heading: "투자·큰 지출 타이밍",
          body: `올해 세운은 ${f.yearGanzi}, 일간 기준 ${f.yearSipsin}입니다. ${SIPSIN_GROUP[f.yearSipsin] === "재성" ? "재물의 기운이 직접 들어오는 해입니다. 확장과 투자에 유리한 구간입니다." : SIPSIN_GROUP[f.yearSipsin] === "비겁" ? "경쟁과 분배의 해입니다. 돈이 나가는 압력이 큰 해라 신규 투자보다 방어가 우선입니다." : SIPSIN_GROUP[f.yearSipsin] === "식상" ? "생산의 해입니다. 당장의 수익보다 수익원을 만드는 데 투자하는 편이 낫습니다." : SIPSIN_GROUP[f.yearSipsin] === "관성" ? "책임과 지출이 함께 늘어나는 해입니다. 큰 결정은 하반기로 미루세요." : "안정과 문서의 해입니다. 부동산·계약처럼 문서로 남는 자산이 유리합니다."}\n\n월별로는 ${m.harmonyMonth}월이 일지와 육합하는 ${m.harmonyBranch} 달로, 계약이나 큰 결정에 저항이 적습니다.${m.tripleMonths.length ? ` ${m.tripleMonths.join("월, ")}월은 삼합이 작동해 협업·자금 조달이 수월합니다.` : ""} ${m.clashMonth}월은 일지를 충하는 ${m.clashBranch} 달이라 충동적인 큰 지출이 나오기 쉽습니다. 이 달에는 신규 투자와 고액 결제를 미루세요.`,
        },
      ],
      timing: timingBase(f),
      actions: [
        f.counts.비겁 >= 3
          ? `지인 대여·동업·보증은 올해 전면 보류한다. 이 구조에서 가장 큰 손실 경로다.`
          : `고정비를 항목별로 분리해 6개월치 흐름을 먼저 확인한다.`,
        `${m.clashMonth}월에는 신규 투자와 고액 결제를 하지 않는다.`,
        `손절 기준을 금액이 아니라 비율(%)로 미리 정해 문서로 남긴다.`,
      ],
    };
  },

  // ── 신년운세 ────────────────────────────────
  new_year: (f, input) => {
    const m = monthsFor(f.dayBranchIdx);
    const g = SIPSIN_GROUP[f.yearSipsin];
    const expansion = g === "재성" || g === "식상";
    const year = new Date().getFullYear();
    return {
      verdictTone: expansion ? "positive" : g === "비겁" ? "caution" : "neutral",
      verdict: `${year}년 세운은 ${f.yearGanzi}, ${input.name}님의 일간 ${f.dayStem}(${f.dayStemKo})을 기준으로 ${f.yearSipsin}입니다. ${expansion ? `확장기입니다. 벌이고 만들고 알리는 쪽으로 힘이 실리는 해라, 올해 시작한 일이 내년 성과로 이어집니다.` : g === "비겁" ? `경쟁기입니다. 같은 자리를 두고 겨루는 상황이 많아지고 지출 압력도 커집니다. 새로 벌이기보다 지키고 정리하는 해로 잡으세요.` : g === "관성" ? `정리기이자 책임기입니다. 자리와 역할이 무거워지는 해라, 벌이기보다 맡은 것을 완성하는 데 힘을 쓰는 편이 유리합니다.` : `축적기입니다. 배우고 자격을 갖추고 문서를 정리하는 해입니다. 지금 쌓아둔 것이 다음 확장기의 재료가 됩니다.`}`,
      evidence: [
        `${year}년 세운 ${f.yearGanzi} — 일간 대비 ${f.yearSipsin}(${g}) 운입니다.`,
        daewoonLine(f),
        `원국 오행은 ${f.strongest}이 가장 강하고 ${f.weakest}이 부족합니다. 올해는 부족한 ${f.weakest}을 채우는 활동에서 성과가 잘 납니다.`,
        `합(合) ${f.harmonyCount}개, 충(沖) ${f.clashCount}개. ${f.clashCount > f.harmonyCount ? "변동이 큰 구조라 올해 계획은 여유를 두고 잡으세요." : "안정적인 구조라 계획대로 밀고 나갈 수 있습니다."}`,
      ],
      sections: [
        {
          heading: `${year}년의 방향`,
          body: `${expansion ? `${f.yearSipsin} 운은 밖으로 나가는 기운입니다. 새 일, 새 사람, 새 시장 — 확장 쪽 선택이 대체로 맞습니다. 다만 ${f.counts.비겁 >= 3 ? `원국에 비겁이 ${f.counts.비겁}개로 많아 경쟁자가 함께 따라붙습니다. 차별점을 분명히 하지 않으면 확장이 소모전이 됩니다.` : `벌린 만큼 관리 부담이 늘어나니 한 번에 두 가지 이상 시작하지 마세요.`}` : g === "비겁" ? `${f.yearSipsin} 운은 나와 같은 기운이 강해지는 해입니다. 사람이 몰리고 기회도 늘지만, 그만큼 나눠 갖게 됩니다. 특히 돈과 관련된 협업은 올해 신중해야 합니다.` : g === "관성" ? `${f.yearSipsin} 운은 책임이 들어오는 해입니다. 승진, 계약, 결혼처럼 형식이 확정되는 일이 많아집니다. 부담스럽더라도 받아두면 다음 단계의 발판이 됩니다.` : `${f.yearSipsin} 운은 안으로 쌓는 해입니다. 자격, 공부, 문서, 부동산처럼 형태로 남는 것에 유리합니다. 조급하게 성과를 내려 하면 오히려 손실이 납니다.`}\n\n${daewoonLine(f)}`,
        },
        {
          heading: "고비가 되는 달",
          body: `${m.clashMonth}월이 가장 주의할 달입니다. 일지 ${f.dayBranchLabel}를 정면으로 충(沖)하는 ${m.clashBranch} 달이라, 관계·건강·계약 어느 쪽이든 예상 못한 변동이 생깁니다. 이 달에는 새로 시작하거나 크게 결정하지 마세요.\n\n${f.clashCount >= 2 ? `원국에 이미 충이 ${f.clashCount}개 있어 변동에 민감한 구조입니다. 계획을 세울 때 일정 여유를 20% 정도 더 잡으세요.` : `원국이 비교적 안정적이라 이 달만 넘기면 큰 흔들림은 없습니다.`}${f.yangin ? " 양인(羊刃)이 있어 충이 겹치는 달에는 판단이 극단으로 흐릅니다. 중요한 통보는 하루 미루고 결정하세요." : ""}`,
        },
        {
          heading: "밀어붙여도 되는 달",
          body: `${m.harmonyMonth}월이 일지와 육합(六合)하는 ${m.harmonyBranch} 달로 가장 유리합니다. 협상, 계약, 관계 진전 — 저항이 가장 적은 구간입니다.${m.tripleMonths.length ? `\n\n${m.tripleMonths.join("월, ")}월은 일지와 삼합(三合)을 이루는 ${m.tripleBranches.join(", ")} 달입니다. 혼자보다 함께할 때 힘이 커지는 시기라, 협업이나 소개를 이 시기에 배치하세요.` : ""}\n\n올해 전체를 놓고 보면 ${m.harmonyMonth}월과 ${m.tripleMonths.length ? m.tripleMonths.join("월, ") + "월" : "상반기"}에 중요한 일을 몰아두고, ${m.clashMonth}월은 비워두는 배치가 가장 안전합니다.`,
        },
      ],
      timing: timingBase(f),
      actions: [
        `중요한 결정과 계약을 ${m.harmonyMonth}월에 배치한다.`,
        `${m.clashMonth}월은 새 시작 없이 정비하는 달로 비워둔다.`,
        `부족한 ${f.weakest}을 채우는 활동 하나를 올해 목표에 넣는다.`,
      ],
    };
  },
};

// ──────────────────────────────────────────────
// 공개 API
// ──────────────────────────────────────────────

export function buildCategoryReport(
  input: CategoryAnalysisInput,
  categoryId: PaidCategoryId
): CategoryReport | null {
  const category = getPaidCategory(categoryId);
  if (!category) return null;

  try {
    const facts = collectFacts(input);
    const built = BUILDERS[categoryId](facts, input);
    return {
      categoryId,
      name: category.name,
      subtitle: category.subtitle,
      ...built,
    };
  } catch {
    // 계산 실패 시 결과지 전체를 막지 않는다.
    return null;
  }
}
