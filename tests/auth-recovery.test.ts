import { beforeAll, describe, expect, it } from "vitest";
import { loginErrorMessage, AUTH_COPY } from "@/lib/auth-messages";
import { passwordPolicyError, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

let proofLib: typeof import("@/lib/recovery-proof");
beforeAll(async () => {
  process.env.AUTH_PROOF_SECRET = "x".repeat(48);
  proofLib = await import("@/lib/recovery-proof");
});

describe("재설정 증명", () => {
  it("같은 사용자·같은 세션·만료 전에만 통과", () => {
    const { createRecoveryProof, recoveryProofMatches, RECOVERY_SECONDS } = proofLib;
    const now = 1_700_000_000_000;
    const proof = createRecoveryProof("user-1", "session-1", now);
    expect(recoveryProofMatches(proof, "user-1", "session-1", now + 1000)).toBe(true);
    expect(recoveryProofMatches(proof, "user-2", "session-1", now)).toBe(false); // 다른 사용자
    expect(recoveryProofMatches(proof, "user-1", "session-2", now)).toBe(false); // 로그인만 된 다른 기기
    expect(recoveryProofMatches(proof, "user-1", "session-1", now + RECOVERY_SECONDS * 1000 + 1)).toBe(false); // 만료
    const [payload] = proof.split(".");
    expect(recoveryProofMatches(`${payload}.AAAA`, "user-1", "session-1", now)).toBe(false); // 서명 위조
    expect(recoveryProofMatches(undefined, "user-1", "session-1", now)).toBe(false);
  });
});

describe("인증 오류 문구", () => {
  it("Supabase 원문을 그대로 내보내지 않고, 미인증과 비밀번호 오류를 구분하지 않는다", () => {
    expect(loginErrorMessage({ message: "Invalid login credentials", code: "invalid_credentials" })).toBe(AUTH_COPY.loginFailed);
    expect(loginErrorMessage({ message: "Email not confirmed", code: "email_not_confirmed" })).toBe(AUTH_COPY.loginFailed);
    expect(loginErrorMessage({ status: 429 })).toBe(AUTH_COPY.rateLimited);
  });
});

describe("비밀번호 정책", () => {
  it("가입 화면 안내(8자)와 서버 기준이 같다", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(passwordPolicyError("a1b2c3d")).toMatch(/8자 이상/);
    expect(passwordPolicyError("1234567890")).toMatch(/흔한/);
    expect(passwordPolicyError("saju-night-2026")).toBeNull();
  });
});
