# 팔자핀사주 (paljapinsaju-app)

데이터 기반 AI 사주 분석 서비스. Next.js 16 / React 19 / TypeScript / Supabase / next-intl(ko/en/ja/zh) / AI SDK (OpenAI/Google) / Tailwind / Radix UI.

## 핵심 위치

- **실제 헤더:** `src/components/saju/landing/SajuNavbar.tsx` (`src/components/shared/Header.tsx`는 SaaS Kit 잔재, 미사용)
- **레이아웃:** `src/components/saju/layout/SajuLayout.tsx` (server) → `MobileLayoutWrapper.tsx` (client) → `SajuNavbar` + `LoginSidebar`
- **캐릭터 정의:** `src/lib/saju/characters.ts`
- **i18n 메시지:** `messages/{ko,en,ja,zh}.json`
- **라우트 베이스:** `src/app/[locale]/`

## 하네스: 타로 (Tarot)

**목표:** 헤더 메뉴 + 풀 타로 페이지(원카드/쓰리카드/켈틱크로스 10장) + 타로 전용 해석가 캐릭터 + AI 해석 + 별 차감 + codex CLI 기반 이미지 자산 일괄 구축.

**트리거:** 타로 관련 작업 요청(추가/수정/이미지 재생성/QA 등) 시 `tarot-feature-orchestrator` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

**에이전트:** `.claude/agents/` — tarot-product-planner, tarot-ui-architect, tarot-image-gen, tarot-frontend-impl, tarot-backend-impl, tarot-qa (전원 model: opus)

**스킬:** `.claude/skills/` — tarot-spec-writer, paljapin-design-system, nextjs-i18n-route, tarot-ai-integration, codex-image-gen, paljapin-qa-checks, tarot-feature-orchestrator

**작업 디렉토리:** `.claude/_workspace/` (Phase 산출물 보존, 후속 실행 시 재사용)

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-24 | 초기 하네스 구성 (6 agents + 7 skills) | 전체 | 헤더에 타로 메뉴 추가 요청 |
| 2026-05-24 | 타로 기능 1차 구현 (헤더 + 라우트 3개 + 컴포넌트 3개 + API 2개 + 캐릭터 루나 + 마이그레이션 + 이미지 5장) | 전체 | "바로 진행" 승인 |
