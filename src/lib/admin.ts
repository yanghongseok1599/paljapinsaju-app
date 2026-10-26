/**
 * 관리자 판정 — ADMIN_EMAILS(쉼표 구분)와 로그인 이메일 비교. 전 파일이 이 함수 하나를 쓴다.
 * 예전엔 파일마다 따로 파싱해 어떤 곳은 공백을 지우고 어떤 곳은 안 지워서,
 * 관리자 화면은 열리는데 채팅은 유료로 처리되는 식의 불일치가 있었다.
 *
 * ⚠️ 이메일 문자열만 본다. Supabase 의 "Confirm email" 이 꺼져 있으면 누가 그 주소로
 *    가입해 관리자가 될 수 있으므로 반드시 켜 둔다.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}
