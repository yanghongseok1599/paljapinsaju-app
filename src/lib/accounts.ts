/**
 * 회원 기능(로그인·상담사 채팅·타로·별자리·궁합·마이페이지) 사용 여부.
 *
 * Supabase 가 설정돼 있을 때만 켜진다. 첫 출시는 DB 없이 "무료 체험 → 마일스톤 결제" 하나로 판다
 * (2026-10-27 결정). 꺼져 있으면 계정이 필요한 화면은 proxy 가 홈·무료 체험으로 보내고, 메뉴에서도 숨긴다.
 * NEXT_PUBLIC_ 값이라 빌드 때 정해지고 서버와 브라우저가 같은 값을 본다.
 */
export const ACCOUNTS_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
