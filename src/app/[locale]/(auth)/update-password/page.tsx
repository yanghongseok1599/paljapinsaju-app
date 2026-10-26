"use client";

/**
 * 비밀번호 재설정 링크(/auth/reset-password)를 거쳐 도착하는 새 비밀번호 화면.
 * 저장은 재설정 증명 쿠키가 있을 때만 된다 (updatePasswordWithRecovery).
 */
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { updatePasswordWithRecovery } from "@/services/auth/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

const inputClass =
  "w-full rounded-lg border border-[rgba(73,68,84,0.3)] bg-[#1b1b20] px-3 py-2.5 text-sm text-[#e4e1e9] placeholder:text-[#6b6574] focus:border-[rgba(208,188,255,0.5)] focus:outline-none";

export default function UpdatePasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(form: FormData) {
    setBusy(true);
    setMessage(null);
    const result = await updatePasswordWithRecovery(
      String(form.get("password") ?? ""),
      String(form.get("confirmation") ?? ""),
    );
    setBusy(false);
    if ("success" in result && result.success) setDone(true);
    else setMessage("error" in result && result.error ? result.error : "요청을 처리하지 못했습니다.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "#131318" }}>
      <div className="w-full max-w-sm rounded-2xl border border-[rgba(73,68,84,0.25)] bg-[#17171c] p-6">
        {done ? (
          <>
            <h1 className="text-lg font-bold text-[#e4e1e9]">비밀번호를 바꿨습니다</h1>
            <p className="mt-2 text-sm text-[#958ea0]">다른 기기의 로그인은 모두 해제되었습니다.</p>
            <Link href="/" className="mt-6 block rounded-xl py-3 text-center text-sm font-semibold oracle-gradient" style={{ color: "#3c0091" }}>
              처음으로
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-[#e4e1e9]">새 비밀번호 설정</h1>
            <form action={submit} className="mt-5 space-y-3">
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                placeholder={`새 비밀번호 (${PASSWORD_MIN_LENGTH}자 이상)`}
                className={inputClass}
              />
              <input
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                placeholder="새 비밀번호 확인"
                className={inputClass}
              />
              {message ? (
                <p role="alert" className="text-xs text-red-400">
                  {message}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl py-3 text-sm font-semibold oracle-gradient disabled:opacity-60"
                style={{ color: "#3c0091" }}
              >
                {busy ? "저장 중…" : "저장"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
