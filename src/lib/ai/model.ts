/**
 * AI 모델 설정 — OpenAI SDK 직접 연결
 * OPENAI_API_KEY 사용
 */
import { createOpenAI } from "@ai-sdk/openai";
import type { EmbeddingModel, LanguageModel } from "ai";

/** OpenAI SDK 인스턴스 (직접 연결, API 키 사용) */
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

/** SDS 텍스트 생성 기본 모델 */
const DEFAULT_MODEL = "gpt-4o-mini" as const;

/** A/B 테스트용 모델 옵션 */
export const SDS_MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini", cost: "$0.15/$0.60 per 1M" },
  { id: "gpt-4o", label: "GPT-4o", cost: "$2.50/$10.00 per 1M" },
] as const;

export type SdsModelId = (typeof SDS_MODEL_OPTIONS)[number]["id"];

/** 챗봇용 모델 */
export function getChatModel(): LanguageModel {
  return openai(DEFAULT_MODEL);
}

/** 임베딩용 모델 */
export function getEmbeddingModel(): EmbeddingModel {
  return openai.embedding("text-embedding-3-small");
}

/** 분류용 모델 (데이터 인제스트) */
export function getClassificationModel(): LanguageModel {
  return openai(DEFAULT_MODEL);
}

/** 리드 분석용 모델 */
export function getAnalysisModel(): LanguageModel {
  return openai("gpt-4o");
}

/** SDS 텍스트 생성용 모델 (A/B 테스트 지원) */
export function getSdsTextModel(modelId?: SdsModelId): LanguageModel {
  const id = modelId || DEFAULT_MODEL;
  return openai(id);
}
