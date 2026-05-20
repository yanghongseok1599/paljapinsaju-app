import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  ConcernType,
  Gender,
} from '@/types/saju';
import { extractSajuSummary, getElementStrength } from './calculator';
import { CONCERN_LABELS } from '@/types/saju';
import { stripMarkdownDeep } from './sanitize';

// ─── 사주 분석 프롬프트 ───

/**
 * 종합 사주분석 시스템 프롬프트를 생성합니다.
 */
export function buildSajuAnalysisPrompt(params: {
  name: string;
  gender: Gender;
  birthYear: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number | null;
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  concerns: ConcernType[];
  currentYear: number;
  advancedContext?: string;
}): { system: string; user: string } {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, pillars, elements, concerns, currentYear, advancedContext } =
    params;

  const summary = extractSajuSummary(pillars, elements);
  const strength = getElementStrength(elements);
  const age = currentYear - birthYear + 1; // 한국 나이
  const genderLabel = gender === 'male' ? '남성' : '여성';
  const concernLabels = concerns.map((c) => CONCERN_LABELS[c]).join(', ');

  // 고민에 따른 상세 분석 지시
  const concernInstructions = concerns
    .map((c) => {
      switch (c) {
        case 'love':
          return '- "love": 연애운, 이상형, 결혼 시기, 배우자 성향을 상세히 분석하세요.';
        case 'career':
          return '- "career": 적성, 추천 직업/업종, 승진/이직 시기, 사업운을 상세히 분석하세요.';
        case 'wealth':
          return '- "wealth": 재물운, 돈 관리 성향, 투자 성향, 재물이 들어오는 시기를 상세히 분석하세요.';
        case 'health':
          return '- "health": 취약 장기, 주의할 질병, 건강 관리 방법을 상세히 분석하세요.';
        case 'relationship':
          return '- "love"와 별개로 "personality" 및 각 섹션에서 대인관계, 사회성, 인간관계 패턴을 상세히 분석하세요.';
        case 'other':
          return '- 전체적인 운세를 균형 있게 분석하세요.';
      }
    })
    .join('\n');

  const system = `당신은 30년 경력의 한국 전통 사주명리학 전문가입니다.
주어진 사주 데이터를 바탕으로 정확하고 구체적인 분석을 제공합니다.

## 분석 원칙
1. 사주명리학뿐 아니라, 자미두수(紫微斗數)와 서양 점성술(별자리)의 관점도 통합하여 분석하세요.
2. 사주 데이터(사주팔자, 오행 분포, 일간)를 근거로 분석하세요.
3. 긍정적인 면과 주의할 점을 균형 있게 서술하세요.
4. 추상적인 표현보다 구체적이고 실용적인 조언을 제공하세요.
5. 한국어 존칭을 사용하고, 따뜻하고 격려하는 톤을 유지하세요.
6. 각 섹션은 최소 900자, 최대 1700자로 3~5개의 풍부한 단락으로 구체적이고 실질적인 내용을 담아주세요. 단순 나열이 아니라 깊이 있는 서술이어야 합니다.
7. 미신적 공포감을 주는 표현은 피하세요.
8. 반드시 분석 대상의 이름을 사용하여 호칭하세요 (예: "${name}님"). "남성분", "여성분" 같은 표현은 절대 사용하지 마세요.
9. 월별 운세도 각 월마다 최소 150자 이상 구체적으로 작성하세요. 그 달의 에너지, 주의할 점, 유리한 행동을 포함하세요.
10. 절대 추측하지 마세요. "~가능성이 높다", "~일 수 있다", "~에 해당할 수 있습니다" 같은 불확실한 표현 금지. 제공된 데이터를 기반으로 단정적으로 분석하세요. 별자리, 자미두수 데이터가 제공되면 그것을 정확히 사용하고, 생년월일로부터 직접 확정하세요.
11. 마크다운 금지: **, __, *, _, #, \`\`\`, --- 등 어떤 마크다운 마커도 절대 사용하지 마세요. 강조나 헤딩 표시 없이 순수 한국어 텍스트로만 작성하세요. JSON 문자열 값 안에도 절대 마크다운 마커를 넣지 마세요.

## 고민 분야별 상세 분석 지시
사용자가 관심을 표시한 분야는 다른 섹션보다 2배 이상 상세하게 작성하세요:
${concernInstructions}

## 작성 지침
- "personality" 섹션 첫 문장에 반드시 "${name}님"으로 시작하고, 일주 이름(예: "갑자일주", "임인일주")을 명시하여 일주의 특성을 설명하세요.
- 각 섹션에서 사주 용어(일간, 일주, 편재, 정관, 식신 등)를 자연스럽게 활용하세요.
- 오행 균형/불균형에 따른 구체적인 조언을 포함하세요.
- "tenGods" 섹션에서는 일간 기준 십신(비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인)의 배치를 분석하고 의미를 설명하세요.
- "majorCycles" 섹션에서는 10년 대운 흐름과 현재 대운의 영향, 향후 10-20년 운세 방향을 분석하세요.
- "relationship" 섹션에서는 대인관계 패턴, 사회성, 직장 내 관계, 가족 관계를 상세히 분석하세요.
- "actionAdvice" 섹션에서는 올해 실천하면 좋을 구체적인 조언, 피해야 할 것, 행운을 부르는 습관 등을 실용적으로 안내하세요.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 포함하지 마세요.

\`\`\`json
{
  "personality": "${name}님으로 시작. 일주(日柱) 이름과 특성 설명, 사주명리학 기반 성격 분석, 자미두수 관점의 성격 보완, 별자리 관점의 성격 분석을 포함한 3~5단락 서술. 강점·약점·대인관계 성향까지 구체적으로. (900-1700자)",
  "tenGods": "십신(十神) 배치 분석. 비견/겁재/식신/상관/편재/정재/편관/정관/편인/정인 중 어떤 것이 강하고 약한지, 그것이 삶의 각 영역(직업·재물·관계·건강)에 미치는 구체적 영향. 3~4단락으로 충분히 서술. (900-1500자)",
  "love": "연애/결혼운 분석. 사주명리학 + 자미두수 부부궁 관점. 이상형의 구체적 모습, 결혼 시기·조건, 배우자 성향, 연애 패턴, 주의할 점까지 3~5단락으로 상세히. (900-1700자)",
  "career": "직업/진로 분석. 적성과 재능, 추천 직업·업종(구체적 예시 포함), 승진·이직 유리한 시기, 사업운 여부. 자미두수 관록궁 참고. 3~5단락으로 실용적으로. (900-1700자)",
  "wealth": "재물/금전운 분석. 돈을 버는 방식, 관리 성향, 투자 성향, 재물이 들어오는 시기와 방식, 주의할 금전 습관. 자미두수 재백궁 참고. 3~5단락 상세 서술. (900-1700자)",
  "health": "건강 분석. 취약 장기와 유의할 부위, 주의할 질병·증상, 오행 기반 건강 관리법, 식습관·운동 조언. 자미두수 질액궁 참고. 3~4단락으로 실용적으로. (900-1500자)",
  "relationship": "대인관계·사회운. 직장·사회에서의 관계 패턴, 귀인(도와주는 사람)을 만나는 방법, 주의할 소인배 유형, 가족·친구 관계 특성. 3~4단락으로 구체적으로. (900-1500자)",
  "majorCycles": "대운(大運) 흐름. 현재 대운의 에너지와 특성 상세 분석, 이번 대운이 삶에 미치는 구체적 영향, 향후 10~20년 운세 방향성과 중요 전환점. 3~4단락으로. (900-1500자)",
  "yearlyFortune": "${currentYear}년 올해의 운세. 전반적 에너지 흐름, 상반기와 하반기의 차이, 특히 주의할 달, 기회가 집중되는 시기, 연애·직업·재물 각 분야 올해 흐름. 3~5단락 상세 서술. (900-1700자)",
  "monthlyFortune": [
    { "month": 1, "fortune": "1월 운세 (150자 이상, 그 달의 에너지·주의할 점·유리한 행동 포함)" },
    { "month": 2, "fortune": "2월 운세 (150자 이상)" },
    { "month": 3, "fortune": "3월 운세 (150자 이상)" },
    { "month": 4, "fortune": "4월 운세 (150자 이상)" },
    { "month": 5, "fortune": "5월 운세 (150자 이상)" },
    { "month": 6, "fortune": "6월 운세 (150자 이상)" },
    { "month": 7, "fortune": "7월 운세 (150자 이상)" },
    { "month": 8, "fortune": "8월 운세 (150자 이상)" },
    { "month": 9, "fortune": "9월 운세 (150자 이상)" },
    { "month": 10, "fortune": "10월 운세 (150자 이상)" },
    { "month": 11, "fortune": "11월 운세 (150자 이상)" },
    { "month": 12, "fortune": "12월 운세 (150자 이상)" }
  ],
  "luckyElements": {
    "color": "행운의 색상 (2~3가지, 사주와 오행에 근거한 이유 포함)",
    "direction": "행운의 방향 (사주 근거 이유 포함)",
    "number": "행운의 숫자 (2~3개, 이유 포함)"
  },
  "actionAdvice": "올해의 실천 조언. 반드시 해야 할 구체적 행동 3가지, 반드시 피해야 할 것 3가지, 행운을 부르는 구체적 습관과 방법을 3~4단락으로 상세히. (900-1500자)",
  "summary": "전체 사주를 종합 요약. 이 사람의 타고난 기질, 인생 테마, 올해의 핵심 메시지를 따뜻하고 격려하는 톤으로. (300-500자)"
}
\`\`\``;

  const birthDateStr = birthMonth && birthDay
    ? `${birthYear}년 ${birthMonth}월 ${birthDay}일`
    : `${birthYear}년`;
  const birthTimeStr = birthHour != null
    ? (() => {
        const sijiMap: Record<number, string> = {
          23: '자시(子時)', 0: '자시(子時)', 1: '축시(丑時)', 2: '축시(丑時)',
          3: '인시(寅時)', 4: '인시(寅時)', 5: '묘시(卯時)', 6: '묘시(卯時)',
          7: '진시(辰時)', 8: '진시(辰時)', 9: '사시(巳時)', 10: '사시(巳時)',
          11: '오시(午時)', 12: '오시(午時)', 13: '미시(未時)', 14: '미시(未時)',
          15: '신시(申時)', 16: '신시(申時)', 17: '유시(酉時)', 18: '유시(酉時)',
          19: '술시(戌時)', 20: '술시(戌時)', 21: '해시(亥時)', 22: '해시(亥時)',
        };
        return sijiMap[birthHour] ?? `${birthHour}시`;
      })()
    : '시간 미상';

  const user = `## 분석 대상 정보
- 이름: ${name}
- 성별: ${genderLabel}
- 생년월일: ${birthDateStr} ${birthTimeStr}
- 나이: 만 ${currentYear - birthYear}세, 한국 나이 ${age}세
- 관심 분야: ${concernLabels}

## 사주 데이터
- 사주팔자 (한글): ${summary.fourPillars.korean}
- 사주팔자 (한자): ${summary.fourPillars.hanja}
- 일간 (Day Master): ${summary.dayMaster.stem} (${summary.dayMaster.element})
- 성격 키워드: ${summary.personalityKeywords.join(', ')}

## 오행 분포 (총 8글자)
- 목(木): ${elements.wood}개
- 화(火): ${elements.fire}개
- 토(土): ${elements.earth}개
- 금(金): ${elements.metal}개
- 수(水): ${elements.water}개
- 가장 강한 오행: ${strength.strongest}
- 가장 약한 오행: ${strength.weakest}
- 균형 상태: ${strength.balance}

## 사주 기둥 상세
- 연주: ${summary.fourPillars.detail.year.heavenlyStem}${summary.fourPillars.detail.year.earthlyBranch}
- 월주: ${summary.fourPillars.detail.month.heavenlyStem}${summary.fourPillars.detail.month.earthlyBranch}
- 일주: ${summary.fourPillars.detail.day.heavenlyStem}${summary.fourPillars.detail.day.earthlyBranch}
- 시주: ${summary.fourPillars.detail.hour.heavenlyStem}${summary.fourPillars.detail.hour.earthlyBranch}

${advancedContext ? `## 자미두수 · 별자리 분석 데이터 (계산 완료, 그대로 사용할 것)\n${advancedContext}` : ''}

