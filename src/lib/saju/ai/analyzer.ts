import { generateText } from 'ai';
import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  Gender,
  ConcernType,
  SajuAnalysis,
  CompatibilityAnalysis,
} from '@/types/saju';
import {
  buildPreviewPrompt,
  buildSajuAnalysisPrompt,
  buildCompatibilityPrompt,
  buildChapter1Prompt,
  buildChapter2Prompt,
  buildChapter3Prompt,
  buildChapter4Prompt,
  buildChapter5Prompt,
  parseAIResponse,
} from '../prompts';
import { getAnalysisModel } from '@/lib/ai/model';

const model = getAnalysisModel();

/**
 * 무료 미리보기 텍스트를 생성합니다 (150자 이내).
 */
export async function generatePreview(params: {
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  gender: Gender;
}): Promise<string> {
  const { system, user } = buildPreviewPrompt(params);

  const { text } = await generateText({
    model,
    system,
    prompt: user,
    maxOutputTokens: 300,
    temperature: 0.7,
  });

  return text.trim();
}

/**
 * 단일 챕터를 AI로 생성하고 JSON 파싱합니다.
 * 실패 시 null을 반환하여 다른 챕터에 영향을 주지 않습니다.
 */
async function generateChapter<T>(
  system: string,
  user: string,
  maxOutputTokens: number,
  chapterName: string,
): Promise<Partial<T>> {
  try {
    const { text } = await generateText({
      model,
      system,
      prompt: user,
      maxOutputTokens,
      temperature: 0.85,
    });

    // JSON 파싱 — 코드블록 또는 순수 JSON 모두 처리
    const raw = text.trim();
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : raw;

    try {
      return JSON.parse(jsonStr) as Partial<T>;
    } catch {
      // JSON 파싱 실패 시 부분 복구 시도 — 마지막 }를 닫아보기
      const lastBrace = jsonStr.lastIndexOf('}');
      if (lastBrace > 0) {
        try {
          return JSON.parse(jsonStr.slice(0, lastBrace + 1) + '}') as Partial<T>;
        } catch {
          // 복구도 실패
        }
      }
      console.error(`[analyzer] ${chapterName} JSON 파싱 실패`);
      return {};
    }
  } catch (err) {
    console.error(`[analyzer] ${chapterName} 생성 실패:`, err);
    return {};
  }
}

/**
 * 종합 사주분석을 5개의 순차적 AI 호출로 생성합니다.
 * 각 챕터 실패 시 다른 챕터에 영향 없이 진행됩니다.
 */
