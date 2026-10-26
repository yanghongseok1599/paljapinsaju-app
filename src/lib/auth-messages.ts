/**
 * Supabase 인증 오류 → 이용자에게 보여줄 한국어 문구.
 *
 * 규칙 두 가지 (OWASP Authentication / Forgot Password Cheat Sheet):
 *  1. 계정이 있는지 없는지 문구로 드러내지 않는다.
 *     "이미 가입된 이메일입니다" 는 그 자체로 회원 명단 조회 기능이 된다.
 *  2. Supabase 원문 메시지를 절대 그대로 보여주지 않는다. 내부 구조가 새고 영어가 섞인다.
 *     조사한 7개 프로젝트 중 5개가 원문을 노출하고 있었다.
 *
 * 코드(error.code)를 우선 보고, 없을 때만 메시지 문자열로 판정한다.
 */
type AuthErrorLike = { code?: string; message?: string; status?: number } | null | undefined;

export const AUTH_COPY = {
  loginFailed: "이메일 또는 비밀번호가 올바르지 않습니다.",
  // 가입·재설정은 계정 존재 여부와 무관하게 같은 문구를 쓴다.
  signupSent: "입력하신 주소로 확인 메일을 보냈습니다. 메일의 버튼을 눌러 가입을 마쳐주세요.",
  resetSent: "가입된 이메일이라면 비밀번호 재설정 메일이 발송됩니다. 메일함을 확인해주세요.",
  rateLimited: "요청이 많습니다. 잠시 후 다시 시도해주세요.",
  network: "연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.",
  weakPassword: "더 길거나 흔하지 않은 비밀번호를 입력해주세요.",
  samePassword: "현재 비밀번호와 다른 비밀번호를 입력해주세요.",
  currentPasswordWrong: "현재 비밀번호가 올바르지 않습니다.",
  reauthNeeded: "보안을 위해 다시 로그인한 뒤 진행해주세요.",
  linkExpired: "링크가 만료되었거나 이미 사용되었습니다. 다시 요청해주세요.",
  generic: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
} as const;

export function loginErrorMessage(error: AuthErrorLike): string {
  if (!error) return AUTH_COPY.generic;
  if (error.status === 429 || error.code === "over_request_rate_limit") return AUTH_COPY.rateLimited;
  if (isNetwork(error)) return AUTH_COPY.network;
  // invalid_credentials 와 email_not_confirmed 를 같은 문구로 묶는다.
  // 미인증 안내를 따로 띄우면 "그 이메일로 가입한 사람이 있다"는 사실이 새어 나간다.
  return AUTH_COPY.loginFailed;
}

export function passwordErrorMessage(error: AuthErrorLike): string {
  if (!error) return AUTH_COPY.generic;
  if (error.status === 429) return AUTH_COPY.rateLimited;
  switch (error.code) {
    case "weak_password": return AUTH_COPY.weakPassword;
    case "same_password": return AUTH_COPY.samePassword;
    case "invalid_credentials": return AUTH_COPY.currentPasswordWrong;
    case "reauthentication_needed":
    case "reauthentication_not_valid": return AUTH_COPY.reauthNeeded;
    case "otp_expired":
    case "flow_state_expired": return AUTH_COPY.linkExpired;
  }
  return isNetwork(error) ? AUTH_COPY.network : AUTH_COPY.generic;
}

function isNetwork(error: NonNullable<AuthErrorLike>): boolean {
  return /fetch|network|timeout/i.test(error.message ?? "");
}
