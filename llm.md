# AI Coding Agent Guide — 팔자핀사주 (Paljapin Saju)

> **사용법**: AI 코딩 도구(Claude Code, Cursor, Windsurf 등)에 이 파일을 컨텍스트로 전달하세요.
> "이 프로젝트 셋업해줘" 또는 "이 프로젝트 분석해줘"라고 말하면 됩니다.
>
> **For AI Agents**: This is your project configuration. Read it before making any changes.

---

## 프로젝트 개요

**팔자핀사주(Paljapin Saju)** — AI 기반 사주팔자/자미두수/서양점성술 분석 서비스

- 전통 만세력 계산은 TypeScript 코드로, 해석은 Google Gemini AI로 처리
- MIT 라이선스 오픈소스

### 핵심 원칙

```
"계산은 코드, 해석은 AI"
```

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16 |
| 언어 | TypeScript | 5 |
| 인증 + DB | Supabase | - |
| AI | Vercel AI SDK + Google Gemini | ai@6 |
| PDF | @react-pdf/renderer | 4 |
| 결제 | Paddle | - |
| UI | shadcn/ui + Tailwind CSS | 4 |
| 만세력 | manseryeok (MIT) | 1 |
| i18n | next-intl | 4 |
| 상태관리 | Zustand | 5 |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/                # 다국어 라우팅 (ko, en, ja, zh)
│   │   ├── page.tsx             # 랜딩 페이지
│   │   ├── chat/[characterId]/  # AI 캐릭터 채팅
│   │   ├── reading/[id]/        # 사주 분석 결과
│   │   ├── my-readings/         # 내 분석 목록
│   │   ├── coin-shop/           # 코인 상점
│   │   ├── saju-report/         # PDF 리포트
│   │   ├── invite/[code]/       # 초대 링크
│   │   ├── (auth)/login/        # 로그인
│   │   ├── (marketing)/         # 약관, 개인정보보호
│   │   └── refund-policy/       # 환불 정책
│   ├── api/saju/                # 사주 API (8개 엔드포인트)
│   │   ├── analyze/             # AI 종합 분석
│   │   ├── chat/                # AI 채팅
│   │   ├── compatibility/       # 궁합 분석
│   │   ├── pdf/[id]/            # PDF 생성
│   │   ├── preview/             # 미리보기
│   │   ├── suggestions/         # AI 제안
│   │   ├── deduct-stars/        # 별 차감
│   │   └── update-status/       # 상태 업데이트
│   ├── api/webhooks/paddle/     # Paddle 결제 웹훅
│   └── auth/callback/           # OAuth 콜백
├── components/
│   ├── saju/                    # 사주 전용 컴포넌트
│   │   ├── chat/                # 채팅 (ChatRoom, ChatBubble, ChatInput 등)
│   │   ├── input/               # 입력 (BirthDateForm, ConcernSelector 등)
│   │   ├── result/              # 결과 (FullAnalysis, MonthlyFortuneGrid 등)
│   │   ├── landing/             # 랜딩 (Navbar, Footer, FAQ, Testimonials)
│   │   ├── payment/             # 결제 (PaddleCheckout, PaymentSuccess)
│   │   ├── preview/             # 미리보기 (FiveElementChart, PaywallOverlay)
│   │   ├── share/               # 공유 (KakaoShareButton, ShareCard)
│   │   ├── layout/              # 레이아웃 (SajuLayout, MobileLayoutWrapper)
│   │   └── referral/            # 소개 (ReferralSection)
│   ├── ui/                      # shadcn/ui 기본 컴포넌트 (34개)
│   └── shared/                  # 공용 (Header, Footer, ThemeProvider 등)
├── lib/
│   ├── saju/                    # 핵심 사주 엔진
│   │   ├── saju-engine.ts       # 사주팔자 계산 (getFourPillars, calculateSaju 등)
│   │   ├── ziwei.ts             # 자미두수 (createChart, calculateLiunian 등)
│   │   ├── natal.ts             # 서양 점성술 (calculateNatal)
│   │   ├── advanced-analysis.ts # 고급 분석 (세운, 자미두수, 점성술 통합)
│   │   ├── calculator.ts        # 수치 계산 보조
│   │   ├── characters.ts        # 8가지 AI 캐릭터 데이터
│   │   ├── cities.ts            # 도시 DB (진태양시 계산용)
│   │   ├── true-solar-time.ts   # 진태양시 보정
│   │   ├── prompts.ts           # AI 프롬프트 템플릿
│   │   ├── ai/analyzer.ts       # Gemini AI 분석 호출
│   │   ├── pdf/saju-template.tsx # PDF 리포트 템플릿
│   │   └── referral.ts          # 소개 시스템
│   ├── paddle/                  # Paddle 결제 (client, config, webhook)
│   ├── ai/                      # AI 모델 초기화
│   ├── analytics/               # 분석 트래킹
│   ├── discord/                 # Discord 알림
│   └── resend/                  # 이메일 (Resend)
├── services/                    # 서버 액션 (saju, auth, analytics, email, referral)
├── store/saju.ts                # Zustand 상태
├── types/saju.ts                # 핵심 타입 정의
├── utils/supabase/              # Supabase 클라이언트 (client, server, admin)
├── i18n/                        # 국제화 설정
└── middleware.ts                # Next.js 미들웨어

