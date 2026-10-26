import { createAdminClient } from "@/utils/supabase/admin";

/** 초대한 사람·초대받은 사람 각각 받는 별 (ReferralSection 안내 문구와 같아야 한다) */
export const REFERRAL_REWARD_STARS = 1;

/**
 * 신규 가입자의 초대 보상을 지급한다. 가입 콜백에서 방금 가입한 사용자 id 로 부른다.
 *
 * 서버 액션("use server")이 아니라 일반 서버 모듈이다. 액션으로 두면 브라우저가 임의의
 * 사용자 id 를 넣어 부를 수 있다.
 *
 * 예전 구현은 이용자 권한으로 남의 초대 코드를 조회해 RLS(본인 코드만 조회)에 막혔고,
 * 그래서 "친구를 초대하면 별 1개" 보상이 한 번도 지급되지 않았다.
 * 같은 사람이 두 번 보상받지 않는 것은 referrals.referred_id 의 unique 제약이 보장한다.
 */
export async function grantReferralReward(referredUserId: string, rawCode: string): Promise<void> {
  const code = rawCode.trim().toUpperCase();
  if (code.length < 6 || code.length > 10) return;

  const admin = createAdminClient();

  const { data: codeData } = await admin
    .from("referral_codes")
    .select("id, user_id")
    .eq("code", code)
    .maybeSingle();

  // 없는 코드이거나 자기 자신을 초대한 경우
  if (!codeData || codeData.user_id === referredUserId) return;

  const { error: insertError } = await admin.from("referrals").insert({
    referrer_id: codeData.user_id,
    referred_id: referredUserId,
    referral_code_id: codeData.id,
    status: "completed",
    reward_given: true,
  });

  // 23505 = 이미 초대 보상을 받은 가입자 → 다시 주지 않는다
  if (insertError) {
    if (insertError.code !== "23505") console.error("[referral] 초대 기록 실패:", insertError.message);
    return;
  }

  for (const userId of [referredUserId, codeData.user_id]) {
    await admin.rpc("atomic_grant_stars", {
      p_user_id: userId,
      p_amount: REFERRAL_REWARD_STARS,
      p_source: "referral",
      p_reference: `referral:${referredUserId}`,
    });
  }
}