위 데이터를 바탕으로 ${currentYear}년 종합 사주분석을 JSON으로 작성해주세요. 제공된 데이터는 모두 계산 완료된 확정 값입니다. 추측하지 말고 데이터를 그대로 인용하여 분석하세요.`;

  return { system, user };
}

// ─── 미리보기 프롬프트 (무료, 짧은 요약) ───

/**
 * 무료 미리보기용 짧은 분석 프롬프트를 생성합니다.
 */
export function buildPreviewPrompt(params: {
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  gender: Gender;
}): { system: string; user: string } {
  const { pillars, elements, gender } = params;
  const summary = extractSajuSummary(pillars, elements);
  const genderLabel = gender === 'male' ? '남성' : '여성';

  const system = `당신은 한국 전통 사주명리학 전문가입니다.
주어진 사주 데이터를 바탕으로 핵심 성격과 올해의 운세를 2-3문장으로 매우 간결하게 요약하세요.
흥미를 끌 수 있도록 작성하되, 전체 분석은 유료 서비스에서 확인할 수 있다는 뉘앙스를 담으세요.
순수 텍스트로만 응답하세요 (JSON 아님). 150자 이내.
마크다운 금지: **, __, *, _, #, \`\`\` 등 어떤 마크다운 마커도 사용하지 마세요.`;

  const user = `성별: ${genderLabel}
사주: ${summary.fourPillars.korean}
일간: ${summary.dayMaster.stem} (${summary.dayMaster.element})
오행 밸런스: ${summary.elementStrength.balance}
가장 강한 오행: ${summary.elementStrength.strongest}`;

  return { system, user };
}

