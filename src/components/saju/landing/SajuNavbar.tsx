"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { loginWithGoogle } from "@/services/auth/actions";
import ReferralSection from "@/components/saju/referral/ReferralSection";

interface SajuNavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onMenuToggle?: () => void;
}

export default function SajuNavbar({ isLoggedIn = false, isAdmin = false, onMenuToggle }: SajuNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  // Close mobile menu on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* ── Top navigation ── */}
      <nav
        className="fixed top-0 w-full z-50 bg-[#1f1f25]/70 backdrop-blur-xl shadow-[0_0_32px_rgba(208,188,255,0.06)] flex justify-between items-center px-8 py-4 max-w-full mx-auto"
        aria-label="메인 네비게이션"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black tracking-tighter text-[#d0bcff] uppercase font-['Pretendard'] hover:opacity-80 transition-opacity">
            팔자핀사주
          </Link>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 font-['Pretendard'] text-base tracking-tight">
          <NavLink href="/reading">오늘의 운세</NavLink>
          <NavLink href="/categories">고민별 상담</NavLink>
          <NavLink href="/zodiac">별자리</NavLink>
          <NavLink href="/compatibility">궁합</NavLink>
          <NavLink href="/chat/charon_m">오라클</NavLink>
          <NavLink href="/tarot">타로</NavLink>
        </div>

        {/* Mobile hamburger (hidden on md) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-[#d0bcff]"
          aria-label="메뉴 열기"
          aria-expanded={mobileMenuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <button className="text-slate-400 font-['Pretendard'] text-sm uppercase tracking-widest hover:text-[#d0bcff] transition-colors">KR / EN</button>
              <form action={async () => { await loginWithGoogle('/'); }}>
                <button type="submit" className="px-5 py-2 text-slate-400 font-medium hover:bg-[#d0bcff]/10 rounded-xl transition-all cursor-pointer">
                  로그인
                </button>
              </form>
              <form action={async () => { await loginWithGoogle('/'); }}>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#3c0091] font-bold rounded-xl scale-95 active:opacity-80 transition-transform cursor-pointer">
                  회원가입
                </button>
              </form>
            </>
          ) : (
            <>
              {isAdmin && (
                <Link href="/admin/analytics/overview" className="text-[11px] font-medium text-[#d0bcff] bg-[#d0bcff]/10 hover:bg-[#d0bcff]/20 transition-colors px-2.5 py-1.5 rounded-lg">
                  Admin
                </Link>
              )}
              <button
                onClick={() => setShowReferral(true)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#ffb95f] bg-[#ffb95f]/10 hover:bg-[#ffb95f]/20 transition-colors px-3 py-1.5 rounded-lg"
              >
                ★ 친구초대
              </button>
              <Link href="/coin-shop" className="flex items-center gap-1 text-sm text-[#ffb95f] hover:text-[#ffb95f]/80 transition-colors">
                ★ <span className="font-medium">충전</span>
              </Link>
              <Link
                href="/my-readings"
                className="text-sm font-medium text-slate-300 hover:text-[#d0bcff] transition-colors px-2.5 py-1.5 rounded-lg"
              >
                마이페이지
              </Link>
            </>
          )}

        </div>

        {/* 계정·대화기록 패널 열기 — 화면 크기와 무관하게 오른쪽 상단에 둔다 */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 text-[#cbc3d7] hover:text-[#d0bcff] transition-colors"
            aria-label={isLoggedIn ? '내 계정 열기' : '로그인 열기'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}
      </nav>

      {/* ── Mobile full-screen overlay menu ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] bg-[#131318]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          role="dialog"
          aria-modal="true"
          aria-label="모바일 메뉴"
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-[#d0bcff]"
            aria-label="메뉴 닫기"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <nav className="flex flex-col items-center gap-8" aria-label="모바일 네비게이션">
            {[
              { href: "/", label: "홈" },
              { href: "/reading", label: "오늘의 운세" },
              { href: "/categories", label: "고민별 상담" },
              { href: "/zodiac", label: "별자리" },
              { href: "/compatibility", label: "궁합" },
              { href: "/chat/charon_m", label: "오라클 채팅" },
              { href: "/tarot", label: "타로" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-bold text-white hover:text-[#d0bcff] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {!isLoggedIn && (
            <form action={async () => { await loginWithGoogle('/'); }} className="mt-4">
              <button type="submit" className="px-8 py-3 bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#3c0091] font-bold rounded-2xl text-base cursor-pointer">
                구글로 시작하기
              </button>
            </form>
          )}
        </div>
      )}

      {/* 친구 초대 모달 */}
      <ReferralSection isOpen={showReferral} onClose={() => setShowReferral(false)} />
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-slate-400 font-medium hover:text-[#d0bcff] hover:bg-[#d0bcff]/10 transition-all duration-300 px-3 py-1 rounded-lg"
    >
      {children}
    </Link>
  );
}
