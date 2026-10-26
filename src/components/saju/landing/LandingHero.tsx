"use client";

import { Link } from "@/i18n/routing";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

interface LandingHeroProps {
  isLoggedIn?: boolean;
}

// ─── Scroll-scrubbed video frame sequence ────────────────────────────────────
const HERO_FRAME_COUNT = 200;

function heroFrameSrc(n: number): string {
  return `/hero-frames/frame-${String(n).padStart(3, "0")}.jpg`;
}

function HeroFrameSequence() {
  const prefersReduced = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const currentFrame = useRef(1);
  const targetFrame = useRef(1);
  const rafId = useRef<number>(0);
  const lastSrc = useRef("");
  const frameStep = useRef(1);
  // Scrub completes when scrollY reaches 1.8 * innerHeight (within 280vh track)
  const scrollRange = useRef(
    typeof window !== "undefined" ? window.innerHeight * 1.8 : 720
  );

  useEffect(() => {
    const onResize = () => {
      scrollRange.current = window.innerHeight * 1.8;
    };
    window.addEventListener("resize", onResize, { passive: true });

    if (prefersReduced) {
      if (imgRef.current) imgRef.current.src = heroFrameSrc(1);
      return () => window.removeEventListener("resize", onResize);
    }

    // 프레임 200장(약 12MB)을 첫 화면에서 전부 받지 않는다.
    // 첫 스크롤 때 받기 시작하고, 좁은 화면·데이터 절약 모드에선 4장에 1장만 쓴다.
    // ponytail: 모바일은 50프레임이라 스크럽이 덜 매끄럽다. 부족하면 프레임을 webp 로 바꿔 용량을 줄이고 step 을 낮춘다.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    frameStep.current = saveData || window.innerWidth < 768 ? 4 : 1;
    let preloaded = false;
    const preloadFrames = () => {
      if (preloaded) return;
      preloaded = true;
      for (let i = 1; i <= HERO_FRAME_COUNT; i += frameStep.current) {
        const im = new window.Image();
        im.src = heroFrameSrc(i);
      }
    };

    const onScroll = () => {
      if (window.scrollY > 0) preloadFrames();
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / scrollRange.current)
      );
      targetFrame.current = 1 + progress * (HERO_FRAME_COUNT - 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      currentFrame.current +=
        (targetFrame.current - currentFrame.current) * 0.1;
      const step = frameStep.current;
      const idx = Math.min(
        HERO_FRAME_COUNT,
        1 + step * Math.round((Math.max(1, currentFrame.current) - 1) / step)
      );
      const src = heroFrameSrc(idx);
      if (imgRef.current && lastSrc.current !== src) {
        imgRef.current.src = src;
        lastSrc.current = src;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId.current);
    };
  }, [prefersReduced]);

  return (
    // Full-width frame: width:100% / height:auto → fills stage width, no side crop.
    // Vertically centered; any letterbox above/below filled with dark #08080c.
    <div
      className="absolute inset-0 flex items-start justify-center"
      aria-hidden="true"
      style={{ background: "#08080c" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={heroFrameSrc(1)}
        alt=""
        style={{ width: "100%", height: "auto", display: "block" }}
        draggable={false}
      />
    </div>
  );
}

// ─── Cosmic star/glow/grain overlay ──────────────────────────────────────────
function CosmicScene() {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(208,188,255,0.16) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 15% 60%, rgba(137,206,255,0.10) 0%, transparent 45%)," +
          "radial-gradient(ellipse at 85% 40%, rgba(160,120,255,0.12) 0%, transparent 40%)," +
          "radial-gradient(ellipse at 50% 100%, rgba(255,185,95,0.05) 0%, transparent 50%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 70% 70%, rgba(137,206,255,0.07) 0%, transparent 60%)",
          animation: prefersReduced
            ? "none"
            : "nebulaDrift 20s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 0.5px, transparent 0)," +
            "radial-gradient(circle at 1px 1px, rgba(208,188,255,0.35) 0.5px, transparent 0)",
          backgroundSize: "60px 60px, 37px 37px",
          backgroundPosition: "0 0, 18px 28px",
        }}
      />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.75) 1px, transparent 0)",
          backgroundSize: "120px 120px",
          backgroundPosition: "12px 40px",
        }}
      />
      <div
        className="absolute top-[-15%] left-[28%] w-[600px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(160,120,255,0.22) 0%, transparent 65%)",
          filter: "blur(40px)",
          animation: prefersReduced
            ? "none"
            : "orbFloat 15s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(137,206,255,0.14) 0%, transparent 65%)",
          filter: "blur(50px)",
          animation: prefersReduced
            ? "none"
            : "orbFloat 18s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#131318] to-transparent" />
    </div>
  );
}

