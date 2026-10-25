"use client";

import { useSyncExternalStore } from "react";

export type ReadingMode = "dark" | "sepia" | "light";

const STORAGE_KEY = "paljapin.reading.mode";

const MODES: { id: ReadingMode; label: string; hint: string }[] = [
  { id: "dark", label: "다크", hint: "어두운 곳에서 보기" },
  { id: "sepia", label: "세피아", hint: "오래 읽기에 가장 편한 톤" },
  { id: "light", label: "라이트", hint: "밝은 곳에서 또렷하게" },
];

/**
 * 읽기 모드는 localStorage에 저장되는 외부 상태라 useSyncExternalStore로 읽는다.
 * (effect에서 setState 하면 첫 페인트 후 한 번 더 그려져 화면이 깜빡인다.)
 */
const listeners = new Set<() => void>();

/**
 * getSnapshot은 렌더마다 불리므로 매번 localStorage를 읽지 않도록 캐시한다.
 * 저장소를 못 쓰는 환경(사파리 프라이빗 등)에서도 이 캐시 덕분에
 * 이번 세션 동안은 모드 변경이 정상 동작한다.
 */
let cached: ReadingMode | null = null;

function readStorage(): ReadingMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "sepia" || saved === "light" || saved === "dark") return saved;
  } catch {
    // 저장소 접근 불가 — 기본값
  }
  return "dark";
}

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null; // 다른 탭에서 바뀌었으면 다시 읽는다
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ReadingMode {
  if (cached === null) cached = readStorage();
  return cached;
}

/** 서버 렌더와 첫 하이드레이션에서는 항상 다크 */
function getServerSnapshot(): ReadingMode {
  return "dark";
}

export function useReadingMode(): [ReadingMode, (m: ReadingMode) => void] {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = (m: ReadingMode) => {
    cached = m;
    try {
      window.localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // 저장 실패해도 캐시 덕분에 이번 세션에는 적용된다
    }
    notify();
  };

  return [mode, update];
}

export default function ReadingModeToggle({
  mode,
  onChange,
}: {
  mode: ReadingMode;
  onChange: (m: ReadingMode) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="reading-muted hidden sm:inline">읽기 모드</span>
      <div
        role="radiogroup"
        aria-label="읽기 모드"
        className="flex gap-1 rounded-xl p-1"
        style={{ backgroundColor: "var(--read-accent-soft)" }}
      >
        {MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={m.hint}
              onClick={() => onChange(m.id)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style={
                active
                  ? { backgroundColor: "var(--read-accent)", color: "var(--read-card)" }
                  : { color: "var(--read-muted)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
