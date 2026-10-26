"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import type { SajuReading } from "@/types/saju";

interface DemoPdfDownloadButtonProps {
  reading: SajuReading;
  /** 결제 확인에 쓸 주문번호. 없으면 서버가 무료 범위만 담는다. */
  orderId?: string;
}

export default function DemoPdfDownloadButton({
  reading,
  orderId,
}: DemoPdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saju/demo-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reading, orderId }),
      });

      if (!res.ok) {
        throw new Error("PDF 생성에 실패했습니다.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `팔자핀사주_${reading.name}_분석리포트.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#3182F6] text-base font-semibold text-white transition-colors hover:bg-[#1B64DA] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Download size={19} />
      {loading ? "PDF 생성 중..." : "PDF 리포트 다운로드"}
    </button>
  );
}