export async function generateFullAnalysis(params: {
  name: string;
  gender: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  concerns: ConcernType[];
  currentYear: number;
  advancedContext?: string;
}): Promise<SajuAnalysis> {
  const chapterParams = {
    name: params.name,
    gender: params.gender,
    birthYear: params.birthYear,
    birthMonth: params.birthMonth,
    birthDay: params.birthDay,
    birthHour: params.birthHour,
    pillars: params.pillars,
    elements: params.elements,
    concerns: params.concerns,
    currentYear: params.currentYear,
    advancedContext: params.advancedContext,
  };

  // 챕터 1: 총론 + 일간 심층 + 기둥 해설 + 성격 (각 섹션 1800~2600자 → ~14000 tokens)
  const ch1 = buildChapter1Prompt(chapterParams);
  const chapter1 = await generateChapter<SajuAnalysis>(
    ch1.system, ch1.user, 16000, 'Chapter1(overview+personality)',
  );

  // 챕터 2: 오행 심층 + 십신 (각 섹션 1800~2400자 + 십신 10개 × 350자 → ~14000 tokens)
  const ch2 = buildChapter2Prompt(chapterParams);
  const chapter2 = await generateChapter<SajuAnalysis>(
    ch2.system, ch2.user, 16000, 'Chapter2(elements+tenGods)',
  );

  // 챕터 3: 연애·직업·재물·건강·대인관계·학업·자기관리·사회생활 (~14000 tokens)
  const ch3 = buildChapter3Prompt(chapterParams);
  const chapter3 = await generateChapter<SajuAnalysis>(
    ch3.system, ch3.user, 16000, 'Chapter3(life-areas)',
  );

  // 챕터 4: 대운 + 월별 운세 (대운 8개 × 400자 + 월별 12개 × 250자 → ~14000 tokens)
  const ch4 = buildChapter4Prompt(chapterParams);
  const chapter4 = await generateChapter<SajuAnalysis>(
    ch4.system, ch4.user, 16000, 'Chapter4(cycles+monthly)',
  );

  // 챕터 5: 자미두수 + 점성술 + 행운요소 + 조언 + 용어 + 요약 + 맺음말 (~12000 tokens)
  const ch5 = buildChapter5Prompt(chapterParams);
  const chapter5 = await generateChapter<SajuAnalysis>(
    ch5.system, ch5.user, 14000, 'Chapter5(ziwei+summary)',
  );

  // 폴백: 기존 단일 호출 방식 (챕터가 모두 실패했을 때)
  const hasEssential =
    (chapter1.personality || chapter3.personality) &&
    (chapter3.love || chapter1.love) &&
    (chapter4.monthlyFortune && chapter4.monthlyFortune.length > 0) &&
    (chapter5.luckyElements || chapter3.luckyElements);

  let fallbackAnalysis: Partial<SajuAnalysis> = {};
  if (!hasEssential) {
    console.warn('[analyzer] 핵심 챕터 생성 실패 — 단일 호출 폴백 시작');
    try {
      const { system, user } = buildSajuAnalysisPrompt(params);
      const { text } = await generateText({
        model,
        system,
        prompt: user,
        maxOutputTokens: 16000,
        temperature: 0.7,
      });
      fallbackAnalysis = parseAIResponse<SajuAnalysis>(text);
    } catch (err) {
      console.error('[analyzer] 폴백 단일 호출도 실패:', err);
    }
  }

  // 챕터들을 병합 (앞 챕터 우선, 폴백은 최후)
  const merged: SajuAnalysis = {
    // 필수 필드 (기존 호환)
    personality:    chapter1.personality    ?? fallbackAnalysis.personality    ?? '',
    love:           chapter3.love           ?? fallbackAnalysis.love           ?? '',
    career:         chapter3.career         ?? fallbackAnalysis.career         ?? '',
    wealth:         chapter3.wealth         ?? fallbackAnalysis.wealth         ?? '',
    health:         chapter3.health         ?? fallbackAnalysis.health         ?? '',
    yearlyFortune:  chapter4.yearlyFortune  ?? fallbackAnalysis.yearlyFortune  ?? '',
    monthlyFortune: chapter4.monthlyFortune ?? fallbackAnalysis.monthlyFortune ?? [],
    luckyElements:  chapter5.luckyElements  ?? fallbackAnalysis.luckyElements  ?? { color: '', direction: '', number: '' },
    summary:        chapter5.summary        ?? fallbackAnalysis.summary        ?? '',
    tenGods:        chapter2.tenGods        ?? fallbackAnalysis.tenGods,
    majorCycles:    chapter4.majorCycles    ?? fallbackAnalysis.majorCycles,
    relationship:   chapter3.relationship   ?? fallbackAnalysis.relationship,
    actionAdvice:   chapter5.actionAdvice   ?? fallbackAnalysis.actionAdvice,

    // 신규 확장 필드
    overview:         chapter1.overview,
    dayMasterDeep:    chapter1.dayMasterDeep,
    pillarReadings:   chapter1.pillarReadings,
    elementsDeep:     chapter2.elementsDeep,
    tenGodsDetail:    chapter2.tenGodsDetail,
    decadeCycles:     chapter4.decadeCycles,
    selfManagement:   chapter3.selfManagement,
    socialLife:       chapter3.socialLife,
    studyAptitude:    chapter3.studyAptitude,
    ziweiAnalysis:    chapter5.ziweiAnalysis,
    astrologyAnalysis: chapter5.astrologyAnalysis,
    cautionPeriods:   chapter4.cautionPeriods,
    glossary:         chapter5.glossary,
    closingMessage:   chapter5.closingMessage,
  };

  return merged;
}

/**
 * 궁합 분석을 생성합니다.
 */
export async function generateCompatibility(params: {
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
}): Promise<CompatibilityAnalysis> {
  const { system, user } = buildCompatibilityPrompt(params);

  const { text } = await generateText({
    model,
    system,
    prompt: user,
    maxOutputTokens: 2048,
    temperature: 0.7,
  });

  return parseAIResponse<CompatibilityAnalysis>(text);
}
