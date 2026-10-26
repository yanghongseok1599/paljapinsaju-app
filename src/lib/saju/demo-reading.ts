import type { FourPillarsDetail } from "manseryeok";
import {
  analyzeSaju,
  extractSajuSummary,
  getElementStrength,
} from "@/lib/saju/calculator";
import type {
  ConcernType,
  FiveElementDistribution,
  Gender,
  SajuAnalysis,
  SajuInputForm,
  SajuReading,
} from "@/types/saju";
import { CONCERN_LABELS } from "@/types/saju";
import { type PaidCategoryId } from "@/lib/saju/categories";
import { getPaidCategory } from "@/lib/saju/categories";
import { buildCategoryReport } from "@/lib/saju/category-analysis";
import { buildMonthlyFortune } from "@/lib/saju/monthly-fortune";
import { josa } from "@/lib/saju/josa";
import { buildReportSections, buildTeasers } from "@/lib/saju/report-analysis";

export const DEMO_READING_STORAGE_KEY = "paljapin.demo.readings";

const ELEMENT_TONES: Record<keyof FiveElementDistribution, string> = {
  wood: "성장과 기획",
  fire: "표현과 추진",
  earth: "안정과 축적",
  metal: "판단과 정리",
  water: "지혜와 유연성",
};

const ELEMENT_COLORS: Record<keyof FiveElementDistribution, string> = {
  wood: "초록",
  fire: "레드",
  earth: "골드",
  metal: "화이트",
  water: "네이비",
};

const DIRECTIONS: Record<keyof FiveElementDistribution, string> = {
  wood: "동쪽",
  fire: "남쪽",
  earth: "중앙",
  metal: "서쪽",
  water: "북쪽",
};

function toPlainPillars(pillars: FourPillarsDetail): FourPillarsDetail {
  return JSON.parse(JSON.stringify(pillars)) as FourPillarsDetail;
}