// ─── 궁합 분석 프롬프트 ───

/**
 * 궁합 분석 프롬프트를 생성합니다.
 */
export function buildCompatibilityPrompt(params: {
  person1: {
    name: string;
    gender: Gender;
    pillars: FourPillarsDetail;
    elements: FiveElementDistribution;
  };
  person2: {
    name: string;
    gender: Gender;
    pillars: FourPillarsDetail;
    elements: FiveElementDistribution;
  };
}): { system: string; user: string } {
  const { person1, person2 } = params;
  const summary1 = extractSajuSummary(person1.pillars, person1.elements);
  const summary2 = extractSajuSummary(person2.pillars, person2.elements);

  const system = `당신은 30년 경력의 한국 전통 사주명리학 궁합 전문가입니다.
두 사람의 사주 데이터를 바탕으로 궁합을 분석합니다.

## 분석 원칙
1. 일간(日干) 관계, 오행 상생/상극을 기반으로 분석하세요.
2. 긍정적인 면을 먼저 서술하고, 주의할 점도 균형 있게 다루세요.
3. 구체적이고 실용적인 관계 조언을 제공하세요.
4. 점수는 50-95 사이에서 합리적으로 매기세요.
5. 마크다운 금지: **, __, *, _, #, \`\`\` 등 어떤 마크다운 마커도 절대 사용하지 마세요. JSON 문자열 값 안에도 절대 마커를 넣지 마세요.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요.

\`\`\`json
{
  "score": 85,
  "summary": "궁합 종합 요약 (200-300자)",
  "strengths": ["강점 1", "강점 2", "강점 3"],
  "challenges": ["도전 1", "도전 2"],
  "advice": "관계를 더 좋게 만들기 위한 조언 (200-300자)"
}
\`\`\``;

  const user = `## 첫 번째 사람: ${person1.name} (${person1.gender === 'male' ? '남성' : '여성'})
- 사주: ${summary1.fourPillars.korean} (${summary1.fourPillars.hanja})
- 일간: ${summary1.dayMaster.stem} (${summary1.dayMaster.element})
- 오행: 목${person1.elements.wood} 화${person1.elements.fire} 토${person1.elements.earth} 금${person1.elements.metal} 수${person1.elements.water}

## 두 번째 사람: ${person2.name} (${person2.gender === 'male' ? '남성' : '여성'})
- 사주: ${summary2.fourPillars.korean} (${summary2.fourPillars.hanja})
- 일간: ${summary2.dayMaster.stem} (${summary2.dayMaster.element})
- 오행: 목${person2.elements.wood} 화${person2.elements.fire} 토${person2.elements.earth} 금${person2.elements.metal} 수${person2.elements.water}

두 사람의 궁합을 JSON으로 분석해주세요.`;

  return { system, user };
}