messages/                        # 다국어 메시지 (ko.json, en.json, ja.json, zh.json)
public/characters/               # 캐릭터 이미지 (31개)
public/fonts/                    # NotoSansKR 폰트 (PDF용)
```

---

## 셋업 가이드 (순서대로)

### Step 1: 기본 설치

```bash
git clone https://github.com/imgompanda/drsaju-opensource.git
cd drsaju-opensource
npm install
cp .env.example .env.local
```

### Step 2: Supabase 설정 (필수)

1. https://supabase.com 에서 프로젝트 생성
2. Project URL, anon key, service role key 복사
3. `.env.local`에 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

4. Supabase에서 Google OAuth 설정:
   - Authentication → Providers → Google 활성화
   - Google Cloud Console에서 OAuth 2.0 Client ID 생성
   - Redirect URL: `https://xxxxx.supabase.co/auth/v1/callback`

5. DB 테이블 생성 (Supabase SQL Editor에서 실행):

```sql
-- 사주 분석 결과 테이블
create table saju_readings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  birth_year int not null,
  birth_month int not null,
  birth_day int not null,
  birth_hour int,
  birth_minute int,
  gender text not null,
  city_name text,
  concern_type text,
  status text default 'pending',
  analysis jsonb,
  created_at timestamptz default now()
);

-- 채팅 메시지 테이블
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  reading_id uuid references saju_readings(id),
  character_id text not null,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 사용자 별(크레딧) 테이블
create table user_stars (
  user_id uuid references auth.users(id) primary key,
  balance int default 0,
  updated_at timestamptz default now()
);

-- RLS 활성화
alter table saju_readings enable row level security;
alter table chat_messages enable row level security;
alter table user_stars enable row level security;

-- RLS 정책
create policy "Users can read own readings" on saju_readings for select using (auth.uid() = user_id);
create policy "Users can insert own readings" on saju_readings for insert with check (auth.uid() = user_id);
create policy "Users can update own readings" on saju_readings for update using (auth.uid() = user_id);
create policy "Users can read own messages" on chat_messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on chat_messages for insert with check (auth.uid() = user_id);
create policy "Users can read own stars" on user_stars for select using (auth.uid() = user_id);
create policy "Users can update own stars" on user_stars for update using (auth.uid() = user_id);
```

### Step 3: Google Gemini API 키 (필수)

1. https://aistudio.google.com/apikey 에서 API 키 생성
2. `.env.local`에 입력:

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### Step 4: 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인. 이 단계에서 사주 계산 + AI 분석이 작동합니다.

### Step 5: Paddle 결제 (선택)

결제 기능이 필요한 경우:

1. https://sandbox-vendors.paddle.com 에서 Sandbox 계정 생성
2. 상품/가격 생성 (예: 별 30개 = 9,900원)
3. `.env.local`에 입력:

```env
PADDLE_API_KEY=pdl_sbox_...
PADDLE_WEBHOOK_SECRET=pdl_ntfset_...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_...
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_PRODUCT_STAR_30=pro_...
NEXT_PUBLIC_PADDLE_PRICE_STAR_30=pri_...
```

4. Paddle 웹훅 URL: `https://your-domain.com/api/webhooks/paddle`

### Step 6: 이메일 (선택)

```env
RESEND_API_KEY=re_...
```

### Step 7: 배포

```bash
# Vercel 배포
npx vercel

# 환경변수를 Vercel에도 설정하세요
```

---

## 커스터마이징 가이드

### 캐릭터 수정/추가

파일: `src/lib/saju/characters.ts`

```typescript
// 캐릭터 데이터 구조
{
  id: 'doctor',
  name: '팔자핀사주',
  description: '정통 사주 전문가',
  personality: '...',
  avatarPath: '/characters/doctor.png',
  cardPath: '/characters/doctor-card.png',
}
```

새 캐릭터 추가 시:
1. `characters.ts`에 데이터 추가
2. `public/characters/`에 아바타/카드 이미지 추가
3. `src/types/saju.ts`의 `CharacterType`에 ID 추가

### AI 프롬프트 수정

파일: `src/lib/saju/prompts.ts`

