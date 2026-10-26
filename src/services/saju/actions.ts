"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { analyzeSaju } from "@/lib/saju/calculator";
import type {
  SajuReading,
  SajuInputForm,
  SajuCompatibility,
  CompatibilityInputForm,
  ReadingStatus,
  Gender,
  ConcernType,
} from "@/types/saju";
import { COMPAT_COST } from "@/types/saju";

// --- Zod Schemas ---

const genderSchema = z.enum(["male", "female"]);

const concernSchema = z.enum([
  "love",
  "career",
  "wealth",
  "health",
  "relationship",
  "other",
]);

const sajuInputSchema = z.object({
  name: z.string().min(1).max(50),
  gender: genderSchema,
  birthYear: z.number().int().min(1900).max(2100),
  birthMonth: z.number().int().min(1).max(12),
  birthDay: z.number().int().min(1).max(31),
  birthHour: z.number().int().min(0).max(23).nullable(),
  birthMinute: z.number().int().min(0).max(59),
  isLunar: z.boolean(),
  isLeapMonth: z.boolean(),
  concerns: z.array(concernSchema).min(1).max(3),
});

const compatibilityInputSchema = z.object({
  readingId: z.string().uuid(),
  partnerName: z.string().min(1).max(50),
  partnerGender: genderSchema,
  partnerBirthYear: z.number().int().min(1900).max(2100),
  partnerBirthMonth: z.number().int().min(1).max(12),
  partnerBirthDay: z.number().int().min(1).max(31),
  partnerBirthHour: z.number().int().min(0).max(23).nullable(),
  partnerBirthMinute: z.number().int().min(0).max(59),
  partnerIsLunar: z.boolean(),
  partnerIsLeapMonth: z.boolean(),
});

// --- Server Actions ---

/**
 * 사주 분석 레코드를 생성하고, 만세력 계산(four_pillars + five_elements)을 저장합니다.
 * status='pending' 으로 생성됩니다.
 */
