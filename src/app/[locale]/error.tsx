"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/routing";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#131318" }}
    >
      <h1 className="text-2xl font-bold text-[#e4e1e9]">일시적인 오류가 발생했어요</h1>
      <p className="mt-2 text-sm text-[#958ea0]">
        잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 알려 주세요.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl px-6 py-3 text-sm font-semibold oracle-gradient"
          style={{ color: "#3c0091" }}
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[rgba(73,68,84,0.4)] px-6 py-3 text-sm text-[#e4e1e9]"
        >
          처음으로
        </Link>
      </div>
    </main>
  );
}
