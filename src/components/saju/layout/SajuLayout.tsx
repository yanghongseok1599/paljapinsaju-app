import { createClient } from '@/utils/supabase/server';
import MobileLayoutWrapper from './MobileLayoutWrapper';
import { CHARACTERS, type CharacterType } from '@/lib/saju/characters';
import { cookies } from 'next/headers';
import { DEMO_AUTH_COOKIE, normalizeDemoAuth, type DemoAuth } from '@/lib/saju/demo-auth';

interface SajuLayoutProps {
  children: React.ReactNode;
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
}

export default async function SajuLayout({ children, currentReading }: SajuLayoutProps) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let demoAuth: DemoAuth | null = null;
  const demoAuthCookie = cookieStore.get(DEMO_AUTH_COOKIE)?.value;
  if (!user && demoAuthCookie) {
    try {
      // 쿠키에 저장된 표시 이름은 옛 값일 수 있어 현재 기준으로 맞춘다
      demoAuth = normalizeDemoAuth(
        JSON.parse(decodeURIComponent(demoAuthCookie)) as DemoAuth
      );
    } catch {
      demoAuth = null;
    }
  }

  // 로그인 유저면 대화 기록 조회
  let chatHistory: {
    id: string;
    character_id: CharacterType;
    character_name: string;
    character_avatar: string;
    title: string | null;
    reading_name: string;
    updated_at: string;
  }[] = [];
  let totalCoins = 0;

  if (user) {
    const { data: readings } = await supabase
      .from('saju_readings')
      .select('id, character_id, title, name, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (readings) {
      chatHistory = readings.map((r) => {
        const charId = (r.character_id || 'charon_m') as CharacterType;
        const char = CHARACTERS[charId as keyof typeof CHARACTERS] || CHARACTERS.charon_m;
        return {
          id: r.id,
          character_id: charId,
          character_name: char.name,
          character_avatar: char.avatar,
          title: (r as Record<string, unknown>).title as string | null,
          reading_name: (r as Record<string, unknown>).name as string,
          updated_at: r.updated_at,
        };
      });
    }

    // admin 체크
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
    const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

    if (isAdmin) {
      totalCoins = 99999;
    } else {
      // user_stars에서 잔액 조회
      let { data: stars } = await supabase
        .from('user_stars')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!stars) {
        await supabase.from('user_stars').insert({ user_id: user.id, balance: 3 });
        stars = { balance: 3 };
      }
      totalCoins = stars.balance;
    }
  }

  const ADMIN_EMAILS_LIST = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
  const isAdminUser = demoAuth?.email === 'admin' || (user?.email ? ADMIN_EMAILS_LIST.includes(user.email) : false);

  const sidebarUser = demoAuth
    ? {
        id: 'demo-admin',
        email: demoAuth.email,
        name: demoAuth.name,
      }
    : user
    ? {
        id: user.id,
        email: user.email ?? undefined,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined,
        avatar: user.user_metadata?.avatar_url ?? undefined,
      }
    : null;

  return (
    <MobileLayoutWrapper
      isLoggedIn={!!user || !!demoAuth}
      sidebarUser={sidebarUser}
      chatHistory={chatHistory}
      currentReading={currentReading}
      totalCoins={demoAuth ? 99999 : totalCoins}
      isAdmin={isAdminUser}
    >
      {children}
    </MobileLayoutWrapper>
  );
}
