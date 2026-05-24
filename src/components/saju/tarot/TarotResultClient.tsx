"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import type { SpreadType } from "@/lib/tarot/spreads";
import type { TarotCard } from "@/lib/tarot/cards";

interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: string;
}

interface TarotResultClientProps {
  readingId: string;
  spread: SpreadType;
  question: string | null;
  drawn: DrawnCard[];
  initialInterpretation: string | null;
  locale: string;
}

const POSITION_LABEL: Record<string, string> = {
  today: "오늘의 카드",
  past: "과거",
  present: "현재",
  future: "미래",
  situation: "현재 상황",
  challenge: "도전 / 장애",
  above: "의식 / 목표",
  below: "잠재의식",
  advice: "조언",
  external: "외부 영향",
  hopes_fears: "희망 / 두려움",
  outcome: "결과",
};

const SPREAD_LABEL: Record<SpreadType, string> = {
  one: "원 카드",
  three: "쓰리 카드",
  celtic: "켈틱 크로스",
};

export default function TarotResultClient({
  readingId,
  spread,
  question,
  drawn,
  initialInterpretation,
  locale,
}: TarotResultClientProps) {
  const [text, setText] = useState<string>(initialInterpretation ?? "");
  const [streaming, setStreaming] = useState<boolean>(!initialInterpretation);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (initialInterpretation) return; // 이미 저장된 결과면 스트림 안 함
    if (startedRef.current) return;
    startedRef.current = true;

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/saju/tarot/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId, locale }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          setError(`해석을 가져오지 못했어요 (${res.status})`);
          setStreaming(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setText(acc);
        }
        setStreaming(false);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError("네트워크 오류");
        setStreaming(false);
      }
    })();

    return () => ac.abort();
  }, [readingId, locale, initialInterpretation]);

  // 켈틱(10장)은 세로 1열 또는 데스크톱 5x2, 쓰리는 3열, 원은 1열 중앙
  const gridCols =
    spread === "one"
      ? "grid-cols-1 max-w-xs mx-auto"
      : spread === "three"
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-5";

  return (
    <div className="font-['Pretendard'] max-w-5xl mx-auto px-6 pt-12 pb-24">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-wider uppercase text-[#d0bcff] mb-3">
          ✦ {SPREAD_LABEL[spread]}
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">당신의 리딩</h1>
        {question && (
          <p className="text-sm text-[#cbc3d7] italic max-w-2xl mx-auto">&ldquo;{question}&rdquo;</p>
        )}
      </div>

      {/* Cards */}
      <div className={`grid ${gridCols} gap-4 mb-12`}>
        {drawn.map((d, i) => (
          <motion.div
            key={`${d.card.id}-${i}`}
            initial={{ opacity: 0, y: 16, rotateY: 180 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="rounded-xl border border-[#d0bcff]/20 bg-[#1f1f25] p-3 flex flex-col items-center"
          >
            <p className="text-[10px] tracking-wider uppercase text-[#d0bcff]/70 mb-2 text-center">
              {POSITION_LABEL[d.position] ?? d.position}
            </p>
            <div className="relative w-full aspect-[3/5] rounded-md overflow-hidden mb-2">
              <Image
                src={d.card.image}
                alt={d.card.nameEn}
                fill
                sizes="(max-width: 768px) 40vw, 180px"
                className={d.reversed ? "object-cover rotate-180" : "object-cover"}
                style={{
                  background:
                    "linear-gradient(135deg, #1f1f25, #131318)",
                }}
                onError={(e) => {
                  // 아직 일러스트가 없는 마이너 카드 fallback: 카드 백
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.endsWith("/tarot/back.webp")) {
                    target.src = "/tarot/back.webp";
                  }
                }}
              />
              {d.reversed && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-[#a078ff]/80 text-white text-[9px] font-bold">
                  역
                </div>
              )}
            </div>
            <p className="text-[11px] text-white font-medium text-center leading-tight">
              {d.card.nameEn}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Luna interpretation */}
      <section className="rounded-2xl border border-[#d0bcff]/15 bg-[#1f1f25]/70 backdrop-blur-md p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#d0bcff]/30">
            <Image src="/tarot/characters/luna.webp" alt="루나" fill sizes="48px" className="object-cover" />
          </div>
          <div>
            <p className="text-white font-bold">루나</p>
            <p className="text-xs text-[#cbc3d7]/60">달빛의 점술가</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-400 py-4">{error}</p>
        )}

        {text ? (
          <article className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-[#d0bcff] prose-p:text-[#e8e3f0] prose-strong:text-white prose-li:text-[#e8e3f0]">
            <ReactMarkdown>{text}</ReactMarkdown>
          </article>
        ) : (
          !error && (
            <div className="flex items-center gap-3 py-6 text-[#cbc3d7]">
              <motion.div
                className="w-4 h-4 rounded-full bg-[#d0bcff]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="text-sm">루나가 카드를 읽고 있어요...</span>
            </div>
          )
        )}

        {streaming && text && (
          <span className="inline-block w-2 h-4 bg-[#d0bcff] animate-pulse ml-1 align-middle" aria-hidden />
        )}
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-col md:flex-row gap-3 justify-center">
        <Link
          href={`/${locale}/tarot`}
          className="px-6 py-3 rounded-xl bg-[#1f1f25] border border-[#d0bcff]/20 text-[#d0bcff] text-sm font-semibold hover:bg-[#d0bcff]/10 transition-colors text-center"
        >
          ✦ 다시 뽑기
        </Link>
      </div>
    </div>
  );
}
