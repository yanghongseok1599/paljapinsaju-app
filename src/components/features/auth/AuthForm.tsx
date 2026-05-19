"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  loginWithGoogle,
  loginWithKakao,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
} from "@/services/auth/actions";
import { useRouter } from "next/navigation";

type AuthTab = "signin" | "signup";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (!/[a-zA-Z]/.test(password)) return "비밀번호에 영문자가 포함되어야 합니다.";
  if (!/[0-9]/.test(password)) return "비밀번호에 숫자가 포함되어야 합니다.";
  return null;
}

export function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("signin");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPendingGoogle, startGoogle] = useTransition();
  const [isPendingKakao, startKakao] = useTransition();
  const [isPendingEmail, startEmail] = useTransition();
  const [isPendingReset, startReset] = useTransition();

  const handleGoogleLogin = () => {
    startGoogle(async () => {
      await loginWithGoogle();
    });
  };

  const handleKakaoLogin = () => {
    startKakao(async () => {
      await loginWithKakao();
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setSuccessMessage(null);

    if (!validateEmail(email)) {
      setFieldError("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setFieldError(pwError);
      return;
    }

    if (tab === "signup" && password !== passwordConfirm) {
      setFieldError("비밀번호가 일치하지 않습니다.");
      return;
    }

    startEmail(async () => {
      if (tab === "signup") {
        const result = await signUpWithEmail(email, password);
        if (result?.error) {
          if (result.error.toLowerCase().includes("already")) {
            setFieldError("이미 사용 중인 이메일입니다.");
          } else {
            setFieldError("회원가입에 실패했습니다. 다시 시도해주세요.");
          }
        } else {
          setSuccessMessage("확인 이메일이 발송되었습니다. 메일함을 확인하세요.");
        }
      } else {
        const result = await signInWithEmail(email, password);
        if (result?.error) {
          setFieldError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          router.refresh();
        }
      }
    });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setSuccessMessage(null);

    if (!validateEmail(email)) {
      setFieldError("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    startReset(async () => {
      const result = await sendPasswordReset(email);
      if (result?.error) {
        setFieldError("비밀번호 재설정 이메일 발송에 실패했습니다.");
      } else {
        setSuccessMessage("비밀번호 재설정 이메일이 발송되었습니다. 메일함을 확인하세요.");
      }
    });
  };

  const isAnyPending = isPendingGoogle || isPendingKakao || isPendingEmail || isPendingReset;

  const inputClass =
    "w-full bg-[#1a1922] border border-[rgba(73,68,84,0.35)] rounded-lg px-3 py-2.5 text-sm text-[#e4e1e9] placeholder:text-[#4a4660] focus:outline-none focus:border-[rgba(208,188,255,0.45)] transition-colors";

  return (
    <Card
      className="w-full max-w-[380px] glass-panel glow-primary"
      style={{ border: "1px solid rgba(73,68,84,0.2)", borderRadius: "1.5rem" }}
    >
      <CardHeader>
        <CardTitle
          className="text-[#e4e1e9]"
          style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
        >
          팔자핀사주 로그인
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {/* Google */}
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isAnyPending}
          className="w-full"
          type="button"
        >
          {isPendingGoogle ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google로 계속하기
        </Button>

        {/* Kakao */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isAnyPending}
          className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: "#FEE500", color: "#191600" }}
        >
          {isPendingKakao ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#191600] border-t-transparent" />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="#191600"
              aria-hidden="true"
            >
              <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.72 1.607 5.12 4.055 6.621L5.07 21.02a.25.25 0 0 0 .378.267L10.25 18.5A11.7 11.7 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
            </svg>
          )}
          카카오로 계속하기
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-[rgba(73,68,84,0.25)]" />
          <span className="text-xs text-[#4a4660]">또는</span>
          <div className="flex-1 h-px bg-[rgba(73,68,84,0.25)]" />
        </div>

        {/* Email toggle button */}
        {!showEmailForm && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full text-[#958ea0] border border-[rgba(73,68,84,0.25)] hover:border-[rgba(208,188,255,0.3)] hover:text-[#e4e1e9]"
          >
            이메일로 계속하기
          </Button>
        )}

        {/* Email form */}
        {showEmailForm && (
          <div className="space-y-3">
            {/* Tabs */}
            {!showForgotPassword && (
              <div className="flex rounded-lg overflow-hidden border border-[rgba(73,68,84,0.3)]">
                <button
                  type="button"
                  onClick={() => { setTab("signin"); setFieldError(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                    tab === "signin"
                      ? "bg-[rgba(208,188,255,0.12)] text-[#d0bcff]"
                      : "text-[#958ea0] hover:text-[#e4e1e9]"
                  }`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("signup"); setFieldError(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                    tab === "signup"
                      ? "bg-[rgba(208,188,255,0.12)] text-[#d0bcff]"
                      : "text-[#958ea0] hover:text-[#e4e1e9]"
                  }`}
                >
                  회원가입
                </button>
              </div>
            )}

            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-[#958ea0]">
                  가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
                </p>
                <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                  required
                />
                {fieldError && (
                  <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-2 py-1.5">{fieldError}</p>
                )}
                {successMessage && (
                  <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-2 py-1.5">{successMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={isPendingReset}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold oracle-gradient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPendingReset && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  재설정 이메일 보내기
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setFieldError(null); setSuccessMessage(null); }}
                  className="w-full text-xs text-[#958ea0] hover:text-[#e4e1e9] transition-colors"
                >
                  ← 로그인으로 돌아가기
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-2.5">
                <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                  required
                />
                <input
                  type="password"
                  placeholder="비밀번호 (영문+숫자 8자 이상)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  required
                />
                {tab === "signup" && (
                  <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                    required
                  />
                )}

                {fieldError && (
                  <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-2 py-1.5">{fieldError}</p>
                )}
                {successMessage && (
                  <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-2 py-1.5">{successMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isPendingEmail}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold oracle-gradient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPendingEmail && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {tab === "signin" ? "로그인" : "회원가입"}
                </button>

                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setFieldError(null); setSuccessMessage(null); }}
                    className="w-full text-xs text-[#958ea0] hover:text-[#d0bcff] transition-colors text-center"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground pt-1">
          로그인하면{" "}
          <Link href="/terms" className="underline hover:text-primary">
            이용약관
          </Link>{" "}
          및{" "}
          <Link href="/privacy-policy" className="underline hover:text-primary">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