// ─── 챕터별 프롬프트 빌더 (다중 호출용) ───────────────────────────────────────

interface ChapterParams {
  name: string;
  gender: Gender;
  birthYear: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number | null;
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  concerns: ConcernType[];
  currentYear: number;
  advancedContext?: string;
}

/** 공통 사주 데이터 블록 (모든 챕터 user 프롬프트에 삽입) */
function buildSajuDataBlock(params: ChapterParams): string {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, pillars, elements, concerns, currentYear, advancedContext } = params;
  const summary = extractSajuSummary(pillars, elements);
  const strength = getElementStrength(elements);
  const age = currentYear - birthYear + 1;
  const genderLabel = gender === 'male' ? '남성' : '여성';
  const concernLabels = concerns.map((c) => CONCERN_LABELS[c]).join(', ');

  const birthDateStr = birthMonth && birthDay
    ? `${birthYear}년 ${birthMonth}월 ${birthDay}일`
    : `${birthYear}년`;
  const sijiMap: Record<number, string> = {
    23: '자시(子時)', 0: '자시(子時)', 1: '축시(丑時)', 2: '축시(丑時)',
    3: '인시(寅時)', 4: '인시(寅時)', 5: '묘시(卯時)', 6: '묘시(卯時)',
    7: '진시(辰時)', 8: '진시(辰時)', 9: '사시(巳時)', 10: '사시(巳時)',
    11: '오시(午時)', 12: '오시(午時)', 13: '미시(未時)', 14: '미시(未時)',
    15: '신시(申時)', 16: '신시(申時)', 17: '유시(酉時)', 18: '유시(酉時)',
    19: '술시(戌時)', 20: '술시(戌時)', 21: '해시(亥時)', 22: '해시(亥時)',
  };
  const birthTimeStr = birthHour != null ? (sijiMap[birthHour] ?? `${birthHour}시`) : '시간 미상';

  return `## 분석 대상 정보
- 이름: ${name}
- 성별: ${genderLabel}
- 생년월일: ${birthDateStr} ${birthTimeStr}
- 나이: 만 ${currentYear - birthYear}세, 한국 나이 ${age}세
- 관심 분야: ${concernLabels}

## 사주 데이터
- 사주팔자 (한글): ${summary.fourPillars.korean}
- 사주팔자 (한자): ${summary.fourPillars.hanja}
- 일간 (Day Master): ${summary.dayMaster.stem} (${summary.dayMaster.element})
- 성격 키워드: ${summary.personalityKeywords.join(', ')}

## 오행 분포 (총 8글자)
- 목(木): ${elements.wood}개 / 화(火): ${elements.fire}개 / 토(土): ${elements.earth}개
- 금(金): ${elements.metal}개 / 수(水): ${elements.water}개
- 가장 강한 오행: ${strength.strongest}
- 가장 약한 오행: ${strength.weakest}
- 균형 상태: ${strength.balance}

## 사주 기둥 상세
- 연주: ${summary.fourPillars.detail.year.heavenlyStem}${summary.fourPillars.detail.year.earthlyBranch}
- 월주: ${summary.fourPillars.detail.month.heavenlyStem}${summary.fourPillars.detail.month.earthlyBranch}
- 일주: ${summary.fourPillars.detail.day.heavenlyStem}${summary.fourPillars.detail.day.earthlyBranch}
- 시주: ${summary.fourPillars.detail.hour.heavenlyStem}${summary.fourPillars.detail.hour.earthlyBranch}

${advancedContext ? `## 자미두수 · 별자리 분석 데이터 (계산 완료, 그대로 사용)\n${advancedContext}` : ''}`;
}

const BASE_SYSTEM = `당신은 30년 경력의 한국 전통 사주명리학 전문가입니다.
주어진 사주 데이터를 바탕으로 정확하고 구체적인 분석을 제공합니다.

분석 원칙:
1. 사주명리학, 자미두수(紫微斗數), 서양 점성술을 통합하여 분석하세요.
2. 긍정적인 면과 주의할 점을 균형 있게 서술하세요.
3. 추상적 표현보다 구체적이고 실용적인 조언을 제공하세요.
4. 한국어 존칭(존댓말)을 사용하고 따뜻하고 격려하는 톤을 유지하세요.
5. 분석 대상의 이름("${'{name}'}님")을 반드시 사용하세요. "남성분" 같은 표현은 금지.
6. 단정적으로 분석하세요. "~일 수 있다", "~가능성이 높다" 등 불확실한 표현 금지.
7. 미신적 공포감을 주는 표현은 피하세요.
8. 반드시 순수 JSON만 응답하세요. 코드블록도 없이, 다른 텍스트 없이 JSON만 출력하세요.
9. 마크다운 금지: **, __, *, _, #, \`\`\`, --- 등 어떤 마크다운 마커도 절대 사용하지 마세요. JSON 문자열 값 안에도 절대 마커를 넣지 마세요. 강조는 한국어 표현으로 표현하세요.

★ 분량 준수 규칙 (매우 중요 — 반드시 지킬 것):
- 각 필드의 지정된 최소 글자 수를 반드시 지켜야 합니다.
- "1800자 이상"이면 실제로 1800자(한글·숫자·부호 모두 포함) 이상이어야 합니다.
- JSON 문자열 내에서 단락을 구분할 때는 \\n\\n (이중 줄바꿈)을 사용하세요.
- 각 단락은 최소 250자 이상으로 작성하세요. 짧은 단락 여러 개보다 긴 단락이 낫습니다.
- 단순 나열이 아닌 깊이 있는 서술: 왜 그런지 이유, 구체적 상황과 예시, 실용 조언까지 포함.
- 예시: "1800자 이상" 항목이면 250~350자짜리 단락 6~7개를 작성해야 합니다.
- 절대 짧게 쓰지 마세요. 이 리포트는 유료 상품이며, 고객은 풍부한 분석을 기대합니다.`;

