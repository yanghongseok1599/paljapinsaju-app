"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface ZodiacSign {
  id: string;
  nameKo: string;
  nameEn: string;
  symbol: string;
  dates: string;
  element: string;
  elementColor: string;
  traits: string[];
  luckyColor: string;
  luckyNumber: number;
  matchSign: string;
  description: string;
  stats: { label: string; value: number }[];
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: "aries",
    nameKo: "양자리",
    nameEn: "Aries",
    symbol: "♈",
    dates: "03.21 - 04.19",
    element: "불",
    elementColor: "#ef4444",
    traits: ["열정적", "독립적", "용감함"],
    luckyColor: "빨강",
    luckyNumber: 9,
    matchSign: "사자자리",
    description: "개척자적 에너지로 가득 찬 양자리. 당신은 새로운 도전을 두려워하지 않으며, 강한 의지력으로 목표를 향해 돌진합니다.",
    stats: [
      { label: "총 운세", value: 78 },
      { label: "연애운", value: 72 },
      { label: "재물운", value: 85 },
      { label: "건강운", value: 80 },
    ],
  },
  {
    id: "taurus",
    nameKo: "황소자리",
    nameEn: "Taurus",
    symbol: "♉",
    dates: "04.20 - 05.20",
    element: "흙",
    elementColor: "#10b981",
    traits: ["안정적", "인내심", "감각적"],
    luckyColor: "초록",
    luckyNumber: 6,
    matchSign: "처녀자리",
    description: "지속적인 노력으로 안정을 추구하는 황소자리. 감각적 쾌락과 물질적 풍요를 사랑하며, 한번 결심한 것은 반드시 이루어냅니다.",
    stats: [
      { label: "총 운세", value: 82 },
      { label: "연애운", value: 75 },
      { label: "재물운", value: 90 },
      { label: "건강운", value: 83 },
    ],
  },
  {
    id: "gemini",
    nameKo: "쌍둥이자리",
    nameEn: "Gemini",
    symbol: "♊",
    dates: "05.21 - 06.21",
    element: "바람",
    elementColor: "#d0bcff",
    traits: ["지적", "적응력", "소통"],
    luckyColor: "은색",
    luckyNumber: 5,
    matchSign: "천칭자리",
    description: "다재다능하고 호기심 넘치는 쌍둥이자리. 뛰어난 소통 능력으로 어디서든 사람들과 쉽게 어울리며, 끊임없이 새로운 아이디어를 탐구합니다.",
    stats: [
      { label: "총 운세", value: 75 },
      { label: "연애운", value: 80 },
      { label: "재물운", value: 70 },
      { label: "건강운", value: 75 },
    ],
  },
  {
    id: "cancer",
    nameKo: "게자리",
    nameEn: "Cancer",
    symbol: "♋",
    dates: "06.22 - 07.22",
    element: "물",
    elementColor: "#89ceff",
    traits: ["직관적", "배려심", "가정적"],
    luckyColor: "은백색",
    luckyNumber: 2,
    matchSign: "전갈자리",
    description: "깊은 감수성과 직관력으로 주변을 이해하는 게자리. 가족과 가까운 이들을 소중히 여기며, 강한 보호 본능을 가지고 있습니다.",
    stats: [
      { label: "총 운세", value: 73 },
      { label: "연애운", value: 88 },
      { label: "재물운", value: 68 },
      { label: "건강운", value: 72 },
    ],
  },
  {
    id: "leo",
    nameKo: "사자자리",
    nameEn: "Leo",
    symbol: "♌",
    dates: "07.23 - 08.22",
    element: "불",
    elementColor: "#ffb95f",
    traits: ["카리스마", "창의적", "리더십"],
    luckyColor: "금색",
    luckyNumber: 1,
    matchSign: "양자리",
    description: "왕의 기운을 뿜어내는 사자자리. 타고난 리더십과 창의성으로 주목받기를 즐기며, 진심 어린 따뜻함으로 주변을 이끌어 갑니다.",
    stats: [
      { label: "총 운세", value: 88 },
      { label: "연애운", value: 85 },
      { label: "재물운", value: 82 },
      { label: "건강운", value: 90 },
    ],
  },
  {
    id: "virgo",
    nameKo: "처녀자리",
    nameEn: "Virgo",
    symbol: "♍",
    dates: "08.23 - 09.22",
    element: "흙",
    elementColor: "#10b981",
    traits: ["분석적", "실용적", "완벽주의"],
    luckyColor: "갈색",
    luckyNumber: 4,
    matchSign: "황소자리",
    description: "세밀한 분석력과 완벽함을 추구하는 처녀자리. 논리적 사고와 실용적인 접근으로 어떤 문제든 체계적으로 해결하는 능력을 가집니다.",
    stats: [
      { label: "총 운세", value: 80 },
      { label: "연애운", value: 70 },
      { label: "재물운", value: 85 },
      { label: "건강운", value: 87 },
    ],
  },
  {
    id: "libra",
    nameKo: "천칭자리",
    nameEn: "Libra",
    symbol: "♎",
    dates: "09.23 - 10.23",
    element: "바람",
    elementColor: "#d0bcff",
    traits: ["균형", "외교적", "심미적"],
    luckyColor: "파스텔",
    luckyNumber: 7,
    matchSign: "쌍둥이자리",
    description: "아름다움과 균형을 추구하는 천칭자리. 탁월한 외교적 감각으로 갈등을 조화롭게 해결하며, 예술과 미에 대한 뛰어난 감각을 가집니다.",
    stats: [
      { label: "총 운세", value: 76 },
      { label: "연애운", value: 90 },
      { label: "재물운", value: 74 },
      { label: "건강운", value: 75 },
    ],
  },
  {
    id: "scorpio",
    nameKo: "전갈자리",
    nameEn: "Scorpio",
    symbol: "♏",
    dates: "10.24 - 11.21",
    element: "물",
    elementColor: "#89ceff",
    traits: ["강렬함", "직관력", "변혁"],
    luckyColor: "심홍",
    luckyNumber: 8,
    matchSign: "게자리",
    description: "깊고 강렬한 에너지를 가진 전갈자리. 날카로운 통찰력으로 진실을 꿰뚫어 보며, 한번 목표를 정하면 완벽하게 달성하는 집중력을 발휘합니다.",
    stats: [
      { label: "총 운세", value: 85 },
      { label: "연애운", value: 82 },
      { label: "재물운", value: 88 },
      { label: "건강운", value: 82 },
    ],
  },
  {
    id: "sagittarius",
    nameKo: "사수자리",
    nameEn: "Sagittarius",
    symbol: "♐",
    dates: "11.22 - 12.21",
    element: "불",
    elementColor: "#ef4444",
    traits: ["자유로움", "철학적", "모험심"],
    luckyColor: "보라",
    luckyNumber: 3,
    matchSign: "양자리",
    description: "무한한 자유와 지적 탐구를 사랑하는 사수자리. 낙관적인 에너지로 새로운 지평을 개척하며, 철학적 사고로 삶의 의미를 끊임없이 탐색합니다.",
    stats: [
      { label: "총 운세", value: 79 },
      { label: "연애운", value: 75 },
      { label: "재물운", value: 76 },
      { label: "건강운", value: 85 },
    ],
  },
  {
    id: "capricorn",
    nameKo: "염소자리",
    nameEn: "Capricorn",
    symbol: "♑",
    dates: "12.22 - 01.19",
    element: "흙",
    elementColor: "#10b981",
    traits: ["야망", "규율", "인내"],
    luckyColor: "흑색",
    luckyNumber: 10,
    matchSign: "황소자리",
    description: "꾸준한 노력으로 정상을 향해 오르는 염소자리. 강한 책임감과 야망으로 어떤 역경도 이겨내며, 장기적인 계획을 세우고 실현하는 능력이 탁월합니다.",
    stats: [
      { label: "총 운세", value: 84 },
      { label: "연애운", value: 68 },
      { label: "재물운", value: 92 },
      { label: "건강운", value: 80 },
    ],
  },
  {
    id: "aquarius",
    nameKo: "물병자리",
    nameEn: "Aquarius",
    symbol: "♒",
    dates: "01.20 - 02.18",
    element: "바람",
    elementColor: "#d0bcff",
    traits: ["혁신적", "인도주의", "독립적"],
    luckyColor: "전기블루",
    luckyNumber: 11,
    matchSign: "쌍둥이자리",
    description: "시대를 앞서가는 혁신가 물병자리. 독창적인 아이디어와 인도주의적 가치관으로 사회를 변화시키려 하며, 진정한 자유와 평등을 추구합니다.",
    stats: [
      { label: "총 운세", value: 77 },
      { label: "연애운", value: 72 },
      { label: "재물운", value: 78 },
      { label: "건강운", value: 79 },
    ],
  },
  {
    id: "pisces",
    nameKo: "물고기자리",
    nameEn: "Pisces",
    symbol: "♓",
    dates: "02.19 - 03.20",
    element: "물",
    elementColor: "#89ceff",
    traits: ["감수성", "공감능력", "영적"],
    luckyColor: "바다색",
    luckyNumber: 12,
    matchSign: "게자리",
    description: "꿈과 현실의 경계를 자유롭게 넘나드는 물고기자리. 깊은 공감 능력과 예술적 감수성으로 세상을 아름답게 바라보며, 영적 탐구를 즐깁니다.",
    stats: [
      { label: "총 운세", value: 74 },
      { label: "연애운", value: 86 },
      { label: "재물운", value: 65 },
      { label: "건강운", value: 71 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animated starfield canvas
// ---------------------------------------------------------------------------

interface Star {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
  drift: number;
  phase: number;
}

function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.00012 + 0.00004,
      opacity: Math.random() * 0.6 + 0.2,
      drift: (Math.random() - 0.5) * 0.00008,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.y -= s.speed;
        s.x += s.drift;
        if (s.y < 0) { s.y = 1; s.x = Math.random(); }
        if (s.x < 0 || s.x > 1) { s.x = Math.random(); }

        const twinkle = s.opacity * (0.7 + 0.3 * Math.sin(t * 0.04 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(208,188,255,${twinkle})`;
        ctx.fill();
      }

      t++;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Orbiting constellation symbols
// ---------------------------------------------------------------------------

const ORBIT_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function OrbitingSymbols() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ORBIT_SYMBOLS.map((sym, i) => {
        const angle = (i / ORBIT_SYMBOLS.length) * 360;
        const delay = i * 0.3;
        const radius = 48; // % of parent width, handled via transform
        return (
          <motion.span
            key={sym}
            className="absolute text-[#d0bcff] text-lg font-light select-none"
            style={{
              left: "50%",
              top: "50%",
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              rotate: [angle, angle + 360],
              x: [
                `calc(${Math.cos((angle * Math.PI) / 180) * radius}vw)`,
                `calc(${Math.cos(((angle + 360) * Math.PI) / 180) * radius}vw)`,
              ],
              y: [
                `calc(${Math.sin((angle * Math.PI) / 180) * radius * 0.35}vw)`,
                `calc(${Math.sin(((angle + 360) * Math.PI) / 180) * radius * 0.35}vw)`,
              ],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 30 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay,
            }}
          >
            {sym}
          </motion.span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animated hero section
// ---------------------------------------------------------------------------

function ZodiacHero() {
  return (
    <header className="relative overflow-hidden mb-14 rounded-3xl" style={{ minHeight: "340px" }}>
      {/* Dark background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0d0d14 0%, #131318 50%, #0a0a12 100%)",
        }}
      />

      {/* Starfield */}
      <StarfieldCanvas />

      {/* Orbiting symbols — subtle, large radius, slow */}
      <OrbitingSymbols />

      {/* Central glowing orb */}
      <motion.div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          width: "320px",
          height: "320px",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(208,188,255,0.12) 0%, rgba(137,206,255,0.06) 40%, transparent 70%)",
          filter: "blur(24px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Secondary violet orb — offset for depth */}
      <motion.div
        className="absolute"
        style={{
          left: "20%",
          top: "30%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(160,120,255,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Cyan orb — right side */}
      <motion.div
        className="absolute"
        style={{
          right: "15%",
          bottom: "20%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(137,206,255,0.08) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
        animate={{ x: [0, -15, 0], y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden="true"
      />

      {/* Glass overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(19,19,24,0.15) 0%, rgba(19,19,24,0.6) 100%)",
        }}
      />

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full px-10 py-16">
        <motion.span
          className="font-['Space_Grotesk'] text-[#89ceff] tracking-[0.3em] uppercase text-xs mb-5 block opacity-90"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          서양 점성술
        </motion.span>

        <motion.h1
          className="font-extrabold tracking-tighter mb-5"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif",
            lineHeight: 0.95,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          별자리{" "}
          <motion.span
            className="text-[#d0bcff] italic"
            animate={{ textShadow: ["0 0 20px rgba(208,188,255,0)", "0 0 40px rgba(208,188,255,0.5)", "0 0 20px rgba(208,188,255,0)"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            크리스탈
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg text-[#958ea0] max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          우주의 흐름을 읽고 당신의 운명을 발견하세요. 12개의 별자리가 전하는 미래의 메시지와 신비로운 조언을 지금 확인하실 수 있습니다.
        </motion.p>

        {/* Decorative constellation dots */}
        <motion.div
          className="mt-8 flex gap-2 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: i === 2 ? "8px" : "4px",
                height: i === 2 ? "8px" : "4px",
                backgroundColor: i === 2 ? "#d0bcff" : "rgba(208,188,255,0.4)",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ZodiacPageClientProps {
  isLoggedIn?: boolean;
  starBalance?: number;
  isAdmin?: boolean;
}

export default function ZodiacPageClient({
  isLoggedIn = false,
  starBalance = 0,
  isAdmin = false,
}: ZodiacPageClientProps) {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[2]); // Gemini default
  const [reading, setReading] = useState<string | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const [lastReadingSignId, setLastReadingSignId] = useState<string | null>(null);

  // Reset reading when sign changes (so user can re-request for the new sign)
  // We intentionally keep the reading visible until user explicitly requests a new one.
  const handleSignSelect = (sign: ZodiacSign) => {
    setSelectedSign(sign);
    if (sign.id !== lastReadingSignId) {
      setReading(null);
      setReadingError(null);
    }
  };

  const handleGetReading = async () => {
    setLoadingReading(true);
    setReadingError(null);
    setReading(null);

    try {
      const res = await fetch("/api/zodiac/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signId: selectedSign.id }),
      });

      const data = (await res.json()) as { reading?: string; error?: string };

      if (!res.ok) {
        if (data.error === "insufficient_stars") {
          setReadingError("insufficient_stars");
        } else if (data.error === "rate_limited") {
          setReadingError("잠시 후 다시 시도해 주세요.");
        } else {
          setReadingError("리딩 생성에 실패했어요. 다시 시도해 주세요.");
        }
        return;
      }

      setReading(data.reading ?? "");
      setLastReadingSignId(selectedSign.id);
    } catch {
      setReadingError("네트워크 오류가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setLoadingReading(false);
    }
  };

  const canAfford = isAdmin || starBalance >= 3;

  return (
    <div className="pt-24 pb-24 px-6 max-w-7xl mx-auto w-full">
      {/* Animated hero */}
      <ZodiacHero />

      {/* Zodiac Grid — 6×2 bento */}
      <section className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-16" aria-label="별자리 선택">
        {ZODIAC_SIGNS.map((sign) => {
          const isActive = selectedSign.id === sign.id;
          return (
            <button
              key={sign.id}
              onClick={() => handleSignSelect(sign)}
              className="group relative aspect-square rounded-xl overflow-hidden transition-all duration-500"
              style={{
                background: "rgba(31,31,37,0.6)",
                backdropFilter: "blur(20px)",
                border: isActive
                  ? "1px solid rgba(208,188,255,0.4)"
                  : "1px solid rgba(73,68,84,0.15)",
                boxShadow: isActive ? "0 0 30px -5px rgba(208,188,255,0.25)" : "none",
              }}
              aria-pressed={isActive}
              aria-label={`${sign.nameKo} 선택`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#131318] via-transparent to-transparent opacity-70" />
              <div className="absolute inset-0 p-3 flex flex-col justify-end items-start">
                <span className="font-['Space_Grotesk'] text-[#d0bcff] text-[9px] uppercase tracking-widest mb-0.5 opacity-80">
                  {sign.dates}
                </span>
                <h3 className="text-sm font-bold text-[#e4e1e9]">{sign.nameKo}</h3>
              </div>
              <div
                className="absolute top-3 right-3 text-2xl opacity-25 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                {sign.symbol}
              </div>
            </button>
          );
        })}
      </section>

      {/* Selected zodiac detail — two-column layout */}
      {selectedSign && (
        <section
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          aria-label={`${selectedSign.nameKo} 상세 정보`}
        >
          {/* Left — identity card */}
          <div className="glass-panel rounded-3xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-6xl mb-4" aria-hidden="true">
                  {selectedSign.symbol}
                </div>
                <h2
                  className="text-4xl font-bold mb-1"
                  style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
                >
                  {selectedSign.nameKo}
                </h2>
                <p className="font-['Space_Grotesk'] text-[#d0bcff] text-xs uppercase tracking-widest">
                  {selectedSign.nameEn} · {selectedSign.dates}
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-['Space_Grotesk'] uppercase tracking-wide font-bold"
                style={{
                  backgroundColor: `${selectedSign.elementColor}20`,
                  color: selectedSign.elementColor,
                  border: `1px solid ${selectedSign.elementColor}40`,
                }}
              >
                {selectedSign.element}
              </div>
            </div>

            <p className="text-[#cbc3d7] leading-relaxed mb-8 text-sm">{selectedSign.description}</p>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedSign.traits.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(208,188,255,0.1)",
                    border: "1px solid rgba(208,188,255,0.2)",
                    color: "#d0bcff",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Lucky elements */}
            <div className="grid grid-cols-3 gap-4">
              <LuckyItem label="행운의 색" value={selectedSign.luckyColor} icon="🎨" />
              <LuckyItem label="행운의 숫자" value={String(selectedSign.luckyNumber)} icon="✦" />
              <LuckyItem label="찰떡 별자리" value={selectedSign.matchSign} icon="♡" />
            </div>
          </div>

          {/* Right — stat bars + AI reading CTA */}
          <div className="glass-panel rounded-3xl p-8">
            <h3
              className="text-xl font-bold mb-6"
              style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
            >
              이번 달 운세 지수
            </h3>

            <div className="space-y-6 mb-10">
              {selectedSign.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#cbc3d7]">{stat.label}</span>
                    <span className="font-['Space_Grotesk'] text-[#d0bcff] font-bold text-sm">
                      {stat.value}%
                    </span>
                  </div>
                  <div className="fortune-bar">
                    <div
                      className="fortune-bar-fill"
                      style={{ width: `${stat.value}%` }}
                      role="progressbar"
                      aria-valuenow={stat.value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Reading CTA */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, rgba(208,188,255,0.08) 0%, rgba(160,120,255,0.05) 100%)",
                border: "1px solid rgba(208,188,255,0.15)",
              }}
            >
              <p className="text-sm font-bold text-[#d0bcff] mb-1">월간 AI 리딩</p>
              <p className="text-xs text-[#958ea0] mb-4 leading-relaxed">
                월간 상세 예보 · 행성 배치 분석 · AI 맞춤 조언
              </p>

              {!isLoggedIn ? (
                <Link
                  href="/chat/charon_m"
                  className="inline-block px-5 py-2.5 oracle-gradient font-bold text-sm rounded-xl hover:-translate-y-0.5 transition-transform"
                >
                  로그인하고 무료 체험하기
                </Link>
              ) : !canAfford ? (
                <div className="space-y-2">
                  <p className="text-xs text-[#958ea0]">별이 부족해요 (필요: ★ 3개)</p>
                  <Link
                    href="/coin-shop"
                    className="inline-block px-5 py-2.5 oracle-gradient font-bold text-sm rounded-xl hover:-translate-y-0.5 transition-transform"
                  >
                    별 충전하기
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleGetReading}
                  disabled={loadingReading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 oracle-gradient font-bold text-sm rounded-xl hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loadingReading ? (
                    <>
                      <span className="animate-spin text-base">✦</span>
                      <span>리딩 생성 중...</span>
                    </>
                  ) : isAdmin ? (
                    "관리자 무료 · 월간 AI 리딩 받기"
                  ) : (
                    `★ 별 3개 · 월간 AI 리딩 받기`
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AI Reading result card */}
      <AnimatePresence mode="wait">
        {(reading || readingError === "insufficient_stars" || (readingError && readingError !== "insufficient_stars")) && (
          <motion.section
            key={lastReadingSignId ?? "error"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="glass-panel rounded-3xl p-8 mb-16"
            aria-label={`${selectedSign.nameKo} AI 월간 리딩`}
          >
            {reading && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl" aria-hidden="true">{selectedSign.symbol}</span>
                  <div>
                    <span className="font-['Space_Grotesk'] text-[#d0bcff] text-xs uppercase tracking-widest block">
                      AI 월간 리딩
                    </span>
                    <h3
                      className="text-xl font-bold"
                      style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
                    >
                      {selectedSign.nameKo}의 이번 달 흐름
                    </h3>
                  </div>
                </div>
                <p className="text-[#cbc3d7] leading-relaxed whitespace-pre-line text-sm">
                  {reading}
                </p>
              </>
            )}

            {readingError === "insufficient_stars" && (
              <div className="text-center py-4">
                <p className="text-[#958ea0] text-sm mb-4">별이 부족해서 리딩을 생성할 수 없었어요.</p>
                <Link
                  href="/coin-shop"
                  className="inline-block px-6 py-2.5 oracle-gradient font-bold text-sm rounded-xl hover:scale-105 transition-transform"
                >
                  별 충전하러 가기
                </Link>
              </div>
            )}

            {readingError && readingError !== "insufficient_stars" && (
              <p className="text-[#958ea0] text-sm text-center py-4">{readingError}</p>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Monthly preview teaser — only shown when no reading yet */}
      {!reading && !loadingReading && (
        <section
          className="glass-panel rounded-3xl p-8 text-center"
          aria-label="월간 별자리 예보"
        >
          <span className="font-['Space_Grotesk'] text-[#d0bcff] text-xs uppercase tracking-widest mb-3 block">
            월간 예보
          </span>
          <h3
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
          >
            {selectedSign.nameKo}의 이번 달 흐름
          </h3>
          <p className="text-[#958ea0] text-sm max-w-lg mx-auto leading-relaxed mb-6">
            AI 리딩을 통해 행성의 영향, 주간별 에너지 흐름, 맞춤 조언을 확인하세요. 당신의{" "}
            {selectedSign.nameKo}가 이번 달 가장 빛나는 순간을 찾아드립니다.
          </p>
          {!isLoggedIn ? (
            <Link
              href="/chat/charon_m"
              className="inline-block px-8 py-3 oracle-gradient font-bold rounded-2xl hover:scale-105 transition-transform text-sm"
            >
              로그인하고 무료 체험하기
            </Link>
          ) : canAfford ? (
            <button
              onClick={handleGetReading}
              disabled={loadingReading}
              className="inline-flex items-center gap-2 px-8 py-3 oracle-gradient font-bold rounded-2xl hover:scale-105 transition-transform text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isAdmin ? "관리자 무료 · 월간 AI 리딩 받기" : "★ 별 3개 · 월간 AI 리딩 받기"}
            </button>
          ) : (
            <Link
              href="/coin-shop"
              className="inline-block px-8 py-3 oracle-gradient font-bold rounded-2xl hover:scale-105 transition-transform text-sm"
            >
              별 충전하기
            </Link>
          )}
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function LuckyItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{ backgroundColor: "rgba(31,31,37,0.8)", border: "1px solid rgba(73,68,84,0.2)" }}
    >
      <div className="text-xl mb-1" aria-hidden="true">{icon}</div>
      <p className="font-['Space_Grotesk'] text-[#d0bcff] text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="font-bold text-sm text-[#e4e1e9]">{value}</p>
    </div>
  );
}