// ─── 오행(五行) Interactive Diagram ──────────────────────────────────────────

const ELEMENTS = [
  { id: "목" as const, hanja: "木", name: "목", color: "#66BB6A", glow: "rgba(102,187,106,0.5)", angle: -90 },
  { id: "화" as const, hanja: "火", name: "화", color: "#EF5350", glow: "rgba(239,83,80,0.5)",   angle: -18 },
  { id: "토" as const, hanja: "土", name: "토", color: "#FFB300", glow: "rgba(255,179,0,0.5)",   angle:  54 },
  { id: "금" as const, hanja: "金", name: "금", color: "#AB47BC", glow: "rgba(171,71,188,0.5)",  angle: 126 },
  { id: "수" as const, hanja: "水", name: "수", color: "#42A5F5", glow: "rgba(66,165,245,0.5)",  angle: 198 },
];

type ElementId = (typeof ELEMENTS)[number]["id"];

// 상생(生) generation cycle: 목→화→토→금→수→목
const SANGSAENG: [ElementId, ElementId][] = [
  ["목", "화"],
  ["화", "토"],
  ["토", "금"],
  ["금", "수"],
  ["수", "목"],
];

// 상극(剋) control cycle pentagram: 목→토, 토→수, 수→화, 화→금, 금→목
const SANGGEUK: [ElementId, ElementId][] = [
  ["목", "토"],
  ["토", "수"],
  ["수", "화"],
  ["화", "금"],
  ["금", "목"],
];

const DEG = Math.PI / 180;

function elementPos(angleDeg: number, r: number, cx: number, cy: number) {
  return {
    x: cx + r * Math.cos(angleDeg * DEG),
    y: cy + r * Math.sin(angleDeg * DEG),
  };
}

function arcPath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  curve = 0.22
): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const cpx = mx + (cx - mx) * curve;
  const cpy = my + (cy - my) * curve;
  return `M ${ax} ${ay} Q ${cpx} ${cpy} ${bx} ${by}`;
}

