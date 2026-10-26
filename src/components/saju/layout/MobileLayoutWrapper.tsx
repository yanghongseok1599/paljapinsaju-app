'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SajuNavbar from '@/components/saju/landing/SajuNavbar';
import LoginSidebar from '@/components/saju/landing/LoginSidebar';
import type { CharacterType } from '@/lib/saju/characters';

interface MobileLayoutWrapperProps {
  isLoggedIn: boolean;
  sidebarUser: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | null;
  chatHistory: {
    id: string;
    character_id: CharacterType;
    character_name: string;
    character_avatar: string;
    title: string | null;
    reading_name: string;
    updated_at: string;
  }[];
  currentReading?: {
    id: string;
    characterId: CharacterType;
    name: string;
    gender: 'male' | 'female';
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number | null;
    isLunar: boolean;
    birthCity?: string;
  };
  totalCoins: number;
  isAdmin?: boolean;
  children: React.ReactNode;
}

export default function MobileLayoutWrapper({
  isLoggedIn,
  sidebarUser,
  chatHistory,
  currentReading,
  totalCoins,
  isAdmin = false,
  children,
}: MobileLayoutWrapperProps) {
  const searchParams = useSearchParams();
  const loginRequired = searchParams.get('login') === 'required';

  const [manualOpen, setManualOpen] = useState(false);
  const [autoDismissed, setAutoDismissed] = useState(false);

  // 로그인이 필요해 튕겨온 경우, 모바일에서는 사이드바가 숨겨져 있어
  // 안내도 로그인 버튼도 보이지 않는다. 그래서 자동으로 연다.
  // 단 한 번 닫으면 다시 열지 않는다 (URL의 login=required 는 계속 남아 있으므로).
  const autoOpen = loginRequired && !isLoggedIn && !autoDismissed;
  const sidebarOpen = manualOpen || autoOpen;

  const closeSidebar = () => {
    setManualOpen(false);
    setAutoDismissed(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#131318' }}>
      <SajuNavbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onMenuToggle={() => {
          if (sidebarOpen) { closeSidebar(); } else { setManualOpen(true); }
        }} />

      {/*
        로그인/프로필 패널.
        예전에는 왼쪽에 항상 펼쳐져 있어서 본문이 한쪽으로 밀렸다.
        이제 화면 크기와 관계없이 오른쪽 상단에서 열리는 패널로 통일한다.
      */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40" onClick={closeSidebar}>
          <div className="absolute inset-0 bg-[#131318]/60 backdrop-blur-sm" />
          <aside
            className="absolute right-0 top-16 max-h-[calc(100dvh-4.5rem)] w-72 overflow-y-auto flex flex-col rounded-bl-2xl animate-slide-in-right"
            style={{
              backgroundColor: '#0e0e13',
              borderLeft: '1px solid rgba(73,68,84,0.2)',
              borderBottom: '1px solid rgba(73,68,84,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <LoginSidebar
              user={sidebarUser}
              chatHistory={chatHistory}
              currentReading={currentReading}
              totalCoins={totalCoins}
              isMobile
            />
          </aside>
        </div>
      )}

      <div className="flex items-start pt-16">

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
