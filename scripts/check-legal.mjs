/**
 * 배포 전 법적 고지 점검.
 *
 * `npm run build` 앞단(prebuild)에서 자동 실행된다.
 * 사업자 정보가 비어 있거나 플레이스홀더가 남아 있으면 빌드를 중단한다.
 * 가짜 연락처로 배포되면 환불·문의 창구가 없는 상태가 되기 때문이다.
 *
 * 통과시키려면 src/lib/legal/company.ts 의 값을 실제 정보로 채운다.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PLACEHOLDER = "__채워주세요__";

let failed = false;
const problems = [];

// ── 1. 사업자 정보가 채워졌는지 ──
const companySrc = readFileSync(join(ROOT, "src/lib/legal/company.ts"), "utf8");
const unfilled = [
  ...companySrc.matchAll(/^\s*(\w+):\s*PLACEHOLDER,/gm),
].map((m) => m[1]);

if (unfilled.length > 0) {
  problems.push(
    `사업자 정보 ${unfilled.length}개 항목이 비어 있습니다: ${unfilled.join(", ")}\n` +
      `    → src/lib/legal/company.ts 를 실제 정보로 채우세요.`,
  );
  failed = true;
}

// ── 2. 소스 어딘가에 예시 연락처가 남아 있는지 ──
const BAD_PATTERNS = [
  { re: /your-email@example\.com/i, label: "예시 이메일(your-email@example.com)" },
  { re: /Your Company Name/i, label: "예시 상호(Your Company Name)" },
  { re: /Your Address/i, label: "예시 주소(Your Address)" },
  { re: /000-00-00000/, label: "예시 사업자등록번호(000-00-00000)" },
  { re: /0000-지역-0000/, label: "예시 통신판매업 신고번호(제0000-지역-0000호)" },
  { re: /Paddle\.com/i, label: "미사용 결제사(Paddle.com) 잔재" },
];

function walk(dir, hits) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, hits);
    } else if (/\.(ts|tsx|mdx?|json)$/.test(entry)) {
      // 점검 스크립트 자신과 단일 출처 파일은 제외
      if (full.includes("check-legal.mjs") || full.includes("legal/company.ts")) continue;
      const text = readFileSync(full, "utf8");
      for (const { re, label } of BAD_PATTERNS) {
        if (re.test(text)) hits.push(`${full.replace(ROOT, "")} — ${label}`);
      }
    }
  }
}

const hits = [];
walk(join(ROOT, "src"), hits);
// 번역 파일도 모든 방문자에게 전송된다 (템플릿의 자리표시자 사업자 정보가 여기 남아 있었다)
walk(join(ROOT, "messages"), hits);

if (hits.length > 0) {
  problems.push(`예시 정보가 남아 있는 파일 ${hits.length}곳:\n    ` + hits.join("\n    "));
  failed = true;
}

// ── 결과 ──
if (failed) {
  console.error("\n✗ 배포 전 법적 고지 점검 실패\n");
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`));
  console.error("  이 검사를 건너뛰려면 package.json 의 prebuild 스크립트를 제거하세요.\n");
  process.exit(1);
}

console.log("✓ 법적 고지 점검 통과 — 사업자 정보가 모두 채워졌습니다.");
