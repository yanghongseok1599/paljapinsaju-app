<h1 align="center">팔자핀사주 (Paljapin Saju)</h1>

<p align="center">
  <strong>AI 기반 사주팔자 분석 서비스 | AI-Powered Four Pillars of Destiny Analysis</strong>
</p>

<p align="center">
  <a href="#한국어">한국어</a> |
  <a href="#english">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/AI-OpenAI%20GPT--4o-412991?logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</p>

---

# 한국어

## 소개

**팔자핀사주(Paljapin Saju)** 는 전통 동양 점술인 **사주팔자(四柱八字)** 를 현대 AI 기술과 결합한 오픈소스 프로젝트입니다.

> "계산은 코드, 해석은 AI"

만세력 계산은 TypeScript 코드로 정확하게 처리하고, 사주 해석은 OpenAI GPT-4o AI가 담당합니다. 생년월일시를 입력하면 사주팔자를 계산하고, AI가 종합적인 운세 분석을 제공하며, 아름다운 PDF 리포트로 다운로드할 수 있습니다.

## 주요 기능

- **사주팔자 계산 엔진** - 만세력(manseryeok) 라이브러리 기반의 정확한 사주 계산
- **진태양시(True Solar Time) 보정** - 출생지 경도에 따른 정확한 시간 보정
- **AI 종합 분석** - 종합운, 성격, 적성, 재물운, 건강운, 연애운, 월별 운세
- **궁합 분석** - 두 사람의 사주를 비교하여 궁합 분석
- **캐릭터 기반 AI 채팅** - 8가지 개성 있는 캐릭터와 사주 상담
- **PDF 리포트** - @react-pdf/renderer를 활용한 고품질 PDF 생성 및 다운로드
- **카카오톡 공유** - 분석 결과를 카카오톡으로 간편 공유
- **다국어 지원** - 한국어, 영어, 일본어, 중국어

## 스크린샷

<!-- 스크린샷 추가 예정 -->

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 인증 + DB | Supabase (Auth + PostgreSQL) |
| AI | Vercel AI SDK + OpenAI GPT-4o / GPT-4o-mini |
| PDF 생성 | @react-pdf/renderer |
| 결제 | Paddle |
| UI | shadcn/ui + Tailwind CSS 4 |
| 만세력 | manseryeok |
| 국제화 | next-intl (ko, en, ja, zh) |

## 시작하기

### AI 코딩 도구로 셋업하기 (추천)

Claude Code, Cursor, Windsurf 등 AI 코딩 도구를 사용한다면 [`llm.md`](llm.md)를 컨텍스트로 전달하세요. 프로젝트 구조, 셋업 순서, 커스터마이징 방법이 모두 정리되어 있습니다.

```
# Claude Code에서
cat llm.md  # 자동으로 컨텍스트에 포함됩니다

# Cursor/Windsurf에서
# llm.md 파일을 열고 "이 프로젝트 셋업해줘"라고 말하세요
```

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- Supabase 프로젝트
- OpenAI API 키

### 설치

```bash
git clone https://github.com/imgompanda/drsaju-opensource.git
cd drsaju-opensource
npm install
cp .env.example .env.local
# .env.local에 필요한 환경변수를 설정하세요
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 환경변수

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | O | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | O | Supabase 서비스 역할 키 |
| `OPENAI_API_KEY` | O | OpenAI API 키 |
| `PADDLE_API_KEY` | - | Paddle 서버 API 키 |
| `PADDLE_WEBHOOK_SECRET` | - | Paddle 웹훅 시크릿 |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | - | Paddle 클라이언트 토큰 |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | - | Paddle 환경 (`sandbox` / `production`) |
| `RESEND_API_KEY` | - | Resend 이메일 API 키 |
| `NEXT_PUBLIC_APP_URL` | O | 앱 기본 URL (`http://localhost:3000`) |
| `ADMIN_EMAILS` | - | 관리자 이메일 (콤마 구분) |
| `DISCORD_PAYMENTS_WEBHOOK_URL` | - | Discord 결제 알림 웹훅 URL |

## 프로젝트 구조

