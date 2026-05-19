# 기여 가이드 (Contributing Guide)

팔자핀사주(Paljapin Saju) 프로젝트에 관심을 가져주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 목차

- [이슈 등록](#이슈-등록)
- [PR 제출 방법](#pr-제출-방법)
- [개발 환경 설정](#개발-환경-설정)
- [코드 스타일](#코드-스타일)
- [커밋 메시지 컨벤션](#커밋-메시지-컨벤션)

---

## 이슈 등록

버그를 발견하거나 새로운 기능을 제안하고 싶다면 GitHub Issues를 활용해주세요.

### 버그 리포트

버그를 신고할 때는 다음 정보를 포함해주세요:

1. **문제 설명** - 무엇이 잘못되었는지 간결하게 설명
2. **재현 방법** - 문제를 재현하는 단계별 방법
3. **기대 동작** - 정상적으로 동작했을 때 어떤 결과가 나와야 하는지
4. **실제 동작** - 실제로 어떤 결과가 나왔는지
5. **환경 정보** - OS, 브라우저, Node.js 버전 등
6. **스크린샷** - 가능하다면 스크린샷 첨부

### 기능 제안

새로운 기능을 제안할 때는 다음을 포함해주세요:

1. **기능 설명** - 어떤 기능인지 상세히 설명
2. **사용 사례** - 이 기능이 어떤 상황에서 필요한지
3. **구현 아이디어** - (선택) 어떻게 구현할 수 있을지

---

## PR 제출 방법

### 1. Fork & Clone

```bash
# 저장소를 Fork한 후 Clone
git clone https://github.com/your-username/drsaju-opensource.git
cd drsaju-opensource
```

### 2. 브랜치 생성

```bash
# main 브랜치에서 새 브랜치 생성
git checkout -b feature/your-feature-name
```

브랜치 네이밍 규칙:
- `feature/기능명` - 새로운 기능
- `fix/버그명` - 버그 수정
- `docs/문서명` - 문서 수정
- `refactor/대상` - 리팩토링
- `chore/작업명` - 기타 작업

### 3. 개발 & 커밋

```bash
# 변경사항 커밋
git add .
git commit -m "feat: 새로운 기능 추가"
```

### 4. Push & PR 생성

```bash
git push origin feature/your-feature-name
```

GitHub에서 Pull Request를 생성하고 다음을 포함해주세요:

- **PR 제목** - 변경사항을 한 줄로 요약
- **설명** - 무엇을, 왜 변경했는지 상세히 설명
- **관련 이슈** - `Closes #123` 형태로 관련 이슈 연결
- **테스트** - 테스트 방법 또는 테스트 결과

### PR 체크리스트

- [ ] 코드가 ESLint 규칙을 준수하는가
- [ ] TypeScript 타입 에러가 없는가
- [ ] 빌드가 성공적으로 완료되는가 (`npm run build`)
- [ ] 기존 기능이 정상 동작하는가

---

## 개발 환경 설정

### 사전 요구사항

- **Node.js** 18 이상
- **npm** 또는 **yarn**
- **Supabase** 프로젝트 (무료 플랜 가능)
- **Google Gemini API** 키

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 값을 입력하세요

# 개발 서버 실행
npm run dev
```

### 유용한 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 검사
```

---

## 코드 스타일

### TypeScript

- **엄격 모드(strict)** 사용
- `any` 타입 사용 지양, 불가피한 경우 주석으로 사유 명시
- 인터페이스/타입은 `src/types/` 에 정의
- 서버 액션은 `src/services/` 에 위치하며 Zod로 입력 검증

### React / Next.js

- 서버 컴포넌트를 기본으로 사용
- 클라이언트 컴포넌트에는 `'use client'` 명시
- shadcn/ui 컴포넌트 활용 우선
- Tailwind CSS 유틸리티 클래스 사용

### 파일 네이밍

- 컴포넌트: `PascalCase.tsx` (예: `ReadingPreview.tsx`)
- 유틸리티/서비스: `kebab-case.ts` (예: `saju-calculator.ts`)
- 타입: `kebab-case.ts` (예: `saju-types.ts`)

### 국제화 (i18n)

- 하드코딩된 한국어 문자열 금지
- 모든 사용자 노출 텍스트는 `messages/*.json`에 정의
- `useTranslations` 훅 또는 서버에서 `getTranslations` 사용

---

## 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

### 형식

```
<type>: <description>
```

### 타입

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 포맷팅, 세미콜론 추가 등 (로직 변경 없음) |
| `refactor` | 코드 리팩토링 (기능 변경 없음) |
| `test` | 테스트 추가 또는 수정 |
| `chore` | 빌드, 패키지 관련 변경 |
| `perf` | 성능 개선 |

### 예시

```
feat: AI 채팅에 새 캐릭터 추가
fix: 진태양시 계산 시 경도 보정 오류 수정
docs: README에 설치 방법 추가
refactor: 사주 계산 로직을 별도 유틸로 분리
chore: eslint 설정 업데이트
```

---

## 질문이 있으신가요?

이슈를 등록하거나 your-email@example.com으로 문의해주세요.

감사합니다!