/** 챕터 1: 총론 + 일간 심층 + 사주팔자 각 기둥 해설 + 성격 */
export function buildChapter1Prompt(params: ChapterParams): { system: string; user: string } {
  const { name } = params;
  const dataBlock = buildSajuDataBlock(params);
  const system = BASE_SYSTEM.replace(/\$\{.name.\}/g, name) + `

이번 챕터에서 분석할 항목: overview, dayMasterDeep, pillarReadings, personality
각 항목은 반드시 지정된 최소 글자수를 충족해야 합니다. 분량이 부족하면 추가 단락을 넣어 보충하세요.`;

  const user = `${dataBlock}

위 사주 데이터를 분석하여 아래 JSON 형식으로만 응답하세요.

{
  "overview": "${name}님의 사주를 총론 관점에서 서술하는 시작 글. 이 사람의 삶의 큰 테마, 타고난 사명, 전체적인 기운의 흐름을 따뜻하게 소개. 오행 구성의 특징과 그것이 인생에 미치는 큰 그림, 현재 대운의 에너지, 이 분석이 안내하는 방향까지 포함하여 5~6단락으로 풍부하게 서술. 1800~2600자. 반드시 ${name}님으로 시작.",
  "dayMasterDeep": "일간(日干) ${params.pillars?.day?.heavenlyStem ?? ''}의 심층 해설. 오행적 의미, 음양, 계절 배속, 성질, 일간으로서 강약 판단, 사주 구조에서의 위치, 용신·기신과의 관계, 일간이 삶의 방향성에 미치는 영향, 이 일간을 가진 사람들의 공통된 인생 패턴까지 포함하여 5~6단락으로 상세히 서술. 1800~2600자.",
  "pillarReadings": {
    "year": "연주(年柱)의 의미 해설. 조상궁, 초년운, 사회적 배경. 이 기둥이 박규희님의 성장 환경과 초년 경험, 가문의 기운에 어떻게 작용하는지 구체적으로 서술. 700자 이상.",
    "month": "월주(月柱)의 의미 해설. 부모궁, 청년기, 직업적 성향. 이 기둥이 직업적 방향과 청년기 도전, 부모와의 관계, 사회 진출에 어떤 영향을 미치는지 구체적으로 서술. 700자 이상.",
    "day": "일주(日柱)의 의미 해설. 배우자궁, 일간의 자리, 성격 핵심. 이 기둥이 배우자 인연, 결혼 생활, 내면의 성격과 자아에 어떤 의미를 갖는지 구체적으로 서술. 700자 이상.",
    "hour": "시주(時柱)의 의미 해설. 자녀궁, 말년운, 내면의 욕망. 이 기둥이 자녀 인연, 말년의 삶, 숨겨진 내면의 욕구와 꿈에 어떤 방향을 제시하는지 구체적으로 서술. 700자 이상."
  },
  "personality": "${name}님으로 시작. 일주 이름과 특성을 명시하고, 사주명리학 기반 성격 분석(강점·약점·대인관계 성향), 자미두수 관점 보완, 별자리 관점 포함. 성격의 밝은 면과 어두운 면, 인생에서 반복되는 패턴, 타인과의 관계에서 나타나는 특징, 잠재력을 끌어내는 방법까지 5~6단락으로 풍부하게. 1800~2600자."
}`;

  return { system, user };
}