export async function createReading(
  input: SajuInputForm
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsed = sajuInputSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const form = parsed.data;

  // 만세력 계산
  const { pillars, elements } = analyzeSaju({
    year: form.birthYear,
    month: form.birthMonth,
    day: form.birthDay,
    hour: form.birthHour ?? 0,
    minute: form.birthMinute ?? 0,
    isLunar: form.isLunar,
    isLeapMonth: form.isLeapMonth,
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("saju_readings")
    .insert({
      user_id: user.id,
      name: form.name,
      gender: form.gender,
      birth_year: form.birthYear,
      birth_month: form.birthMonth,
      birth_day: form.birthDay,
      birth_hour: form.birthHour,
      birth_minute: form.birthMinute,
      is_lunar: form.isLunar,
      is_leap_month: form.isLeapMonth,
      concerns: form.concerns,
      four_pillars: pillars,
      five_elements: elements,
    })
    .select("*")
    .single();

  return {
    data: data as SajuReading | null,
    error: error?.message ?? null,
  };
}

/**
 * 사주 정보(생년월일, 이름, 성별 등)를 수정하고 사주를 다시 계산합니다.
 */
export async function updateReadingBirthInfo(
  readingId: string,
  input: {
    name: string;
    gender: 'male' | 'female';
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number | null;
    isLunar: boolean;
    birthCity?: string;
  }
): Promise<{ error: string | null }> {
  const parsedId = z.string().uuid().safeParse(readingId);
  if (!parsedId.success) {
    return { error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { pillars, elements } = analyzeSaju({
    year: input.birthYear,
    month: input.birthMonth,
    day: input.birthDay,
    hour: input.birthHour ?? 0,
    minute: 0,
    isLunar: input.isLunar,
    isLeapMonth: false,
  });

  // 사주 정보 업데이트
  const { error } = await supabase
    .from("saju_readings")
    .update({
      name: input.name,
      gender: input.gender,
      birth_year: input.birthYear,
      birth_month: input.birthMonth,
      birth_day: input.birthDay,
      birth_hour: input.birthHour,
      is_lunar: input.isLunar,
      birth_city: input.birthCity || null,
      four_pillars: pillars,
      five_elements: elements,
      updated_at: new Date().toISOString(),
    })
    .eq("id", readingId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // 기존 채팅 메시지 삭제 (사주 정보가 바뀌면 이전 분석이 무효)
  await supabase
    .from("saju_chat_messages")
    .delete()
    .eq("reading_id", readingId);

  return { error: null };
}

/**
 * ID로 사주 분석 레코드를 조회합니다.
 * 인증된 유저 본인의 레코드만 반환합니다. (C5: ownership check)
 */
export async function getReading(
  id: string
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return { data: null, error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  // Must be authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Add user_id filter — if the reading belongs to a different user, .single() returns null
  const { data, error } = await supabase
    .from("saju_readings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return {
    data: data as SajuReading | null,
    error: error?.message ?? null,
  };
}

/**
 * 사주 분석 레코드의 상태를 업데이트합니다.
 * 추가 데이터(preview_summary, full_analysis, paddle_transaction_id, pdf_url 등)도 함께 업데이트 가능합니다.
 * H3: requires authentication and ownership; validates status enum.
 */
export async function updateReadingStatus(
  id: string,
  status: ReadingStatus,
  data?: Partial<
    Pick<
      SajuReading,
      | "preview_summary"
      | "full_analysis"
      | "paddle_transaction_id"
      | "pdf_url"
    >
  >
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) {
    return { data: null, error: "Invalid reading ID" };
  }

  // Validate status against known enum values (H3)
  const statusSchema = z.enum([
    "pending",
    "preview",
    "paid",
    "generating",
    "completed",
    "failed",
  ]);
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { data: null, error: "Invalid status value" };
  }

  const supabase = await createClient();

  // Ownership check: only the reading owner may update status (H3)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data: existing } = await supabase
    .from("saju_readings")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { data: null, error: "Forbidden" };
  }

  const { data: updated, error } = await supabase
    .from("saju_readings")
    .update({
      status: parsedStatus.data,
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  return {
    data: updated as SajuReading | null,
    error: error?.message ?? null,
  };
}

/**
 * 사주 분석 레코드에 user_id를 연결합니다. (결제 + 로그인 후 호출)
 */
export async function linkReadingToUser(
  readingId: string,
  userId: string
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsedId = z.string().uuid().safeParse(readingId);
  const parsedUserId = z.string().uuid().safeParse(userId);
  if (!parsedId.success || !parsedUserId.success) {
    return { data: null, error: "Invalid ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_readings")
    .update({
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", readingId)
    .select("*")
    .single();

  return {
    data: data as SajuReading | null,
    error: error?.message ?? null,
  };
}

/**
 * 궁합 분석 레코드를 생성합니다.
 */
export async function createCompatibility(
  input: CompatibilityInputForm
): Promise<{ data: SajuCompatibility | null; error: string | null }> {
  const parsed = compatibilityInputSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const form = parsed.data;

  // 파트너 만세력 계산
  const { pillars, elements } = analyzeSaju({
    year: form.partnerBirthYear,
    month: form.partnerBirthMonth,
    day: form.partnerBirthDay,
    hour: form.partnerBirthHour ?? 0,
    minute: form.partnerBirthMinute ?? 0,
    isLunar: form.partnerIsLunar,
    isLeapMonth: form.partnerIsLeapMonth,
  });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_compatibilities")
    .insert({
      reading_id: form.readingId,
      partner_name: form.partnerName,
      partner_gender: form.partnerGender,
      partner_birth_year: form.partnerBirthYear,
      partner_birth_month: form.partnerBirthMonth,
      partner_birth_day: form.partnerBirthDay,
      partner_birth_hour: form.partnerBirthHour,
      partner_birth_minute: form.partnerBirthMinute,
      partner_is_lunar: form.partnerIsLunar,
      partner_is_leap_month: form.partnerIsLeapMonth,
      partner_four_pillars: pillars,
      partner_five_elements: elements,
    })
    .select("*")
    .single();

  return {
    data: data as SajuCompatibility | null,
    error: error?.message ?? null,
  };
}

/**
 * ID로 궁합 분석 레코드를 조회합니다.
 */
export async function getCompatibility(
  id: string
): Promise<{ data: SajuCompatibility | null; error: string | null }> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return { data: null, error: "Invalid compatibility ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_compatibilities")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data: data as SajuCompatibility | null,
    error: error?.message ?? null,
  };
}

/**
 * 사용자의 모든 사주 분석 레코드를 조회합니다.
 */
export async function getUserReadings(
  userId: string
): Promise<{ data: SajuReading[]; error: string | null }> {
  const parsed = z.string().uuid().safeParse(userId);
  if (!parsed.success) {
    return { data: [], error: "Invalid user ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_readings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: (data ?? []) as SajuReading[],
    error: error?.message ?? null,
  };
}

/**
 * 궁합 분석 비용을 별로 차감하고 status를 'paid'로 설정합니다.
 * - 인증 및 소유권 확인 (reading이 현재 유저 소유인지)
 * - 관리자(ADMIN_EMAILS)는 별 차감 없이 바이패스
 * - 원자적 차감: atomic_deduct_stars RPC 사용 (잔액 부족 시 null 반환)
 */
export async function payCompatibilityWithStars(
  compatibilityId: string
): Promise<{ error: string | null }> {
  const parsedId = z.string().uuid().safeParse(compatibilityId);
  if (!parsedId.success) {
    return { error: "Invalid compatibility ID" };
  }

  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 궁합 레코드 조회
  const { data: compat, error: compatError } = await supabase
    .from("saju_compatibilities")
    .select("id, status, reading_id")
    .eq("id", compatibilityId)
    .single();

  if (compatError || !compat) {
    return { error: "궁합 레코드를 찾을 수 없습니다." };
  }

  // 이미 결제된 경우 중복 차감 방지
  if (compat.status === "paid" || compat.status === "completed") {
    return { error: null };
  }

  // 소유권 확인: reading이 현재 유저 소유인지 검증
  const { data: reading, error: readError } = await supabase
    .from("saju_readings")
    .select("user_id")
    .eq("id", compat.reading_id)
    .single();

  if (readError || !reading) {
    return { error: "원본 사주 레코드를 찾을 수 없습니다." };
  }

  if (reading.user_id !== user.id) {
    return { error: "접근 권한이 없습니다." };
  }

  // 관리자 바이패스
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

  // 별 함수와 결제 상태 칸은 서버(service_role)만 쓸 수 있다. 소유권은 위에서 확인했다.
  // 예전엔 이용자 권한으로 상태를 바꾸다 0행 갱신으로 조용히 실패해, 별만 빠지고 결과가 열리지 않았다.
  const admin = createAdminClient();
  if (!isAdmin) {
    // 잔액 확인·차감·사용 내역 기록이 한 번에 일어난다
    const { data: newBalance, error: deductError } = await admin.rpc(
      "atomic_deduct_stars",
      {
        p_user_id: user.id,
        p_amount: COMPAT_COST,
        p_type: "compatibility",
        p_reading_id: compat.reading_id,
      }
    );

    if (deductError || newBalance === null || newBalance === undefined) {
      return { error: `별이 부족합니다. (필요: ${COMPAT_COST}개)` };
    }
  }

  const { error: updateError } = await admin
    .from("saju_compatibilities")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", compatibilityId);

  if (updateError) {
    return { error: "상태 업데이트에 실패했습니다." };
  }

  return { error: null };
}