사주 분석의 톤, 깊이, 형식을 조절합니다. AI가 생성하는 분석 내용의 품질에 직접 영향을 줍니다.

### AI 모델 변경

파일: `src/lib/ai/model.ts`

Gemini → GPT-4, Claude 등으로 변경 가능. Vercel AI SDK가 여러 프로바이더를 지원합니다.

```typescript
// Gemini → OpenAI 변경 예시
import { openai } from '@ai-sdk/openai';
export const model = openai('gpt-4o');
```

### 결제 상품 변경

파일: `src/lib/paddle/config.ts`

상품 ID, 가격, 별(크레딧) 수량을 환경변수로 관리합니다.

### 랜딩 페이지 수정

파일: `src/app/[locale]/page.tsx` + `src/components/saju/landing/`

- `SajuNavbar.tsx` — 상단 네비게이션
- `CharacterCards.tsx` — 캐릭터 카드 그리드
- `SajuTestimonials.tsx` — 사용자 후기
- `SajuFAQ.tsx` — FAQ 아코디언
- `SajuFooter.tsx` — 하단 푸터

### PDF 리포트 수정

파일: `src/lib/saju/pdf/saju-template.tsx`

@react-pdf/renderer 기반. 레이아웃, 색상, 섹션 순서 등을 수정합니다.

### 다국어 추가

1. `messages/` 디렉토리에 새 언어 JSON 추가 (예: `vi.json`)
2. `src/i18n/routing.ts`에서 `locales` 배열에 추가
3. 메시지 키를 번역

### 사주 엔진 확장

파일: `src/lib/saju/saju-engine.ts`

주요 함수:
- `calculateSaju(input)` — 메인 사주 계산 (4주, 십신, 12운성, 대운, 오행)
- `getFourPillars(year, month, day, hour, minute)` — 4주 간지 반환
- `getRelation(dayStem, targetStem)` — 십신 관계
- `getTwelveMeteor(stem, branch)` — 12운성
- `getDaewoon(...)` — 대운 계산

자미두수: `src/lib/saju/ziwei.ts`
- `createChart(year, month, day, hour, minute, isMale)` — 명반 생성

서양 점성술: `src/lib/saju/natal.ts`
- `calculateNatal(input)` — 출생 차트

### 사업자 정보 교체

정책 페이지(`refund-policy`, `privacy-policy`, `terms`)에 placeholder가 있습니다:
- "Your Company Name" → 실제 상호명
- "Your Name" → 실제 대표자명
- "your-email@example.com" → 실제 이메일
- "000-00-00000" → 실제 사업자등록번호

---

## 주요 데이터 흐름

### 사주 분석 플로우

```
사용자 입력 (생년월일시, 성별, 고민)
    ↓
saju-engine.ts → calculateSaju() → 4주, 십신, 운성, 대운
    ↓
advanced-analysis.ts → 자미두수 + 점성술 추가 분석
    ↓
prompts.ts → AI 프롬프트 조합
    ↓
ai/analyzer.ts → Gemini API 호출
    ↓
DB 저장 (saju_readings)
    ↓
결과 표시 + PDF 다운로드
```

### 채팅 플로우

```
사용자 메시지
    ↓
api/saju/chat/route.ts → 캐릭터 프롬프트 + 사주 컨텍스트
    ↓
Gemini AI 스트리밍 응답
    ↓
DB 저장 (chat_messages) + 별 차감
```

### 결제 플로우

```
사용자 → PaddleCheckout → Paddle 결제 → 웹훅 → api/webhooks/paddle
    ↓
user_stars 테이블 업데이트 → 별 충전 완료
```

---

## 개발 컨벤션

- **서버 액션**: `src/services/` 하위, zod 검증 사용
- **클라이언트 상태**: Zustand (`src/store/`)
- **API 라우트**: `src/app/api/` (Route Handlers)
- **컴포넌트**: `"use client"` 명시, useTranslations() 사용
- **스타일**: Tailwind CSS 유틸리티 클래스
- **타입**: `src/types/`에 중앙 관리
- **환경변수**: 클라이언트용은 `NEXT_PUBLIC_` 접두사

---

## 트러블슈팅

| 문제 | 해결 |
|------|------|
| 한글 PDF 깨짐 | `public/fonts/`에 NotoSansKR 폰트 확인 |
| AI 분석 안 됨 | `GOOGLE_GENERATIVE_AI_API_KEY` 확인 |
| 로그인 안 됨 | Supabase Google OAuth redirect URL 확인 |
| 결제 웹훅 안 옴 | Paddle 웹훅 URL + `PADDLE_WEBHOOK_SECRET` 확인 |
| 시간 계산 이상 | 진태양시 보정 — `cities.ts`에 도시 경도 확인 |
