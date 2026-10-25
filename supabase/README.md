# Supabase 옮기기 / 새로 만들기

새 Supabase 프로젝트에 이 앱을 그대로 올리는 방법입니다.
개발 도구 없이 **웹 화면에서만** 할 수 있습니다.

## 1. 프로젝트 만들기

1. [supabase.com](https://supabase.com) → **New project**
2. 지역은 **Northeast Asia (Seoul)** 을 고르세요. 한국 사용자 응답이 빨라집니다.
3. 데이터베이스 비밀번호는 따로 적어두세요.

## 2. 표(테이블) 만들기

왼쪽 메뉴 **SQL Editor** → **New query** 에서, 아래 파일들을 **이 순서대로** 하나씩
붙여넣고 각각 **Run** 을 누르세요.

| 순서 | 파일 | 하는 일 |
|---|---|---|
| 1 | `migrations/20260101000000_init_schema.sql` | 표 9개 생성 + 기본 권한 |
| 2 | `migrations/20260514_atomic_star_ops.sql` | 별 충전·차감 함수 |
| 3 | `migrations/20260514_rls_missing_tables.sql` | 나머지 표 접근 권한 |
| 4 | `migrations/20260514_webhook_events.sql` | 결제 중복 방지용 표 |
| 5 | `migrations/20260524_tarot_readings.sql` | 타로 표 |

> 순서가 중요합니다. 1번이 표를 만들고, 3번이 그 표의 권한을 고치기 때문입니다.
> 순서를 바꾸면 "table does not exist" 오류가 납니다.

이미 돌린 파일을 다시 돌려도 괜찮습니다. 전부 "이미 있으면 건너뛰기"로 되어 있습니다.

## 3. 로그인 설정

**Authentication → Providers** 에서 Google, Kakao를 켜고 각각의 키를 넣습니다.

**Authentication → URL Configuration**
- Site URL: 배포 주소 (예: `https://drsaju.com`)
- Redirect URLs 에 추가: `https://배포주소/auth/callback`

> 이게 빠지면 로그인 버튼을 눌러도 되돌아오지 못합니다.

## 4. 앱에 연결하기

**Project Settings → API** 에서 값 3개를 복사해 배포 환경변수에 넣습니다.

```
NEXT_PUBLIC_SUPABASE_URL=        # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon public
SUPABASE_SERVICE_ROLE_KEY=       # service_role ← 절대 공개 금지
```

`service_role` 키는 모든 권한을 건너뛰는 열쇠입니다. 앞에 `NEXT_PUBLIC_`을
붙이면 브라우저에 노출되니 절대 붙이지 마세요.

## 5. 확인

| 확인할 것 | 방법 |
|---|---|
| 표가 다 생겼나 | Table Editor 에 표 11개가 보이면 정상 |
| 로그인되나 | 가입 후 `users` 표에 줄이 생기는지 확인 |
| 별이 지급되나 | SQL Editor 에서 `select atomic_grant_stars('사용자id', 3, 'bonus', 'test');` |

---

## 기존 프로젝트에서 데이터까지 옮기려면

표만 만드는 게 아니라 **기존 데이터도 가져오려면** 이렇게 합니다.

1. 기존 프로젝트 → **Project Settings → General → 맨 아래 Download backup**
2. 새 프로젝트에 위 1~2단계를 먼저 끝내 표를 만들어 둡니다
3. 백업 파일에서 데이터 부분만 골라 SQL Editor 에 붙여넣습니다

계정(로그인 정보)은 `auth.users` 에 있어서 그대로 옮기기 어렵습니다.
사용자 수가 적다면 **다시 가입받는 편이 안전**하고, 많다면 Supabase 지원팀에
프로젝트 이전(migration)을 요청하는 방법이 있습니다.

---

## 표가 하는 일 (한눈에)

| 표 | 내용 |
|---|---|
| `users` | 가입자의 유입 경로 (로그인 정보는 Supabase가 따로 관리) |
| `saju_readings` | 사주 분석 — 앱의 핵심 |
| `user_stars` | 별 잔액 (사람당 한 줄) |
| `star_transactions` | 별 충전·사용 내역 |
| `saju_chat_messages` | AI 상담 대화 기록 |
| `saju_compatibilities` | 궁합 분석 (상대방 정보) |
| `referral_codes` | 추천인 코드 |
| `referrals` | 누가 누구를 데려왔는지 |
| `analytics_events` | 방문·행동 기록 (관리자 대시보드용) |
| `tarot_readings` | 타로 리딩 |
| `webhook_events` | 결제 중복 처리 방지 |
