"use server";

import { randomBytes } from "node:crypto";
import { REFERRAL_REWARD_STARS } from "@/lib/referral/grant";
import { createClient } from "@/utils/supabase/server";

// --- 유틸리티 ---

/**
 * 8자리 암호학적으로 안전한 레퍼럴 코드 생성 (H6: replaced Math.random with crypto)
 * Uses 6 random bytes encoded as base64url, uppercased, truncated to 8 chars.
 */
function generateReferralCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}

// --- Server Actions ---

/**
 * 로그인한 유저의 레퍼럴 코드를 조회하거나, 없으면 새로 생성합니다.
 */
export async function getOrCreateReferralCode(): Promise<{
  data: { code: string } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // 기존 코드 조회
  const { data: existing } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { data: { code: existing.code }, error: null };
  }

  // 새 코드 생성 (중복 시 재시도)
  let retries = 3;
  while (retries > 0) {
    const code = generateReferralCode();

    const { data: created, error } = await supabase
      .from("referral_codes")
      .insert({ user_id: user.id, code })
      .select("code")
      .single();

    if (!error && created) {
      return { data: { code: created.code }, error: null };
    }

    // unique 제약 위반이 아니면 에러 반환
    if (error && !error.message.includes("duplicate")) {
      return { data: null, error: error.message };
    }

    retries--;
  }

  return { data: null, error: "레퍼럴 코드 생성에 실패했습니다. 다시 시도해주세요." };
}

// 초대 보상 지급은 가입 콜백에서 src/lib/referral/grant.ts 가 한다 (서버 액션으로 두지 않는다).

/**
 * 내 초대 현황을 조회합니다.
 */
export async function getReferralStats(): Promise<{
  data: {
    totalInvited: number;
    rewardedCount: number;
    totalRewardStars: number;
  } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // 내가 초대한 사람들 조회
  const { data: referrals, error } = await supabase
    .from("referrals")
    .select("id, status, reward_given")
    .eq("referrer_id", user.id);

  if (error) {
    return { data: null, error: error.message };
  }

  const totalInvited = referrals?.length || 0;
  const rewardedCount =
    referrals?.filter((r) => r.reward_given).length || 0;
  const totalRewardStars = rewardedCount * REFERRAL_REWARD_STARS;

  return {
    data: {
      totalInvited,
      rewardedCount,
      totalRewardStars,
    },
    error: null,
  };
}