/** 챕터 2: 오행 심층 + 십신 기존 + 십신 상세 */
export function buildChapter2Prompt(params: ChapterParams): { system: string; user: string } {
  const { name } = params;
  const dataBlock = buildSajuDataBlock(params);
  const system = BASE_SYSTEM.replace(/\$\{.name.\}/g, name) + `

이번 챕터에서 분석할 항목: elementsDeep, tenGods, tenGodsDetail
각 항목은 반드시 지정된 최소 글자수를 충족해야 합니다.`;

  const user = `${dataBlock}

위 사주 데이터를 분석하여 아래 JSON 형식으로만 응답하세요.

{
  "elementsDeep": "오행(五行) 심층 해설. 목화토금수 각각의 의미와 이 사주에서의 강약, 상생·상극 관계 분석, 용신(用神)과 기신(忌神) 판단, 조후(調候) 분석, 오행 보완을 위한 구체적 실용 조언(색상·방향·음식·생활 등), 각 오행의 과부족이 성격과 운에 미치는 실질적 영향까지 5~6단락으로 상세히. 1800~2400자.",
  "tenGods": "십신(十神) 배치 분석. 이 사주에서 어떤 십신이 강하고 약한지, 각 십신이 직업·재물·연애·관계·건강에 어떻게 구체적으로 작용하는지, 십신의 조합이 만들어내는 독특한 인생 패턴, 일간과 각 십신의 상호작용 분석, 강한 십신을 활용하는 방법과 약한 십신을 보완하는 방법까지 5~6단락으로 상세히. 1800~2400자.",
  "tenGodsDetail": [
    { "name": "비견(比肩)", "description": "이 사주에서 비견의 구체적 배치 위치, 강약 판단, 비견이 성격·인간관계·재물·사업에 미치는 영향, 비견 과다 또는 부족 시 나타나는 특징, 실생활 조언. 350자 이상." },
    { "name": "겁재(劫財)", "description": "이 사주에서 겁재의 배치와 강약, 겁재가 재물·인간관계·경쟁심에 미치는 영향, 겁재의 긍정·부정 측면, 실생활 조언. 350자 이상." },
    { "name": "식신(食神)", "description": "이 사주에서 식신의 배치와 강약, 식신이 직업·표현력·재물·건강·복덕에 미치는 영향, 식신의 활용법. 350자 이상." },
    { "name": "상관(傷官)", "description": "이 사주에서 상관의 배치와 강약, 상관이 재능·언변·관계·반항심에 미치는 영향, 상관의 긍정·부정 측면, 활용 조언. 350자 이상." },
    { "name": "편재(偏財)", "description": "이 사주에서 편재의 배치와 강약, 편재가 투자·사교성·이성 인연·재물에 미치는 영향, 활용 방법. 350자 이상." },
    { "name": "정재(正財)", "description": "이 사주에서 정재의 배치와 강약, 정재가 안정적 재물·성실함·배우자 인연에 미치는 영향, 실용 조언. 350자 이상." },
    { "name": "편관(偏官)", "description": "이 사주에서 편관의 배치와 강약, 편관이 카리스마·도전·스트레스·직업에 미치는 영향, 활용 방법. 350자 이상." },
    { "name": "정관(正官)", "description": "이 사주에서 정관의 배치와 강약, 정관이 규범 준수·명예·직업·배우자에 미치는 영향, 조언. 350자 이상." },
    { "name": "편인(偏印)", "description": "이 사주에서 편인의 배치와 강약, 편인이 직관력·학습·고독·예술에 미치는 영향, 활용 조언. 350자 이상." },
    { "name": "정인(正印)", "description": "이 사주에서 정인의 배치와 강약, 정인이 지혜·포용력·학업운·어머니 인연에 미치는 영향, 조언. 350자 이상." }
  ]
}`;

  return { system, user };
}

/** 챕터 3: 연애·결혼 + 직업·사업 + 재물 + 건강 + 대인관계 + 학업·적성 + 자기관리 + 사회생활 */
export function buildChapter3Prompt(params: ChapterParams): { system: string; user: string } {
  const { name } = params;
  const dataBlock = buildSajuDataBlock(params);
  const system = BASE_SYSTEM.replace(/\$\{.name.\}/g, name) + `

이번 챕터에서 분석할 항목: love, career, wealth, health, relationship, studyAptitude, selfManagement, socialLife
각 항목은 반드시 지정된 최소 글자수를 충족해야 합니다. 분량이 부족하면 추가 단락을 넣어 보충하세요.`;

  const user = `${dataBlock}

위 사주 데이터를 분석하여 아래 JSON 형식으로만 응답하세요. 각 항목은 지정된 최소 글자수를 반드시 충족해야 합니다.

{
  "love": "연애/결혼운. 이상형의 구체적 모습(외모·성격·직업 등), 결혼 시기와 조건, 배우자 성향, 연애 패턴과 반복되는 문제, 이성과의 관계에서 주의할 점, 결혼 후 부부 관계 특성, 자미두수 부부궁 분석, 연애 성공을 위한 실용 조언. 5~6단락으로 상세히. 1800~2500자.",
  "career": "직업/진로. 타고난 적성과 강점, 추천 직업·업종(구체적 예시 5가지 이상), 승진·이직에 유리한 시기와 조건, 사업 적합 여부와 업종, 직장 생활에서의 강점과 약점, 경력 개발 전략, 자미두수 관록궁 분석, 평생 직업운의 흐름. 5~6단락으로 상세히. 1800~2500자.",
  "wealth": "재물/금전운. 돈을 버는 주된 방식, 재물 관리 성향(저축·투자·소비 패턴), 투자 적합 분야와 주의할 분야, 재물이 들어오는 시기와 방식, 재물 손실의 원인과 예방법, 자미두수 재백궁 분석, 평생 재물운 흐름. 5~6단락으로 상세히. 1800~2500자.",
  "health": "건강. 취약 장기와 유의할 신체 부위, 주의해야 할 질병과 증상, 오행 기반 건강 관리법, 추천 식습관과 피해야 할 음식, 맞는 운동 종류와 방법, 정신 건강 관리, 자미두수 질액궁 분석, 계절별 건강 주의사항. 4~5단락으로. 1500~2000자.",
  "relationship": "대인관계·사회운. 직장과 사회에서의 관계 패턴, 친구 관계의 특성, 귀인(도와주는 사람)을 만나는 방법과 시기, 주의해야 할 소인배 유형, 가족 관계의 특성(부모·형제·자녀), 갈등이 생기는 주요 원인과 해결법, 인간관계에서 강점과 약점. 4~5단락으로. 1500~2000자.",
  "studyAptitude": "학업·적성. 타고난 학습 방식과 강점, 가장 잘 맞는 학문 분야, 추천 전공·자격증·기술, 지식을 흡수하고 활용하는 방법, 집중력 향상 방법, 학업 운이 좋은 시기, 평생 학습의 방향성. 3~4단락으로. 1200~1700자.",
  "selfManagement": "자기관리·생활습관. 이 사주에 맞는 건강 루틴, 수면 패턴과 최적 수면 시간, 스트레스가 쌓이는 원인과 효과적 해소법, 에너지를 갉아먹는 나쁜 습관들, 생산성을 높이는 일과 설계, 내면의 성장을 위한 정신적 실천, 하루 루틴 추천. 3~4단락으로. 1200~1700자.",
  "socialLife": "사회생활 심화. 직장 내 처세와 생존 전략, 팀워크 성향과 협업 방식, 리더십 스타일(리더형인지 서포터형인지), 네트워킹을 넓히는 효과적 방법, 조직 내 갈등 해결 패턴, 직장에서 인정받는 방법, 사회적 성공을 위한 핵심 조언. 3~4단락으로. 1200~1700자."
}`;

  return { system, user };
}