// ─── Cosmic starfield — animated backdrop for the 오행 panel ────────────────
function OhaengCosmos({
  hoveredId,
  prefersReduced,
}: {
  hoveredId: ElementId | null;
  prefersReduced: boolean;
}) {
  // Generated AFTER mount (client-only) so SSR HTML stays empty → no hydration mismatch.
  const [stars, setStars] = useState<
    {
      x: number;
      y: number;
      size: number;
      delay: number;
      duration: number;
      color: string;
    }[]
  >([]);
  useEffect(() => {
    setStars(
      Array.from({ length: 95 }, () => {
        const tier = Math.random();
        const size =
          tier > 0.96
            ? 2.2 + Math.random() * 0.9
            : tier > 0.85
              ? 1.5 + Math.random() * 0.6
              : 0.55 + Math.random() * 0.9;
        const c = Math.random();
        return {
          x: Math.random() * 100,
          y: Math.random() * 100,
          size,
          delay: -Math.random() * 5,
          duration: 2.4 + Math.random() * 4.6,
          color:
            c < 0.17
              ? "#d0bcff"
              : c < 0.32
                ? "#89ceff"
                : c < 0.39
                  ? "#ffb95f"
                  : "#ffffff",
        };
      })
    );
  }, []);

  const hoverColor = hoveredId
    ? (ELEMENTS.find((e) => e.id === hoveredId)?.color ?? null)
    : null;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ borderRadius: "inherit" }}
    >
      {/* Layered nebula — drifts slowly */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 25% 30%, rgba(160,120,255,0.20) 0%, transparent 65%)," +
            "radial-gradient(ellipse 55% 50% at 75% 70%, rgba(137,206,255,0.14) 0%, transparent 65%)," +
            "radial-gradient(ellipse 45% 45% at 50% 50%, rgba(255,185,95,0.06) 0%, transparent 75%)",
          animation: prefersReduced
            ? "none"
            : "nebulaDrift 28s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 35% 35% at 80% 25%, rgba(208,188,255,0.10) 0%, transparent 70%)," +
            "radial-gradient(ellipse 30% 35% at 18% 75%, rgba(137,206,255,0.10) 0%, transparent 70%)",
          animation: prefersReduced
            ? "none"
            : "nebulaDrift 38s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Twinkling stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="cosmic-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: s.color,
            boxShadow: `0 0 ${Math.max(s.size * 2.2, 3)}px ${s.color}`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* Shooting stars — occasional streaks */}
      {!prefersReduced && (
        <>
          <span
            className="cosmic-shooting"
            style={{ animationDelay: "0s", animationDuration: "11s", top: "8%" }}
          />
          <span
            className="cosmic-shooting"
            style={{ animationDelay: "5.5s", animationDuration: "13s", top: "62%" }}
          />
          <span
            className="cosmic-shooting"
            style={{ animationDelay: "8s", animationDuration: "16s", top: "38%" }}
          />
        </>
      )}

      {/* Hover-reactive cosmic glow — tinted by hovered element's color */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hoverColor
            ? `radial-gradient(ellipse 70% 70% at 50% 50%, ${hoverColor}3D 0%, ${hoverColor}14 40%, transparent 78%)`
            : "transparent",
          opacity: hoverColor ? 1 : 0,
          transition: "opacity 0.45s ease-out, background 0.45s ease-out",
          mixBlendMode: "screen",
        }}
      />
      {/* Hover pulse ring */}
      {hoverColor && !prefersReduced && (
        <div
          className="cosmic-pulse"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 36%, ${hoverColor}44 39%, transparent 44%)`,
          }}
        />
      )}
    </div>
  );
}

interface OhaengDiagramProps {
  prefersReduced: boolean;
  onHoverChange?: (id: ElementId | null) => void;
}

function OhaengDiagram({ prefersReduced, onHoverChange }: OhaengDiagramProps) {
  const [hoveredId, setHoveredId] = useState<ElementId | null>(null);

  // Notify parent when hover state changes (for cosmic background reaction)
  useEffect(() => {
    onHoverChange?.(hoveredId);
  }, [hoveredId, onHoverChange]);
  const [localMouse, setLocalMouse] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0);
  const rafRotRef = useRef<number>(0);
  // Refs for ref-driven rotation — no React state, no 60fps re-render storm
  const rotGroupRef = useRef<SVGGElement>(null);
  const nodeTextRefs = useRef<Map<ElementId, SVGGElement>>(new Map());

  const SIZE = 420;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 155;
  const NODE_R = 32;

  // Continuous slow rotation — applied via SVG <g> transform on a ref, so
  // arc paths / animateMotion paths stay STATIC and particles glide smoothly.
  // Element texts are individually counter-rotated to stay upright.
  useEffect(() => {
    if (prefersReduced) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      rotRef.current = (rotRef.current + dt * 0.003) % 360;
      const a = rotRef.current;
      if (rotGroupRef.current) {
        rotGroupRef.current.setAttribute("transform", `rotate(${a} ${CX} ${CY})`);
      }
      ELEMENTS.forEach((el) => {
        const node = nodeTextRefs.current.get(el.id);
        if (node) {
          const pos = elementPos(el.angle, R, CX, CY);
          node.setAttribute("transform", `rotate(${-a} ${pos.x} ${pos.y})`);
        }
      });
      rafRotRef.current = requestAnimationFrame(tick);
    };
    rafRotRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRotRef.current);
  }, [prefersReduced, CX, CY, R]);

  // Parallax tilt on mouse move over container
  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const rx = (e.clientX - rect.left) / rect.width - 0.5;
      const ry = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: ry * 18, y: -rx * 18 });
    },
    [prefersReduced]
  );

  const handleContainerMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHoveredId(null);
  }, []);

  // Hover detection on SVG (track mouse relative to SVG for tooltip)
  const handleSVGMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svgRect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
      const mx = e.clientX - svgRect.left;
      const my = e.clientY - svgRect.top;
      setLocalMouse({ x: mx, y: my });

      if (prefersReduced) return;
      let closest: ElementId | null = null;
      let minDist = NODE_R * 1.8;
      ELEMENTS.forEach((el) => {
        const angle = el.angle + rotRef.current;
        const pos = elementPos(angle, R, CX, CY);
        const dist = Math.hypot(mx - pos.x, my - pos.y);
        if (dist < minDist) {
          minDist = dist;
          closest = el.id;
        }
      });
      setHoveredId(closest);
    },
    [prefersReduced, CX, CY, NODE_R, R]
  );

  const handleSVGMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  // Compute highlighted/dimmed sets
  const highlightedNodes = new Set<ElementId>();
  const dimmedNodes = new Set<ElementId>();
  const activeSangsaeng = new Set<string>();
  const activeSanggeuk = new Set<string>();

  if (hoveredId) {
    highlightedNodes.add(hoveredId);
    SANGSAENG.forEach(([from, to]) => {
      if (from === hoveredId || to === hoveredId) {
        highlightedNodes.add(from);
        highlightedNodes.add(to);
        activeSangsaeng.add(`${from}-${to}`);
      }
    });
    SANGGEUK.forEach(([from, to]) => {
      if (from === hoveredId || to === hoveredId) {
        highlightedNodes.add(from);
        highlightedNodes.add(to);
        activeSanggeuk.add(`${from}-${to}`);
      }
    });
    ELEMENTS.forEach((el) => {
      if (!highlightedNodes.has(el.id)) dimmedNodes.add(el.id);
    });
  }

  // Base node positions — visual rotation is applied via the SVG group transform.
  const nodePositions = ELEMENTS.map((el) => ({
    ...el,
    pos: elementPos(el.angle, R, CX, CY),
  }));

  const getPos = (id: ElementId) => {
    const found = nodePositions.find((n) => n.id === id);
    return found ? found.pos : { x: CX, y: CY };
  };

  const isHighlighted = (id: ElementId) =>
    hoveredId === null || highlightedNodes.has(id);
  const isDimmed = (id: ElementId) => dimmedNodes.has(id);

  const hoveredEl = ELEMENTS.find((e) => e.id === hoveredId);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none"
      style={{
        width: SIZE,
        height: SIZE,
        perspective: "800px",
        cursor: hoveredId ? "pointer" : "default",
      }}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
    >
      {/* 3D perspective tilt wrapper */}
      <div
        style={{
          width: SIZE,
          height: SIZE,
          transform: prefersReduced
            ? "none"
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: prefersReduced ? "none" : "transform 0.12s ease-out",
          transformStyle: "preserve-3d",
          position: "relative",
        }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: "visible", display: "block" }}
          onMouseMove={handleSVGMouseMove}
          onMouseLeave={handleSVGMouseLeave}
        >
          <defs>
            {ELEMENTS.map((el) => (
              <filter
                key={el.id}
                id={`glow-${el.id}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feFlood
                  floodColor={el.color}
                  floodOpacity="0.7"
                  result="color"
                />
                <feComposite
                  in="color"
                  in2="blur"
                  operator="in"
                  result="glow"
                />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            <filter id="orbit-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrow markers for each element color */}
            {ELEMENTS.map((el) => (
              <marker
                key={el.id}
                id={`arrow-ss-${el.id}`}
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill={el.color} opacity="0.85" />
              </marker>
            ))}
            <marker
              id="arrow-sk"
              markerWidth="5"
              markerHeight="5"
              refX="2.5"
              refY="2.5"
              orient="auto"
            >
              <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(255,255,255,0.25)" />
            </marker>
            {/* Gradient along each 상생 arc (recomputed with current positions) */}
            {SANGSAENG.map(([from, to]) => {
              const a = getPos(from);
              const b = getPos(to);
              const fromEl = ELEMENTS.find((e) => e.id === from)!;
              const toEl = ELEMENTS.find((e) => e.id === to)!;
              return (
                <linearGradient
                  key={`grad-${from}-${to}`}
                  id={`grad-${from}-${to}`}
                  gradientUnits="userSpaceOnUse"
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                >
                  <stop offset="0%" stopColor={fromEl.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={toEl.color} stopOpacity="0.9" />
                </linearGradient>
              );
            })}
            {/* Particle paths for animateMotion */}
            {ELEMENTS.map((el, i) => {
              const nextEl = ELEMENTS[(i + 1) % 5];
              const a = getPos(el.id);
              const b = getPos(nextEl.id);
              const d = arcPath(a.x, a.y, b.x, b.y, CX, CY, 0.22);
              return (
                <path
                  key={`ppath-${el.id}`}
                  id={`particle-path-${el.id}`}
                  d={d}
                  fill="none"
                />
              );
            })}
          </defs>

          {/* Orbit ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="rgba(208,188,255,0.08)"
            strokeWidth="1"
          />
          {/* Decorative inner rings */}
          <circle
            cx={CX}
            cy={CY}
            r={R * 0.55}
            fill="none"
            stroke="rgba(208,188,255,0.04)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R * 0.28}
            fill="none"
            stroke="rgba(208,188,255,0.06)"
            strokeWidth="1"
          />

          {/* Rotating group — single SVG transform updated via ref (no React state).
              Paths inside use BASE positions, so animateMotion paths stay stable. */}
          <g ref={rotGroupRef}>

          {/* ── 상극(剋) — inner pentagram dashed lines ── */}
          {SANGGEUK.map(([from, to]) => {
            const a = getPos(from);
            const b = getPos(to);
            const key = `${from}-${to}`;
            const isActive = activeSanggeuk.has(key);
            const notDimmed =
              hoveredId === null ||
              highlightedNodes.has(from) ||
              highlightedNodes.has(to);
            return (
              <line
                key={key}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={isActive ? 1.5 : 1}
                strokeDasharray="5 4"
                opacity={notDimmed ? (isActive ? 0.75 : 0.25) : 0.05}
                markerEnd={isActive ? "url(#arrow-sk)" : undefined}
                style={{ transition: "opacity 0.3s" }}
              />
            );
          })}

          {/* ── 상생(生) — flowing curved arcs ── */}
          {SANGSAENG.map(([from, to]) => {
            const a = getPos(from);
            const b = getPos(to);
            const key = `${from}-${to}`;
            const isActive = hoveredId === null || activeSangsaeng.has(key);
            const pathD = arcPath(a.x, a.y, b.x, b.y, CX, CY, 0.22);
            return (
              <g key={key}>
                {/* Glow blur layer */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={ELEMENTS.find((e) => e.id === from)!.color}
                  strokeWidth={4}
                  opacity={isActive ? 0.18 : 0.03}
                  strokeLinecap="round"
                  filter="url(#orbit-glow)"
                  style={{ transition: "opacity 0.3s" }}
                />
                {/* Main visible arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={`url(#grad-${from}-${to})`}
                  strokeWidth={
                    activeSangsaeng.has(key) ? 2.5 : isActive ? 1.5 : 0.8
                  }
                  opacity={
                    activeSangsaeng.has(key) ? 0.9 : isActive ? 0.45 : 0.07
                  }
                  strokeLinecap="round"
                  markerEnd={`url(#arrow-ss-${to})`}
                  style={{ transition: "opacity 0.3s, stroke-width 0.3s" }}
                />
              </g>
            );
          })}

          {/* ── Orbiting energy particles along 상생 arcs ── */}
          {!prefersReduced &&
            ELEMENTS.map((el, i) => {
              const nextEl = ELEMENTS[(i + 1) % 5];
              const key = `${el.id}-${nextEl.id}`;
              const visible =
                hoveredId === null || activeSangsaeng.has(key);
              return (
                <g
                  key={`particles-${el.id}`}
                  opacity={visible ? 0.9 : 0.08}
                  style={{ transition: "opacity 0.3s" }}
                >
                  {[0, 0.5].map((pOff) => (
                    <circle
                      key={pOff}
                      r="3"
                      fill={el.color}
                      opacity="0.9"
                      style={{
                        filter: `drop-shadow(0 0 4px ${el.color})`,
                      }}
                    >
                      <animateMotion
                        dur={`${4 + i * 0.4}s`}
                        repeatCount="indefinite"
                        begin={`${-((i / 5 + pOff) * (4 + i * 0.4))}s`}
                      >
                        <mpath href={`#particle-path-${el.id}`} />
                      </animateMotion>
                    </circle>
                  ))}
                </g>
              );
            })}

          {/* ── Element nodes ── */}
          {nodePositions.map((el) => {
            const dimmed = isDimmed(el.id);
            const highlighted = isHighlighted(el.id);
            const isHov = hoveredId === el.id;
            return (
              <g
                key={el.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredId(el.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Outer glow halo */}
                <circle
                  cx={el.pos.x}
                  cy={el.pos.y}
                  r={isHov ? NODE_R + 16 : NODE_R + 10}
                  fill={el.color}
                  opacity={dimmed ? 0.02 : isHov ? 0.15 : 0.06}
                  style={{
                    filter: `blur(${isHov ? 12 : 6}px)`,
                    transition: "opacity 0.3s",
                  }}
                />
                {/* Mid dashed ring */}
                <circle
                  cx={el.pos.x}
                  cy={el.pos.y}
                  r={isHov ? NODE_R + 8 : NODE_R + 4}
                  fill="none"
                  stroke={el.color}
                  strokeWidth="1"
                  opacity={
                    dimmed ? 0.06 : highlighted ? (isHov ? 0.6 : 0.25) : 0.1
                  }
                  strokeDasharray={isHov ? undefined : "3 4"}
                  style={{ transition: "all 0.3s" }}
                />
                {/* Node circle */}
                <circle
                  cx={el.pos.x}
                  cy={el.pos.y}
                  r={isHov ? NODE_R + 4 : NODE_R}
                  fill={isHov ? el.color : "#0e0e13"}
                  stroke={el.color}
                  strokeWidth={isHov ? 2.5 : 1.5}
                  opacity={dimmed ? 0.15 : 1}
                  filter={isHov ? `url(#glow-${el.id})` : undefined}
                  style={{ transition: "all 0.25s ease-out" }}
                />
                {/* Text labels — counter-rotated via ref so they stay upright */}
                <g
                  ref={(g) => {
                    if (g) nodeTextRefs.current.set(el.id, g);
                    else nodeTextRefs.current.delete(el.id);
                  }}
                >
                  {/* Hanja */}
                  <text
                    x={el.pos.x}
                    y={el.pos.y - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={
                      isHov
                        ? el.id === "토"
                          ? "#1a0f00"
                          : "#ffffff"
                        : el.color
                    }
                    fontSize={isHov ? "22" : "20"}
                    fontWeight="700"
                    fontFamily="'Noto Serif KR', 'Nanum Myeongjo', serif"
                    opacity={dimmed ? 0.2 : 1}
                    style={{ transition: "all 0.25s", pointerEvents: "none" }}
                  >
                    {el.hanja}
                  </text>
                  {/* Korean name */}
                  <text
                    x={el.pos.x}
                    y={el.pos.y + 14}
                    textAnchor="middle"
                    fill={
                      isHov
                        ? el.id === "토"
                          ? "rgba(26,15,0,0.8)"
                          : "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.4)"
                    }
                    fontSize="10"
                    fontFamily="'Pretendard', sans-serif"
                    opacity={dimmed ? 0.15 : 1}
                    style={{ transition: "all 0.25s", pointerEvents: "none" }}
                  >
                    {el.name}
                  </text>
                </g>
              </g>
            );
          })}

          </g>{/* /rotating group */}

          {/* Center dot */}
          <circle
            cx={CX}
            cy={CY}
            r="6"
            fill="rgba(208,188,255,0.3)"
            style={{ filter: "blur(2px)" }}
          />
          <circle cx={CX} cy={CY} r="3" fill="#d0bcff" opacity="0.8" />
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredEl && (
            <motion.div
              key={hoveredEl.id}
              initial={{ opacity: 0, scale: 0.88, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 4 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                pointerEvents: "none",
                left: Math.min(localMouse.x + 16, SIZE - 160),
                top: Math.max(localMouse.y - 80, 0),
                background: "rgba(14,14,19,0.92)",
                border: `1px solid ${hoveredEl.color}55`,
                borderRadius: "12px",
                padding: "10px 14px",
                boxShadow: `0 0 20px ${hoveredEl.glow.replace("0.5", "0.25")}, 0 8px 24px rgba(0,0,0,0.5)`,
                backdropFilter: "blur(12px)",
                zIndex: 20,
                minWidth: "150px",
              }}
            >
              <div
                style={{
                  color: hoveredEl.color,
                  fontSize: "18px",
                  fontWeight: 700,
                  fontFamily: "serif",
                  lineHeight: 1.2,
                }}
              >
                {hoveredEl.hanja}{" "}
                <span style={{ fontSize: "13px", opacity: 0.8 }}>
                  ({hoveredEl.name})
                </span>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: "11px",
                  color: "rgba(228,225,233,0.7)",
                  lineHeight: 1.7,
                }}
              >
                {(() => {
                  const generates = SANGSAENG.find(
                    ([f]) => f === hoveredEl.id
                  )?.[1];
                  const generatedBy = SANGSAENG.find(
                    ([, t]) => t === hoveredEl.id
                  )?.[0];
                  const controls = SANGGEUK.find(
                    ([f]) => f === hoveredEl.id
                  )?.[1];
                  const controlledBy = SANGGEUK.find(
                    ([, t]) => t === hoveredEl.id
                  )?.[0];
                  const genEl = ELEMENTS.find((e) => e.id === generates);
                  const genByEl = ELEMENTS.find((e) => e.id === generatedBy);
                  const ctrlEl = ELEMENTS.find((e) => e.id === controls);
                  const ctrlByEl = ELEMENTS.find((e) => e.id === controlledBy);
                  return (
                    <>
                      {genEl && (
                        <div>
                          <span style={{ color: "#a8e6ab" }}>상생 → </span>
                          <span style={{ color: genEl.color }}>
                            {genEl.hanja} {genEl.name}
                          </span>
                        </div>
                      )}
                      {genByEl && (
                        <div>
                          <span style={{ color: "#a8e6ab" }}>← 상생 </span>
                          <span style={{ color: genByEl.color }}>
                            {genByEl.hanja} {genByEl.name}
                          </span>
                        </div>
                      )}
                      {ctrlEl && (
                        <div>
                          <span style={{ color: "#ff9999" }}>상극 → </span>
                          <span style={{ color: ctrlEl.color }}>
                            {ctrlEl.hanja} {ctrlEl.name}
                          </span>
                        </div>
                      )}
                      {ctrlByEl && (
                        <div>
                          <span style={{ color: "#ff9999" }}>← 상극 </span>
                          <span style={{ color: ctrlByEl.color }}>
                            {ctrlByEl.hanja} {ctrlByEl.name}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LandingHero({ isLoggedIn = false }: LandingHeroProps) {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  // Hover state lifted from OhaengDiagram so the cosmic backdrop can react
  const [panelHoveredId, setPanelHoveredId] = useState<ElementId | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const easing = "easeOut" as const;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easing },
    },
  };

  // 280vh tall scroll track (100vh when reduced-motion).
  // Pin holds for 180vh of scroll; scrub completes at 180vh (180vh = 1.8 * innerHeight),
  // so the page never scrolls past the hero until the full 150-frame scrub finishes.
  // NOTE: forced to 280vh regardless of reduced-motion preference so the pinned hero always runs.
  const trackHeight = "280vh";
  void prefersReduced;

  return (
    <>
      {/* ── Pinned hero scroll-scrub section ───────────────────────────────── */}
      <section
        aria-label="메인 히어로 섹션"
        style={{ height: trackHeight, position: "relative", marginTop: "-64px" }}
      >
        {/* Sticky pinned stage — fixed on screen during the 220vh scroll track */}
        <div
          className="sticky top-0 w-full overflow-hidden"
          style={{ height: "100vh" }}
        >
          {/* Video frame — full-width (width:100%/height:auto), no side crop */}
          <HeroFrameSequence />

          {/* Dark scrim — left-weighted so the left-aligned copy stays legible
              while the right portion of the video stays clearly visible */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,8,12,0.82) 0%, rgba(8,8,12,0.55) 38%, rgba(8,8,12,0.18) 64%, transparent 88%)," +
                "linear-gradient(180deg, rgba(8,8,12,0.45) 0%, rgba(8,8,12,0.20) 45%, rgba(8,8,12,0.55) 82%, #131318 100%)",
            }}
          />

          {/* Cosmic overlay */}
          <CosmicScene />

          {/* Hero content — left-aligned column on the stage's left side,
              max-width capped so the right portion of the video stays visible */}
          <div className="absolute inset-0 z-10 flex flex-col items-start justify-center px-8 sm:px-12 lg:px-20 xl:px-28">
            <motion.div
              className="text-left flex flex-col items-start w-full max-w-2xl"
              variants={containerVariants}
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
            >
              {/* Eyebrow label */}
              <motion.span
                variants={itemVariants}
                className="inline-flex items-center gap-2 mb-8"
              >
                <span
                  className="text-[#89ceff] tracking-[0.45em] uppercase text-[0.7rem] opacity-90"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  새로운 시대의 디지털 오라클
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#89ceff] opacity-60 animate-pulse" />
              </motion.span>

              {/* Main headline */}
              <motion.h1
                variants={itemVariants}
                className="font-extrabold leading-[0.9] tracking-tighter mb-10 text-left"
                style={{
                  fontSize: "clamp(3.4rem, 8vw, 7rem)",
                  fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif",
                  textShadow:
                    "0 0 80px rgba(208,188,255,0.35), 0 0 160px rgba(208,188,255,0.15)",
                }}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #d0bcff 40%, #89ceff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  천기
                </span>
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #d0bcff 0%, #a078ff 60%, #7040cc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  오라클
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-[#a8a0b8] max-w-xl mb-14 font-light leading-relaxed"
              >
                <span className="text-[#d0bcff] font-medium">고대의 지혜</span>와{" "}
                <span className="text-[#89ceff] font-medium">천체 연산</span>의 결합을 통해
                당신의 운명을 확인하세요.{" "}
                <span className="text-[#e4e1e9]/70">개인 맞춤형 운세 분석.</span>
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                {isLoggedIn ? (
                  <Link
                    href="/chat/charon_m"
                    className="group relative px-10 py-4 font-bold text-base rounded-2xl overflow-hidden flex items-center gap-3 transition-transform duration-200 hover:scale-[1.03]"
                    style={{
                      background:
                        "linear-gradient(135deg, #d0bcff 0%, #a078ff 60%, #7040cc 100%)",
                      color: "#1a0050",
                      boxShadow:
                        "0 0 40px rgba(208,188,255,0.3), 0 8px 32px rgba(160,120,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  >
                    <span className="relative z-10">분석 시작하기</span>
                    <svg
                      className="relative z-10"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3ZM12 9C13.1 9 14 9.9 14 11C14 12.1 13.1 13 12 13C10.9 13 10 12.1 10 11C10 9.9 10.9 9 12 9ZM7 17C7 15 9.24 13.5 12 13.5C14.76 13.5 17 15 17 17H7Z" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/chat/charon_m"
                      className="group relative px-10 py-4 font-bold text-base rounded-2xl overflow-hidden flex items-center gap-3 transition-transform duration-200 hover:scale-[1.03]"
                      style={{
                        background:
                          "linear-gradient(135deg, #d0bcff 0%, #a078ff 60%, #7040cc 100%)",
                        color: "#1a0050",
                        boxShadow:
                          "0 0 40px rgba(208,188,255,0.3), 0 8px 32px rgba(160,120,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <span className="relative z-10">분석 시작하기</span>
                      <svg
                        className="relative z-10"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Scroll cue */}
              <motion.div
                variants={itemVariants}
                className="mt-16 flex flex-col items-start gap-2 opacity-40"
              >
                <span
                  className="text-[0.65rem] uppercase tracking-widest text-[#958ea0]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  스크롤
                </span>
                <div
                  className="w-px h-8 bg-gradient-to-b from-[#d0bcff]/60 to-transparent"
                  style={{
                    animation: prefersReduced
                      ? "none"
                      : "scrollCueFloat 2.5s ease-in-out infinite",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 오행(五行) panel — revealed after scrolling past pinned hero ── */}
      <section
        aria-label="오행 시각화"
        style={{ background: "#0e0e13", padding: "80px 0 64px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mx-8 lg:mx-16 xl:mx-24 rounded-[2rem] overflow-hidden"
          style={{
            border: "1px solid rgba(208,188,255,0.12)",
            boxShadow:
              "0 0 80px rgba(208,188,255,0.08), 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
            background:
              "radial-gradient(ellipse 140% 80% at 20% 0%, rgba(160,120,255,0.18) 0%, transparent 55%)," +
              "radial-gradient(ellipse 100% 100% at 80% 100%, rgba(137,206,255,0.12) 0%, transparent 50%)," +
              "#0a0a0f",
          }}
        >
          {/* Panel header */}
          <div className="relative z-10 pt-10 pb-2 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-px bg-gradient-to-r from-[#d0bcff] to-transparent" />
              <span
                className="text-[#d0bcff] uppercase text-[0.65rem] tracking-[0.3em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                실시간 우주 동기화 중
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#89ceff] animate-pulse" />
              <span className="w-8 h-px bg-gradient-to-l from-[#d0bcff] to-transparent" />
            </div>
            <h3
              className="text-2xl md:text-3xl font-bold text-[#e4e1e9] text-center"
              style={{
                fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif",
                textShadow: "0 0 30px rgba(208,188,255,0.3)",
              }}
            >
              당신의 별의 길과 연결되고 있습니다
            </h3>
            <p
              className="text-sm text-[#958ea0] text-center mt-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              오행 상생·상극 — 원소 위에 마우스를 올려 관계를 탐색하세요
            </p>
          </div>

          {/* Living 오행 diagram with animated cosmic backdrop */}
          <div className="relative flex items-center justify-center py-8 px-4">
            <OhaengCosmos
              hoveredId={panelHoveredId}
              prefersReduced={prefersReduced ?? false}
            />
            <div className="relative z-10">
              <OhaengDiagram
                prefersReduced={prefersReduced ?? false}
                onHoverChange={setPanelHoveredId}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="relative z-10 pb-10 flex items-center justify-center gap-8 flex-wrap px-8">
            <div className="flex items-center gap-2">
              <svg width="32" height="12" viewBox="0 0 32 12">
                <defs>
                  <marker
                    id="leg-arrow-ss"
                    markerWidth="4"
                    markerHeight="4"
                    refX="3"
                    refY="2"
                    orient="auto"
                  >
                    <path d="M0,0 L4,2 L0,4 Z" fill="#66BB6A" />
                  </marker>
                </defs>
                <path
                  d="M 0 6 Q 16 2 32 6"
                  stroke="#66BB6A"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd="url(#leg-arrow-ss)"
                />
              </svg>
              <span
                className="text-[11px] text-[#a8a0b8]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                상생(生) 순환
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="32" height="12" viewBox="0 0 32 12">
                <line
                  x1="0"
                  y1="6"
                  x2="32"
                  y2="6"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
              </svg>
              <span
                className="text-[11px] text-[#a8a0b8]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                상극(剋) 관계
              </span>
            </div>
            <div className="flex items-center gap-2">
              {ELEMENTS.map((el) => (
                <span
                  key={el.id}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: el.color }}
                />
              ))}
              <span
                className="text-[11px] text-[#a8a0b8]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                木火土金水
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom fade into page background */}
      <div className="h-24 bg-gradient-to-b from-[#0e0e13] to-[#131318]" />
    </>
  );
}