```
drsaju-opensource/
├── src/
│   ├── app/
│   │   ├── [locale]/           # 다국어 라우팅
│   │   │   ├── chat/           # AI 캐릭터 채팅
│   │   │   ├── coin-shop/      # 코인 상점
│   │   │   ├── reading/        # 사주 분석 결과
│   │   │   ├── my-readings/    # 내 분석 목록
│   │   │   ├── saju-report/    # PDF 리포트
│   │   │   └── page.tsx        # 랜딩 페이지
│   │   └── api/                # API 라우트
│   ├── components/             # UI 컴포넌트
│   ├── lib/                    # 핵심 라이브러리 (만세력, AI 등)
│   ├── services/               # 서버 액션 & 비즈니스 로직
│   ├── store/                  # 클라이언트 상태 관리
│   ├── types/                  # TypeScript 타입 정의
│   ├── utils/                  # 유틸리티 함수
│   ├── i18n/                   # 국제화 설정
│   └── middleware.ts           # Next.js 미들웨어
├── messages/                   # 다국어 메시지 (ko, en, ja, zh)
├── public/                     # 정적 파일
├── supabase/                   # Supabase 마이그레이션
└── package.json
```

## 만든 사람

이 프로젝트는 [FreAiner](https://fireship.me?utm_source=github&utm_medium=readme&utm_campaign=drsaju)가 만들었습니다.

1년간 Claude Code로 AI 서비스 40개를 만들고, 그 중 3개를 수익화한 1인 개발자입니다.

### 수익화 바이브 코딩 부트캠프

> **5일 만에 AI 서비스 기획부터 배포까지** — 만드는 것뿐 아니라 수익화까지

| 날짜 | 내용 |
|------|------|
| Day 1 (월) | Claude Code 세팅 + AI SDK + MCP 활용 |
| Day 2 (화) | AI 이미지 생성 서비스, RAG 챗봇 구축 실습 |
| Day 3 (수) | 결제 연동 + 수익화 + 레딧 수요조사 + 아이디어 확정 |
| Day 4 (목) | 내 서비스 만들기 + 1:1 코칭 |
| Day 5 (금) | 완성 + 배포 + 런칭 준비 |

- 40개 서비스를 만들며 다듬은 **보일러플레이트 평생 제공** + 업데이트
- 기수별 단톡방 + **수료생 전용 커뮤니티** (전 기수 통합)
- S전자 강의 수강생 만족도 **4.8점** · 누적 수강생 **200명+** · **10명 한정** 소수 정예

**[부트캠프 자세히 보기 →](https://fireship.me/ko/bootcamp?utm_source=github&utm_medium=readme&utm_campaign=drsaju)**

### Claude Code 자동화 플러그인: fireauto

이 프로젝트를 만들 때 사용한 Claude Code 플러그인도 오픈소스로 공개되어 있습니다.

```bash
/plugin marketplace add imgompanda/fireauto
/plugin install fireauto@fireauto
```

SEO 점검, 보안 감사, AI 팀 병렬 작업, UI 빌더 등 서비스 개발에 필요한 자동화 도구 모음입니다.

**[fireauto 보러 가기 →](https://github.com/imgompanda/fireauto)**

---

## 기여하기

기여를 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

## 라이선스

이 프로젝트는 **MIT 라이선스**를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

**쉽게 말하면:**
- 누구나 자유롭게 사용, 수정, 배포할 수 있습니다
- 상업적 사용도 가능합니다
- 코드를 사용할 때 원본 저작권 표시와 라이선스 문구만 포함하면 됩니다
- 이 소프트웨어로 인한 문제에 대해 저작자는 책임지지 않습니다

---

# English

## Introduction

**Paljapin Saju** is an open-source project that combines the traditional Eastern divination system **Saju Palja (Four Pillars of Destiny / 四柱八字)** with modern AI technology.

> "Calculation by code, interpretation by AI"

The Manseryeok (Ten Thousand Year Calendar) calculations are handled precisely by TypeScript code, while Saju interpretations are powered by OpenAI GPT-4o AI. Enter your birth date and time, and the system calculates your Four Pillars, provides comprehensive fortune analysis via AI, and generates a beautifully formatted PDF report for download.

## Key Features

- **Four Pillars Calculation Engine** - Accurate Saju calculation based on the manseryeok library
- **True Solar Time Correction** - Precise time adjustment based on birth location longitude
- **Comprehensive AI Analysis** - Overall fortune, personality, career aptitude, wealth, health, love, monthly forecasts
- **Compatibility Analysis** - Compare two people's Saju for relationship compatibility
- **Character-Based AI Chat** - Consult with 8 unique AI characters about your Saju
- **PDF Reports** - High-quality PDF generation and download via @react-pdf/renderer
- **KakaoTalk Sharing** - Easily share analysis results via KakaoTalk
- **Multilingual Support** - Korean, English, Japanese, Chinese

## Screenshots

<!-- Screenshots coming soon -->

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth + DB | Supabase (Auth + PostgreSQL) |
| AI | Vercel AI SDK + OpenAI GPT-4o / GPT-4o-mini |
| PDF Generation | @react-pdf/renderer |
| Payments | Paddle |
| UI | shadcn/ui + Tailwind CSS 4 |
| Calendar Engine | manseryeok |
| i18n | next-intl (ko, en, ja, zh) |

## Getting Started

### Setup with AI Coding Tools (Recommended)

If you're using Claude Code, Cursor, Windsurf, or similar AI coding tools, pass [`llm.md`](llm.md) as context. It contains the full project structure, setup steps, and customization guide.

```
# In Claude Code — llm.md is automatically included in context

# In Cursor/Windsurf — open llm.md and say "Set up this project"
```

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- OpenAI API key

### Installation

```bash
git clone https://github.com/imgompanda/drsaju-opensource.git
cd drsaju-opensource
npm install
cp .env.example .env.local
# Configure the required environment variables in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `PADDLE_API_KEY` | No | Paddle server API key |
| `PADDLE_WEBHOOK_SECRET` | No | Paddle webhook secret |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | No | Paddle client token |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | No | Paddle environment (`sandbox` / `production`) |
| `RESEND_API_KEY` | No | Resend email API key |
| `NEXT_PUBLIC_APP_URL` | Yes | App base URL (`http://localhost:3000`) |
| `ADMIN_EMAILS` | No | Admin emails (comma-separated) |
| `DISCORD_PAYMENTS_WEBHOOK_URL` | No | Discord payment notification webhook URL |

## Project Structure

```
drsaju-opensource/
├── src/
│   ├── app/
│   │   ├── [locale]/           # i18n routing
│   │   │   ├── chat/           # AI character chat
│   │   │   ├── coin-shop/      # Coin shop
│   │   │   ├── reading/        # Saju analysis results
│   │   │   ├── my-readings/    # My readings list
│   │   │   ├── saju-report/    # PDF report
│   │   │   └── page.tsx        # Landing page
│   │   └── api/                # API routes
│   ├── components/             # UI components
│   ├── lib/                    # Core libraries (manseryeok, AI, etc.)
│   ├── services/               # Server actions & business logic
│   ├── store/                  # Client state management
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── i18n/                   # i18n configuration
│   └── middleware.ts           # Next.js middleware
├── messages/                   # i18n messages (ko, en, ja, zh)
├── public/                     # Static files
├── supabase/                   # Supabase migrations
└── package.json
```

## About the Author

This project is built by [FreAiner](https://fireship.me?utm_source=github&utm_medium=readme&utm_campaign=drsaju), a solo developer who built 40+ AI services with Claude Code over the past year and monetized 3 of them.

### Vibe Coding Bootcamp (Korean)

> **Build and monetize an AI service in 5 days** — From ideation to deployment and revenue

- **4.8/5** satisfaction score from Samsung Electronics training
- **200+** cumulative students · **10-person** small group format
- Includes battle-tested boilerplate, community access, and 1:1 coaching

**[Learn more →](https://fireship.me/ko/bootcamp?utm_source=github&utm_medium=readme&utm_campaign=drsaju)**

### Claude Code Automation Plugin: fireauto

The automation plugin used to build this project is also open source.

```bash
/plugin marketplace add imgompanda/fireauto
/plugin install fireauto@fireauto
```

**[Check out fireauto →](https://github.com/imgompanda/fireauto)**

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [MIT License](LICENSE).

**In plain terms:**
- Anyone can freely use, modify, and distribute this code
- Commercial use is allowed
- Just include the original copyright notice and license text when using the code
- The authors are not liable for any issues arising from this software

## Credits

This project is made possible thanks to the following open-source projects:

- [manseryeok](https://github.com/nicekid1/manseryeok) - Korean traditional calendar (Manseryeok) calculation library
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI integration framework
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [@react-pdf/renderer](https://react-pdf.org/) - PDF generation for React
- [next-intl](https://next-intl-docs.vercel.app/) - Internationalization for Next.js
- [Paddle](https://www.paddle.com/) - Payment platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
