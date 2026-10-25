"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { GLOSSARY, buildTermPattern, termKeyOf } from "@/lib/saju/glossary";

/**
 * 본문의 사주 용어에 쉬운 뜻을 붙인다.
 *
 * 같은 용어가 수십 번 나와도 리포트 안에서 처음 한 번만 설명하도록,
 * 어느 문장에서 어떤 용어를 설명할지는 부모가 planAnnotations()로 미리 정한다.
 * (렌더 중에 상태를 바꾸지 않기 위해 계산을 분리했다.)
 */

/**
 * 리포트의 모든 문장을 순서대로 훑어, 각 문장에서 '처음 등장이라 설명할 용어'를 정한다.
 * @param texts 리포트에 표시되는 순서대로의 문장들
 * @returns texts와 같은 길이의 배열. 각 원소는 그 문장에서 설명할 용어 키 집합.
 */
export function planAnnotations(texts: string[]): Set<string>[] {
  const seen = new Set<string>();
  return texts.map((text) => {
    const allow = new Set<string>();
    const pattern = buildTermPattern();
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const key = termKeyOf(m[0]);
      if (key && !seen.has(key)) {
        seen.add(key);
        allow.add(key);
      }
    }
    return allow;
  });
}

interface TermTextProps {
  text: string;
  /** 이 문장에서 설명할 용어 (planAnnotations 결과) */
  allow: Set<string>;
}

export default function TermText({ text, allow }: TermTextProps) {
  const nodes = useMemo(() => {
    const pattern = buildTermPattern();
    const used = new Set<string>();
    const out: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;

    while ((m = pattern.exec(text)) !== null) {
      const key = termKeyOf(m[0]);
      if (!key || !allow.has(key) || used.has(key)) continue;
      used.add(key);

      if (m.index > last) out.push(text.slice(last, m.index));
      out.push(<TermChip key={`${key}-${i++}`} term={key} label={m[0]} />);
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [text, allow]);

  return (
    <>
      {nodes.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}

function TermChip({ term, label }: { term: string; label: string }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[term];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="reading-accent inline text-left font-medium underline decoration-dotted underline-offset-4 opacity-100 transition-opacity hover:opacity-80"
      >
        {label}
      </button>
      <span style={{ color: "var(--read-muted)" }}>{` (${entry.short})`}</span>
      {open && (
        <span className="reading-muted my-2 block rounded-xl p-3.5"
          style={{
            border: "1px solid color-mix(in srgb, var(--read-accent) 28%, transparent)",
            backgroundColor: "var(--read-accent-soft)",
          }}>
          <span className="reading-accent block font-bold">{term}</span>
          <span className="mt-1 block">{entry.full}</span>
        </span>
      )}
    </>
  );
}