function strongestElement(elements: FiveElementDistribution) {
  return (Object.entries(elements) as [keyof FiveElementDistribution, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

function weakestElement(elements: FiveElementDistribution) {
  return (Object.entries(elements) as [keyof FiveElementDistribution, number][])
    .sort((a, b) => a[1] - b[1])[0][0];
}

function concernText(concerns: ConcernType[]) {
  return concerns.map((concern) => CONCERN_LABELS[concern]).join(", ");
}

function buildDemoAnalysis(
  input: SajuInputForm,
  pillars: FourPillarsDetail,
  elements: FiveElementDistribution,
  categoryId?: PaidCategoryId,
): SajuAnalysis {
  const summary = extractSajuSummary(pillars, elements);
  const strength = getElementStrength(elements);
  const strongest = strongestElement(elements);
  const weakest = weakestElement(elements);
  const dayStem = summary.dayMaster.stem;
  const keywords = summary.personalityKeywords.slice(0, 4).join(", ");
  const concerns = concernText(input.concerns);
  const currentYear = new Date().getFullYear();

  // 사주 원국 기반 해석 엔진 (AI 호출 없음).
  // 간지 계산이 되면 이쪽 결과를 쓰고, 안 되면 아래 기본 문장으로 떨어진다.
  const engine = buildReportSections(
    {
      name: input.name,
      gender: input.gender as Gender,
      birthYear: input.birthYear,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      birthHour: input.birthHour,
      isLunar: input.isLunar,
    },
    ELEMENT_COLORS[weakest],
  );

  const engineInput = {
    name: input.name,
    gender: input.gender as Gender,
    birthYear: input.birthYear,
    birthMonth: input.birthMonth,
    birthDay: input.birthDay,
    birthHour: input.birthHour,
    isLunar: input.isLunar,
  };

  // 결제 전 화면용 — 이 사주에서 실제로 나온 특이점 3가지
  const lockedTeasers = buildTeasers(engineInput);

  // 결제하면 열리는 분량. 무료로 보여주는 총론·성격은 뺀다.
  const lockedKeys = [
    "love", "career", "wealth", "health", "yearlyFortune",
    "tenGods", "majorCycles", "relationship", "actionAdvice",
    "summary", "closingMessage",
  ] as const;
  const lockedChars = engine
    ? lockedKeys.reduce((sum, k) => sum + (engine[k]?.length ?? 0), 0)
    : 0;

  return {
    lockedTeasers: lockedTeasers.length > 0 ? lockedTeasers : undefined,
    lockedVolume: lockedChars
      ? { chars: lockedChars, sections: lockedKeys.length + 2 }
      : undefined,
    categoryReport: categoryId
      ? buildCategoryReport(
          {
            name: input.name,
            gender: input.gender,
            birthYear: input.birthYear,
            birthMonth: input.birthMonth,
            birthDay: input.birthDay,
            birthHour: input.birthHour,
            isLunar: input.isLunar,
          },
          categoryId
        ) ?? undefined
      : undefined,
    overview: engine?.overview ?? `${input.name}님의 사주는 일간 ${dayStem}을 중심으로 ${strength.strongest}의 기운이 두드러지고 ${strength.weakest}의 보완이 필요한 구조입니다. 강한 기운은 추진력이 되지만 한쪽으로 치우치면 같은 실수를 반복하게 만들고, 부족한 기운은 평소에는 잘 드러나지 않다가 중요한 순간에 발목을 잡습니다. 아래에서 이 두 축이 ${input.name}님의 관계, 일, 돈에서 각각 어떻게 작용하는지 나누어 봅니다.`,
    personality: engine?.personality ?? `${input.name}님은 ${keywords}의 성향이 강하게 드러납니다. 강한 기운은 ${josa(ELEMENT_TONES[strongest], "으로/로")} 나타나며, 결정을 미루기보다 직접 방향을 잡을 때 장점이 살아납니다. 다만 ${josa(ELEMENT_TONES[weakest], "이/가")} 부족하게 느껴지는 순간에는 속도를 늦추고 기록, 확인, 휴식을 의식적으로 넣는 것이 좋습니다.`,
    love: engine?.love ?? `연애와 관계에서는 감정의 온도보다 신뢰의 리듬이 중요합니다. 빠른 확신보다 반복되는 행동에서 안정감을 확인할 때 좋은 인연이 오래 갑니다. 상대에게 맞추기만 하기보다 ${input.name}님이 중요하게 여기는 기준을 초반에 부드럽게 공유하면 관계 피로가 줄어듭니다.`,
    career: engine?.career ?? `직업운은 ${josa(ELEMENT_TONES[strongest], "을/를")} 살리는 역할에서 강합니다. 기획, 설득, 실행, 정리 중 본인이 자연스럽게 에너지가 나는 구간을 중심으로 포지션을 잡으세요. 올해는 한 번에 큰 전환을 하기보다 기존 역량을 눈에 보이는 산출물로 정리할 때 기회가 커집니다.`,
    wealth: engine?.wealth ?? `재물운은 갑작스러운 한 방보다 구조화된 반복에서 좋아집니다. 수입과 지출을 단순히 기록하는 수준을 넘어, 고정비와 투자성 지출을 분리해 관리하면 새는 돈을 줄일 수 있습니다. ${concerns || "현재 고민"}과 연결된 지출은 감정 결제를 조심하는 편이 좋습니다.`,
    health: engine?.health ?? `건강운은 생활 리듬의 영향을 크게 받습니다. 오행상 ${strength.balance}으로 보이며, 부족한 ${strength.weakest}의 기운은 수면, 수분, 호흡, 가벼운 유산소처럼 기본 루틴으로 보완하는 것이 안정적입니다. 무리한 단기 관리보다 매일 같은 시간대의 회복 습관이 잘 맞습니다.`,
    yearlyFortune: engine?.yearlyFortune ?? `${currentYear}년은 선택지를 넓히기보다 우선순위를 정리하는 해입니다. 이미 하고 있는 일 중 성과가 나는 흐름을 남기고, 에너지만 쓰는 관계나 업무는 정리할 필요가 있습니다. 상반기에는 기반을 다지고, 하반기에는 결과를 공개하거나 제안하는 흐름이 좋습니다.`,
    monthlyFortune: buildMonthlyFortune({
      dayStem: pillars.day.heavenlyStem,
      dayBranch: pillars.day.earthlyBranch,
    }),
    luckyElements: {
      color: ELEMENT_COLORS[weakest],
      direction: DIRECTIONS[weakest],
      number: String(((input.birthYear + input.birthMonth + input.birthDay) % 9) + 1),
    },
    summary: engine?.summary ?? `${input.name}님의 핵심은 강한 ${josa(ELEMENT_TONES[strongest], "을/를")} 현실적인 루틴으로 연결하는 것입니다. 부족한 ${josa(ELEMENT_TONES[weakest], "을/를")} 보완하면 관계, 일, 돈의 흐름이 더 안정적으로 이어집니다.`,
    tenGods: engine?.tenGods ?? `일간 ${dayStem}을 기준으로 보면 본인의 기준과 책임감이 중요한 축입니다. 타인의 기대를 모두 떠안기보다 역할의 경계를 선명하게 두면 장점이 더 잘 발휘됩니다.`,
    majorCycles: engine?.majorCycles ?? `큰 운의 흐름은 준비기, 확장기, 정리기가 반복되는 구조로 보는 것이 좋습니다. 지금은 무리한 확장보다 다음 기회를 담을 그릇을 정돈하는 쪽이 유리합니다.`,
    relationship: engine?.relationship ?? `대인관계에서는 말의 강도보다 일관성이 신뢰를 만듭니다. 약속을 작게 잡고 정확히 지키는 방식이 ${input.name}님의 평판을 안정적으로 올립니다.`,
    actionAdvice: engine?.actionAdvice ?? `오늘 바로 할 일은 세 가지입니다. 첫째, 최근 고민을 한 문장으로 적기. 둘째, 이번 주에 줄일 일 하나를 정하기. 셋째, 행운색 ${josa(ELEMENT_COLORS[weakest], "을/를")} 책상이나 옷차림에 작게 반영하기.`,
    closingMessage: engine?.closingMessage ?? `사주는 정해진 결말이 아니라 타고난 조건입니다. ${input.name}님에게 강하게 들어온 ${josa(ELEMENT_TONES[strongest], "은/는")} 이미 쓰고 계실 가능성이 높고, 부족한 ${josa(ELEMENT_TONES[weakest], "을/를")} 의식해서 채워야 비로소 균형이 잡힙니다. 위의 조언 중 당장 할 수 있는 한 가지부터 시작해 보세요.`,
  };
}

export function createDemoReading(
  id: string,
  input: SajuInputForm,
  categoryId?: PaidCategoryId,
): SajuReading {
  const { pillars, elements } = analyzeSaju({
    year: input.birthYear,
    month: input.birthMonth,
    day: input.birthDay,
    hour: input.birthHour ?? 0,
    minute: input.birthMinute,
    isLunar: input.isLunar,
    isLeapMonth: input.isLeapMonth,
  });

  return {
    id,
    user_id: "00000000-0000-4000-8000-000000000000",
    name: input.name,
    gender: input.gender as Gender,
    birth_year: input.birthYear,
    birth_month: input.birthMonth,
    birth_day: input.birthDay,
    birth_hour: input.birthHour,
    birth_minute: input.birthMinute,
    is_lunar: input.isLunar,
    is_leap_month: input.isLeapMonth,
    concerns: input.concerns,
    four_pillars: toPlainPillars(pillars),
    five_elements: elements,
    preview_summary: null,
    full_analysis: buildDemoAnalysis(input, pillars, elements, categoryId),
    status: "completed",
    paddle_transaction_id: null,
    pdf_url: null,
    birth_city: "서울",
    birth_longitude: null,
    chat_credits: 3,
    chat_used: 0,
    character_id: (categoryId ? getPaidCategory(categoryId)?.characterId : undefined) ?? "charon_m",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function readDemoReadings(): Record<string, SajuReading> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      window.localStorage.getItem(DEMO_READING_STORAGE_KEY) || "{}",
    ) as Record<string, SajuReading>;
  } catch {
    return {};
  }
}

export function readDemoReading(id: string): SajuReading | null {
  return readDemoReadings()[id] ?? null;
}

export function saveDemoReading(reading: SajuReading) {
  const readings = readDemoReadings();
  readings[reading.id] = reading;
  window.localStorage.setItem(
    DEMO_READING_STORAGE_KEY,
    JSON.stringify(readings),
  );
}