/** 챕터 4: 대운 흐름 + 대운 10년 단위 상세 + 연간운 + 주의 시기 + 월별 운세 12개 */
export function buildChapter4Prompt(params: ChapterParams): { system: string; user: string } {
  const { name, currentYear } = params;
  const dataBlock = buildSajuDataBlock(params);
  const system = BASE_SYSTEM.replace(/\$\{.name.\}/g, name) + `

이번 챕터에서 분석할 항목: majorCycles, decadeCycles, yearlyFortune, cautionPeriods, monthlyFortune
각 항목은 반드시 지정된 최소 글자수를 충족해야 합니다.`;

  const user = `${dataBlock}

위 사주 데이터를 분석하여 아래 JSON 형식으로만 응답하세요.

{
  "majorCycles": "대운(大運) 흐름 종합. 현재 대운의 천간·지지 분석과 에너지, 이 대운이 삶의 각 영역(직업·재물·연애·건강)에 미치는 구체적 영향, 향후 10~20년 운세 방향성, 대운 전환점에서의 준비 방법, 대운을 최대한 활용하는 실용 조언. 4~5단락으로. 1500~2000자.",
  "decadeCycles": [
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "이 대운 10년의 천간·지지 의미, 에너지와 특성, 직업·재물·연애·건강 각 분야별 영향, 이 시기에 집중해야 할 것과 주의할 점, 이 대운을 잘 보내기 위한 실용 조언. 400자 이상." },
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "400자 이상." },
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "400자 이상." },
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "400자 이상." },
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "400자 이상." },
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "400자 이상." },
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "400자 이상." },
    { "ageRange": "X세 ~ X세", "stem": "천간한자", "branch": "지지한자", "summary": "400자 이상." }
  ],
  "yearlyFortune": "${currentYear}년 올해의 운세. 연간 에너지 전체 흐름, 상반기와 하반기의 에너지 차이, 특히 주의해야 할 달과 이유, 기회가 집중되는 시기와 활용법, 연애·직업·재물·건강 각 분야의 올해 흐름, 올해 특별히 조심해야 할 것과 적극 나서야 할 것, 연말까지의 전략. 5~6단락으로 상세히. 1800~2500자.",
  "cautionPeriods": "주의 시기 종합. 올해와 향후 수년 내 특히 조심해야 할 시기와 구체적 이유, 각 위험 시기의 대처법과 예방책, 이 시기에 해서는 안 되는 결정들, 반대로 안전하고 길한 시기는 언제인지. 4~5단락으로. 1200~1800자.",
  "monthlyFortune": [
    { "month": 1, "fortune": "1월 운세. 이 달의 전반적 에너지, 직업·재물·연애 각 영역의 흐름, 특히 주의할 사항, 유리한 행동과 시기, 이 달을 잘 보내는 방법. 250자 이상." },
    { "month": 2, "fortune": "2월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 3, "fortune": "3월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 4, "fortune": "4월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 5, "fortune": "5월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 6, "fortune": "6월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 7, "fortune": "7월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 8, "fortune": "8월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 9, "fortune": "9월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 10, "fortune": "10월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 11, "fortune": "11월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 유리한 행동. 250자 이상." },
    { "month": 12, "fortune": "12월 운세. 이 달의 에너지, 각 영역 흐름, 주의사항, 이 달을 마무리하는 방법. 250자 이상." }
  ]
}`;

  return { system, user };
}

