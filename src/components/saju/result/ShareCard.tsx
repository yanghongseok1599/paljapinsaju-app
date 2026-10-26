"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareCardProps {
  name: string;
}

export default function ShareCard({ name }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  // 결과 페이지는 본인만 볼 수 있어(로그인 + 소유자 확인) 받은 사람에게 열리지 않았다.
  // 결과를 공개 링크로 돌리면 이름·생년월일이 함께 퍼지므로, "나도 받아보기" 링크를 공유한다.
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/reading` : "";

  const shareText = `${name}님이 팔자핀사주에서 사주 분석을 받았어요. 나도 무료로 받아보기 - 팔자핀사주`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleKakaoShare = () => {
    if (typeof window !== "undefined" && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "팔자핀사주 - AI 사주분석",
          description: shareText,
          imageUrl: `${window.location.origin}/opengraph-image`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "나도 사주 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      handleCopyLink();
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "팔자핀사주 - AI 사주분석",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // 사용자가 공유 취소
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6" style={{ borderColor: 'rgba(73,68,84,0.2)' }}>
      <h3 className="text-base font-semibold mb-3 text-[#e4e1e9]">
        친구에게 공유하기
      </h3>
      <p className="text-sm mb-4 text-[#958ea0]">
        사주분석 결과를 친구에게 공유해보세요.
      </p>
      <div className="flex gap-2">
        <Button
          onClick={handleNativeShare}
          variant="outline"
          className="flex-1 h-10 rounded-xl text-sm font-medium text-[#cac4d0] hover:text-[#e4e1e9] hover:bg-[rgba(208,188,255,0.05)]" style={{ border: '1px solid rgba(73,68,84,0.3)' }}
        >
          <svg
            className="w-4 h-4 mr-1.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          공유
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex-1 h-10 rounded-xl text-sm font-medium text-[#cac4d0] hover:text-[#e4e1e9] hover:bg-[rgba(208,188,255,0.05)]" style={{ border: '1px solid rgba(73,68,84,0.3)' }}
        >
          {copied ? "복사됨" : "링크 복사"}
        </Button>
        <Button
          onClick={handleKakaoShare}
          className="flex-1 h-10 rounded-xl text-sm font-medium bg-[#FEE500] hover:bg-[#FADA0A] text-[#3C1E1E]"
        >
          카카오톡
        </Button>
      </div>
    </div>
  );
}
