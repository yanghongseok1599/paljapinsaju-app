/**
 * "이 세션은 방금 비밀번호 재설정 링크로 만들어졌다" 는 증명.
 *
 * 출처: 동해AI사장단 password-recovery.ts (그대로) — 단, 서명 키를 분리했다.
 *       원본은 SUPABASE_SERVICE_ROLE_KEY 를 HMAC 키로 재사용했는데, 한 키를 두 용도로 쓰면
 *       한쪽이 새어도 다른 쪽이 같이 뚫린다. 전용 AUTH_PROOF_SECRET 을 쓴다 (32바이트 이상 무작위).
 *
 * 왜 필요한가: 재설정 화면은 현재 비밀번호 없이 새 비밀번호를 받는다. 이 증명이 없으면
 * 로그인돼 있는 아무 세션이나 그 화면을 열어 비밀번호를 바꿀 수 있다
 * (TOP100RUN 은 secure_password_change=false 라 실제로 그 상태였다).
 * 증명은 user id 와 session id 에 묶이고 30분 뒤 만료되며, 쓰고 나면 지운다.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const RECOVERY_COOKIE = "auth-recovery-proof";
export const RECOVERY_SECONDS = 30 * 60;

function secret(): string {
  const value = process.env.AUTH_PROOF_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_PROOF_SECRET missing or too short");
  return value;
}

export function createRecoveryProof(userId: string, sessionId: string, now = Date.now()): string {
  if (!userId || !sessionId) throw new Error("Recovery proof unavailable");
  const payload = Buffer.from(JSON.stringify({ userId, sessionId, expiresAt: now + RECOVERY_SECONDS * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(`password-recovery:${payload}`).digest("base64url");
  return `${payload}.${signature}`;
}

export function recoveryProofMatches(value: string | undefined, userId: string, sessionId: string, now = Date.now()): boolean {
  if (!value || value.length > 1024 || !userId || !sessionId) return false;
  const [payloadPart, signaturePart, extra] = value.split(".");
  if (!payloadPart || !signaturePart || extra !== undefined) return false;
  try {
    const signature = Buffer.from(signaturePart, "base64url");
    const expected = createHmac("sha256", secret()).update(`password-recovery:${payloadPart}`).digest();
    if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return false;
    const p = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as { userId: string; sessionId: string; expiresAt: number };
    return p.userId === userId && p.sessionId === sessionId &&
      Number.isFinite(p.expiresAt) && p.expiresAt > now && p.expiresAt <= now + RECOVERY_SECONDS * 1000;
  } catch {
    return false;
  }
}