/** 챕터 5: 자미두수 심층 + 서양 점성술 + 행운 요소 + 실천 조언 + 용어 풀이 + 종합 요약 + 맺음말 */
export function buildChapter5Prompt(params: ChapterParams): { system: string; user: string } {
  const { name } = params;
  const dataBlock = buildSajuDataBlock(params);
  const system = BASE_SYSTEM.replace(/\$\{.name.\}/g, name) + `

이번 챕터에서 분석할 항목: ziweiAnalysis, astrologyAnalysis, luckyElements, actionAdvice, glossary, summary, closingMessage
각 항목은 반드시 지정된 최소 글자수를 충족해야 합니다.`;

  const user = `${dataBlock}

위 사주 데이터를 분석하여 아래 JSON 형식으로만 응답하세요.

{
  "ziweiAnalysis": "자미두수(紫微斗數) 심층 해설. 명궁(命宮) 주성의 의미와 성격적 특성, 재백궁(재물)·관록궁(직업)·부부궁(배우자)·자녀궁·전택궁의 주요 별 배치와 의미, 각 궁위의 별 조합이 삶에 미치는 실질적 영향, 자미두수 관점에서의 인생 특성과 조언. 4~5단락으로 상세히. 1500~2200자.",
  "astrologyAnalysis": "서양 점성술 관점 해설. 태양 별자리의 기본 특성과 이 사람에게 적용되는 방식, 달 별자리(추정)와 감정 패턴, 주요 행성의 배치 경향과 영향, 성격·운세·연애·직업 관계에서의 점성술적 의미, 이 사람의 인생 과제와 강점을 점성술 관점에서 분석. 4~5단락으로. 1500~2000자.",
  "luckyElements": {
    "color": "행운의 색상 2~3가지 (각각 사주 오행·십신 근거와 활용 방법 포함)",
    "direction": "행운의 방향 (사주 오행·용신 근거와 구체적 활용법 포함)",
    "number": "행운의 숫자 2~3개 (오행·수리학 근거와 활용 시기 포함)"
  },
  "actionAdvice": "올해의 실천 조언. 반드시 해야 할 구체적 행동 5가지(각 이유 포함), 반드시 피해야 할 것 5가지(각 이유 포함), 행운을 부르는 구체적 습관과 방법, 이 사주에 특히 맞는 라이프스타일 조언, 올해 에너지를 최대한 활용하는 전략. 4~5단락으로 상세히. 1500~2200자.",
  "glossary": [
    { "term": "일간(日干)", "meaning": "사주에서 나 자신을 나타내는 천간(天干). 사주 해석의 기준점이 되며, 일간의 오행적 성질이 타고난 성격과 인생 방향을 결정한다." },
    { "term": "사주팔자(四柱八字)", "meaning": "태어난 연·월·일·시를 나타내는 네 기둥(四柱)과 여덟 글자(八字). 이 여덟 글자가 한 사람의 타고난 기운과 인생 흐름을 담고 있다." },
    { "term": "오행(五行)", "meaning": "목(木)·화(火)·토(土)·금(金)·수(水) 다섯 가지 기운. 자연의 모든 현상과 인간의 성격·운명을 이 다섯 가지 요소의 상호작용으로 설명한다." },
    { "term": "천간(天干)", "meaning": "갑·을·병·정·무·기·경·신·임·계의 열 가지 하늘의 기운. 각각 음양과 오행을 갖고 있으며 사주팔자의 위쪽 네 글자를 구성한다." },
    { "term": "지지(地支)", "meaning": "자·축·인·묘·진·사·오·미·신·유·술·해의 열두 가지 땅의 기운. 사주팔자의 아래쪽 네 글자이며, 숨은 천간(지장간)을 품고 있다." },
    { "term": "대운(大運)", "meaning": "10년 단위로 바뀌는 큰 운의 흐름. 사주팔자가 씨앗이라면 대운은 그 씨앗이 자라는 환경이다. 어떤 대운을 만나느냐에 따라 삶의 흐름이 크게 달라진다." },
    { "term": "십신(十神)", "meaning": "일간을 기준으로 나머지 글자와의 관계를 나타내는 열 가지 신. 비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인으로 구성된다." },
    { "term": "용신(用神)", "meaning": "사주의 균형을 맞추어 주는 핵심 오행. 사주에서 부족한 오행을 보충하거나 강한 오행을 억제하여 전체적인 조화를 이끄는 기운이다." },
    { "term": "상생(相生)", "meaning": "오행 간 서로 도와주는 관계. 목생화(나무가 불을 키움), 화생토(불이 흙을 만듦), 토생금(흙에서 금이 남), 금생수(금이 물을 만듦), 수생목(물이 나무를 키움)." },
    { "term": "상극(相剋)", "meaning": "오행 간 서로 억제하는 관계. 목극토·토극수·수극화·화극금·금극목의 순서로 이루어진다. 상극은 반드시 나쁜 것이 아니라 균형과 조절의 역할을 한다." },
    { "term": "일주(日柱)", "meaning": "태어난 날의 천간과 지지. 사주에서 가장 중요한 기둥으로, 일주가 무엇이냐에 따라 성격의 핵심과 배우자 인연이 결정된다. 60가지 종류가 있다." },
    { "term": "자미두수(紫微斗數)", "meaning": "별의 위치를 기반으로 운명을 해석하는 동양 명리학 체계. 명궁(命宮)을 중심으로 12개 궁위에 별들을 배치하여 인생의 각 영역을 분석한다." },
    { "term": "세운(歲運)", "meaning": "1년 단위로 바뀌는 연간 운세. 대운이라는 큰 흐름 안에서 매년 달라지는 에너지로, 그해의 유리·불리한 시기와 주의사항을 분석하는 데 사용한다." },
    { "term": "조후(調候)", "meaning": "사주에서 기후적 균형을 맞추는 오행. 추운 사주에는 따뜻한 오행(화·목)이 필요하고, 뜨거운 사주에는 차가운 오행(수·금)이 필요하다는 이론이다." }
  ],
  "summary": "전체 사주 종합 요약. 이 사람의 타고난 기질과 인생 테마를 한 단락으로, 강점과 주의사항을 한 단락으로, 올해의 핵심 메시지와 앞으로의 방향을 한 단락으로. 따뜻하고 격려하는 톤으로 3단락. 600~900자.",
  "closingMessage": "${name}님께 보내는 따뜻한 맺음말. 이 리포트를 통해 느꼈으면 하는 메시지, 사주 분석의 진정한 의미(운명을 아는 것이 삶을 더 현명하게 살기 위함임), 앞으로의 여정에 대한 응원과 희망의 말. 3단락. 600~900자."
}`;

  return { system, user };
}

// ─── AI 응답 파싱 유틸 ───

/**
 * AI 응답에서 JSON을 추출합니다.
 * 코드블록(```json ... ```) 안의 JSON이나 순수 JSON 모두 처리합니다.
 */
export function parseAIResponse<T>(response: string): T {
  // 코드블록에서 JSON 추출
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : response.trim();

  try {
    const parsed = JSON.parse(jsonStr) as T;
    // 모델이 지시를 어기고 ** 마커를 남기는 경우를 대비한 방어층.
    return stripMarkdownDeep(parsed);
  } catch (error) {
    throw new Error(
      `AI 응답 JSON 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    );
  }
}
