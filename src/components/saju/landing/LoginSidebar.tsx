'use client';

import { useState, useTransition } from 'react';
import {
  loginWithGoogle,
  loginWithKakao,
  logout,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
} from '@/services/auth/actions';
import { updateReadingBirthInfo } from '@/services/saju/actions';
import { deleteReading } from '@/services/saju/chat-actions';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { CHARACTER_LIST, type CharacterType } from '@/lib/saju/characters';
import { DEMO_TEST_EMAIL, DEMO_TEST_PASSWORD } from '@/lib/saju/demo-auth';

interface ChatHistoryItem {
  id: string;
  character_id: CharacterType;
  character_name: string;
  character_avatar: string;
  title: string | null;
  reading_name: string;
  updated_at: string;
}

interface CurrentReading {
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
}

interface LoginSidebarProps {
  user?: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | null;
  chatHistory?: ChatHistoryItem[];
  currentReading?: CurrentReading;
  totalCoins?: number;
  isAdmin?: boolean;
  isMobile?: boolean;
}

const SIJI_LABELS: Record<number, string> = {
  23: '자시', 0: '자시', 1: '축시', 2: '축시', 3: '인시', 4: '인시',
  5: '묘시', 6: '묘시', 7: '진시', 8: '진시', 9: '사시', 10: '사시',
  11: '오시', 12: '오시', 13: '미시', 14: '미시', 15: '신시', 16: '신시',
  17: '유시', 18: '유시', 19: '술시', 20: '술시', 21: '해시', 22: '해시',
};

const SIJI_OPTIONS = [
  { value: 'unknown', label: '모름' },
  { value: 'ja', label: '자시 (23:00~01:00)' },
  { value: 'chuk', label: '축시 (01:00~03:00)' },
  { value: 'in', label: '인시 (03:00~05:00)' },
  { value: 'myo', label: '묘시 (05:00~07:00)' },
  { value: 'jin', label: '진시 (07:00~09:00)' },
  { value: 'sa', label: '사시 (09:00~11:00)' },
  { value: 'o', label: '오시 (11:00~13:00)' },
  { value: 'mi', label: '미시 (13:00~15:00)' },
  { value: 'sin', label: '신시 (15:00~17:00)' },
  { value: 'yu', label: '유시 (17:00~19:00)' },
  { value: 'sul', label: '술시 (19:00~21:00)' },
  { value: 'hae', label: '해시 (21:00~23:00)' },
];

const SIJI_TO_HOUR: Record<string, number | null> = {
  unknown: null, ja: 23, chuk: 1, in: 3, myo: 5, jin: 7, sa: 9,
  o: 11, mi: 13, sin: 15, yu: 17, sul: 19, hae: 21,
};

const HOUR_TO_SIJI: Record<number, string> = {
  23: 'ja', 0: 'ja', 1: 'chuk', 2: 'chuk', 3: 'in', 4: 'in',
  5: 'myo', 6: 'myo', 7: 'jin', 8: 'jin', 9: 'sa', 10: 'sa',
  11: 'o', 12: 'o', 13: 'mi', 14: 'mi', 15: 'sin', 16: 'sin',
  17: 'yu', 18: 'yu', 19: 'sul', 20: 'sul', 21: 'hae', 22: 'hae',
};

export default function LoginSidebar({ user, chatHistory = [], currentReading, totalCoins, isMobile = false }: LoginSidebarProps) {
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [isPendingGoogle, startGoogle] = useTransition();
  const [isPendingKakao, startKakao] = useTransition();

  // 이메일 가입/로그인 상태
  const [emailMode, setEmailMode] = useState<'closed' | 'signin' | 'signup' | 'forgot'>('closed');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [isPendingEmail, startEmail] = useTransition();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);
    const email = emailValue.trim();
    const password = passwordValue;
    const isDemoSignin =
      emailMode === 'signin' &&
      email === DEMO_TEST_EMAIL &&
      password === DEMO_TEST_PASSWORD;

    // 클라이언트 검증
    if (!email || (!email.includes('@') && email !== DEMO_TEST_EMAIL)) {
      setEmailMsg({ kind: 'error', text: '올바른 이메일을 입력해주세요.' });
      return;
    }
    if (emailMode !== 'forgot' && !isDemoSignin) {
      if (password.length < 8) {
        setEmailMsg({ kind: 'error', text: '비밀번호는 최소 8자입니다.' });
        return;
      }
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        setEmailMsg({ kind: 'error', text: '비밀번호에 영문과 숫자를 포함해주세요.' });
        return;
      }
    }

    startEmail(async () => {
      if (emailMode === 'signup') {
        const res = await signUpWithEmail(email, password);
        if (res?.error) {
          setEmailMsg({ kind: 'error', text: res.error });
        } else {
          setEmailMsg({ kind: 'ok', text: '확인 이메일을 보냈어요. 메일함을 확인하세요.' });
          setEmailValue('');
          setPasswordValue('');
        }
      } else if (emailMode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res?.error) {
          setEmailMsg({ kind: 'error', text: res.error });
        } else {
          window.location.reload();
        }
      } else if (emailMode === 'forgot') {
        const res = await sendPasswordReset(email);
        if (res?.error) {
          setEmailMsg({ kind: 'error', text: res.error });
        } else {
          setEmailMsg({ kind: 'ok', text: '비번 재설정 메일을 보냈어요.' });
        }
      }
    });
  };
  const [isEditing, setIsEditing] = useState(false);
  const initEditLast = currentReading?.name ? (currentReading.name.length >= 2 ? currentReading.name.slice(0, 1) : '') : '';
  const initEditFirst = currentReading?.name ? (currentReading.name.length >= 2 ? currentReading.name.slice(1) : currentReading.name) : '';
  const [editLastName, setEditLastName] = useState(initEditLast);
  const [editFirstName, setEditFirstName] = useState(initEditFirst);
  const editName = `${editLastName}${editFirstName}`.trim();
  const [editYear, setEditYear] = useState(currentReading?.birthYear?.toString() ?? '');
  const [editMonth, setEditMonth] = useState(currentReading?.birthMonth?.toString() ?? '');
  const [editDay, setEditDay] = useState(currentReading?.birthDay?.toString() ?? '');
  const [editTime, setEditTime] = useState(currentReading?.birthHour != null ? (HOUR_TO_SIJI[currentReading.birthHour] ?? 'unknown') : 'unknown');
  const [editGender, setEditGender] = useState<'male' | 'female'>(currentReading?.gender ?? 'male');
  const [editCalendar, setEditCalendar] = useState<'solar' | 'lunar'>(currentReading?.isLunar ? 'lunar' : 'solar');
  const [editCity, setEditCity] = useState(currentReading?.birthCity ?? '서울');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleSaveEdit = async () => {
    if (!currentReading) return;
    if (!editName.trim()) { setEditError('이름을 입력해주세요'); return; }
    if (!editYear || Number(editYear) < 1940 || Number(editYear) > 2025) { setEditError('올바른 년도를 입력해주세요'); return; }
    if (!editMonth || Number(editMonth) < 1 || Number(editMonth) > 12) { setEditError('올바른 월을 입력해주세요'); return; }
    if (!editDay || Number(editDay) < 1 || Number(editDay) > 31) { setEditError('올바른 일을 입력해주세요'); return; }

    setIsSaving(true);
    setEditError(null);

    const { error } = await updateReadingBirthInfo(currentReading.id, {
      name: editName.trim(),
      gender: editGender,
      birthYear: Number(editYear),
      birthMonth: Number(editMonth),
      birthDay: Number(editDay),
      birthHour: SIJI_TO_HOUR[editTime] ?? null,
      isLunar: editCalendar === 'lunar',
      birthCity: editCity,
    });

    if (error) {
      setEditError(error);
      setIsSaving(false);
      return;
    }

    window.location.reload();
  };

  return (
    <aside
      className={`${isMobile ? 'flex' : 'hidden lg:flex'} flex-col w-60 flex-shrink-0 ${isMobile ? '' : 'sticky top-16'} h-[calc(100vh-64px)] overflow-y-auto`}
      style={{ backgroundColor: '#0e0e13', borderRight: isMobile ? 'none' : '1px solid rgba(73,68,84,0.15)' }}
    >
      {!user ? (
        /* ── 비로그인 ── */
        <div className="flex flex-col px-5 pt-10 gap-3">
          <p className="text-sm font-semibold text-gray-200 text-center">로그인하고</p>
          <p className="text-xs text-gray-500 text-center -mt-2 mb-2">대화 기록을 저장하세요</p>

          <button
            type="button"
            disabled={isPendingGoogle || isPendingKakao || isPendingEmail}
            onClick={() => startGoogle(async () => { await loginWithGoogle('/'); })}
            className="w-full flex items-center justify-center gap-2 glass-panel rounded-xl py-3 text-sm font-semibold text-[#e4e1e9] transition-colors cursor-pointer hover:border-[rgba(208,188,255,0.2)] disabled:opacity-60"
          >
            {isPendingGoogle ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e4e1e9] border-t-transparent" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Google 로그인
          </button>

          <button
            type="button"
            disabled={isPendingGoogle || isPendingKakao || isPendingEmail}
            onClick={() => startKakao(async () => { await loginWithKakao('/'); })}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#FEE500', color: '#191600' }}
          >
            {isPendingKakao ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#191600] border-t-transparent" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#191600" aria-hidden="true">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.72 1.607 5.12 4.055 6.621L5.07 21.02a.25.25 0 0 0 .378.267L10.25 18.5A11.7 11.7 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
              </svg>
            )}
            카카오 로그인
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-[rgba(73,68,84,0.3)]" />
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">또는</span>
            <div className="flex-1 h-px bg-[rgba(73,68,84,0.3)]" />
          </div>

          {emailMode === 'closed' ? (
            <button
              type="button"
              onClick={() => { setEmailMode('signin'); setEmailMsg(null); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-[#d0bcff] border border-[rgba(208,188,255,0.3)] hover:bg-[#d0bcff]/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              이메일로 시작하기
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
              <p className="text-xs font-bold text-[#d0bcff] text-center">
                {emailMode === 'signup' && '이메일 회원가입'}
                {emailMode === 'signin' && '이메일 로그인'}
                {emailMode === 'forgot' && '비밀번호 재설정'}
              </p>

              {emailMode === 'signin' && (
                <p className="rounded-lg border border-[rgba(208,188,255,0.2)] bg-[rgba(208,188,255,0.08)] px-2.5 py-2 text-[11px] leading-relaxed text-[#d0bcff]">
                  테스트 계정: admin / 1111
                </p>
              )}

              <input
                type="text"
                inputMode="text"
                autoComplete="email"
                placeholder="이메일 또는 테스트 아이디"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                disabled={isPendingEmail}
                className="w-full rounded-lg bg-[#131318] border border-[rgba(73,68,84,0.3)] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-[#d0bcff]/50 focus:outline-none disabled:opacity-60"
                required
              />

              {emailMode !== 'forgot' && (
                <input
                  type="password"
                  autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="비밀번호 (8자 이상, 영문+숫자)"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  disabled={isPendingEmail}
                  className="w-full rounded-lg bg-[#131318] border border-[rgba(73,68,84,0.3)] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-[#d0bcff]/50 focus:outline-none disabled:opacity-60"
                  required
                  minLength={emailMode === 'signin' ? 1 : 8}
                />
              )}

              {emailMsg && (
                <p
                  className={`text-[11px] leading-relaxed rounded-lg px-2.5 py-2 ${
                    emailMsg.kind === 'error'
                      ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}
                >
                  {emailMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={isPendingEmail}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-[#3c0091] oracle-gradient hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPendingEmail && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#3c0091] border-t-transparent" />
                )}
                {emailMode === 'signup' && '회원가입'}
                {emailMode === 'signin' && '로그인'}
                {emailMode === 'forgot' && '재설정 메일 보내기'}
              </button>

              <div className="flex flex-col gap-1 mt-1">
                {emailMode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => { setEmailMode('signin'); setEmailMsg(null); }}
                    className="text-[11px] text-gray-400 hover:text-[#d0bcff] transition-colors"
                  >
                    이미 회원이세요? <span className="underline">로그인</span>
                  </button>
                )}
                {emailMode === 'signin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setEmailMode('signup'); setEmailMsg(null); }}
                      className="text-[11px] text-gray-400 hover:text-[#d0bcff] transition-colors"
                    >
                      처음이세요? <span className="underline">회원가입</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmailMode('forgot'); setEmailMsg(null); setPasswordValue(''); }}
                      className="text-[11px] text-gray-500 hover:text-[#d0bcff] transition-colors"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </>
                )}
                {emailMode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => { setEmailMode('signin'); setEmailMsg(null); }}
                    className="text-[11px] text-gray-400 hover:text-[#d0bcff] transition-colors"
                  >
                    ← 로그인으로 돌아가기
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setEmailMode('closed'); setEmailMsg(null); setEmailValue(''); setPasswordValue(''); }}
                  className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          <div className="w-full border-t border-[rgba(73,68,84,0.2)] mt-4 pt-4">
            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              가입하면 ★ 3개를 무료로 드려요
            </p>
          </div>
        </div>
      ) : (
        /* ── 로그인 상태 ── */
        <div className="flex flex-col h-full">
          {/* 유저 정보 */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-[rgba(73,68,84,0.2)]">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt=""
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#d0bcff]/15 flex items-center justify-center">
                <span className="text-xs font-bold text-[#d0bcff]">
                  {(user.name || user.email || '?')[0]}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-200 truncate">
                {user.name || user.email}
              </p>
            </div>
          </div>

          {/* 코인 잔여량 */}
          {user && totalCoins !== undefined && (
            <Link href="/coin-shop" className="flex items-center gap-2 px-4 py-2 border-b border-[rgba(73,68,84,0.2)] hover:bg-[#1f1f25] transition-colors">
              <span className="text-yellow-400">&#9733;</span>
              <span className="text-sm text-gray-300">{totalCoins}개</span>
              <span className="text-xs text-gray-500 ml-auto">충전</span>
            </Link>
          )}

          {/* 종합 사주 리포트 CTA */}
          {currentReading && (
            <Link
              href="/saju-report"
              className="mx-3 mt-3 flex items-center gap-2.5 px-3 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-[#d0bcff]/50/30 hover:border-[#d0bcff]/50/50 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#d0bcff]/15 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#d0bcff] group-hover:text-purple-200 transition-colors">
                  나만의 사주 리포트
                </p>
                <p className="text-[10px] text-gray-500">
                  AI 종합 분석 PDF · &#9733; 10개
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}

          {/* 대화 기록 */}
          <div className="flex-1 px-3 pt-4">
            <div className="flex items-center justify-between px-1 mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                대화 기록
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowCharacterPicker(v => !v)}
                  className="text-[11px] text-[#d0bcff] hover:text-[#d0bcff] transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  새 대화
                </button>
                {showCharacterPicker && (
                  <div className="absolute right-0 top-6 z-50 w-48 bg-[#1b1b20] border border-[rgba(73,68,84,0.2)] rounded-xl shadow-2xl overflow-hidden">
                    {CHARACTER_LIST.map((char) => (
                      <Link
                        key={char.id}
                        href={`/chat/${char.id}?new=true`}
                        onClick={() => setShowCharacterPicker(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#2a292f] transition-colors"
                      >
                        <Image
                          src={char.avatar}
                          alt={char.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-200">{char.name}</p>
                          <p className="text-[10px] text-gray-500">{char.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {chatHistory.length === 0 ? (
              <p className="text-xs text-gray-500 px-1">
                아직 대화 기록이 없어요.
                <br />
                상담사를 선택해서 대화를 시작하세요!
              </p>
            ) : (
              <div className="space-y-1">
                {chatHistory.map((item) => (
                  <div key={item.id} className="group relative flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#1f1f25] transition-colors">
                    <a
                      href={`/ko/chat/${item.character_id}?r=${item.id}`}
                      className="flex items-center gap-2.5 min-w-0 flex-1"
                    >
                      <Image
                        src={item.character_avatar}
                        alt={item.character_name}
                        width={28}
                        height={28}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {item.title || `${item.character_name} · ${item.reading_name}`}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(item.updated_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </a>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!confirm('이 대화를 삭제할까요?')) return;
                        await deleteReading(item.id);
                        window.location.reload();
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
                      title="대화 삭제"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 사주 정보 설정 */}
          {currentReading && (
            <div className="px-3 pt-2 pb-2 border-t border-[rgba(73,68,84,0.2)]">
              <button
                onClick={() => setIsEditing((v) => !v)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#1f1f25] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-sm font-medium text-gray-200">사주 정보</span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                  className={`ml-auto transition-transform ${isEditing ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {!isEditing && (
                <div className="px-2 py-2 text-xs text-gray-500 space-y-0.5">
                  <p>{currentReading.name} · {currentReading.gender === 'male' ? '남' : '여'}</p>
                  <p>{currentReading.birthYear}.{currentReading.birthMonth}.{currentReading.birthDay} ({currentReading.isLunar ? '음력' : '양력'})</p>
                  <p>{currentReading.birthHour != null ? SIJI_LABELS[currentReading.birthHour] : '시간 모름'}</p>
                </div>
              )}

              {isEditing && (
                <div className="mt-2 space-y-3 px-1">
                  {editError && (
                    <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-2 py-1.5">{editError}</p>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold mb-1 block text-[#cac4d0]">이름</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="성"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="flex-[2] border border-[rgba(73,68,84,0.2)] bg-[#131318] rounded-lg px-2 py-2 text-center text-xs text-gray-200 focus:border-[#d0bcff]/50/50 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="이름"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="flex-[3] border border-[rgba(73,68,84,0.2)] bg-[#131318] rounded-lg px-2 py-2 text-xs text-gray-200 focus:border-[#d0bcff]/50/50 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold mb-1 block text-[#cac4d0]">생년월일</label>
                    <div className="flex gap-1">
                      <input type="number" inputMode="numeric" placeholder="1990" min={1940} max={2025}
                        value={editYear} onChange={(e) => setEditYear(e.target.value)}
                        className="flex-[2] border border-[rgba(73,68,84,0.2)] bg-[#131318] rounded-lg px-1.5 py-2 text-center text-xs text-gray-200 focus:border-[#d0bcff]/50/50 outline-none"
                      />
                      <input type="number" inputMode="numeric" placeholder="월" min={1} max={12}
                        value={editMonth} onChange={(e) => setEditMonth(e.target.value)}
                        className="flex-1 border border-[rgba(73,68,84,0.2)] bg-[#131318] rounded-lg px-1.5 py-2 text-center text-xs text-gray-200 focus:border-[#d0bcff]/50/50 outline-none"
                      />
                      <input type="number" inputMode="numeric" placeholder="일" min={1} max={31}
                        value={editDay} onChange={(e) => setEditDay(e.target.value)}
                        className="flex-1 border border-[rgba(73,68,84,0.2)] bg-[#131318] rounded-lg px-1.5 py-2 text-center text-xs text-gray-200 focus:border-[#d0bcff]/50/50 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold mb-1 block text-[#cac4d0]">태어난 시간</label>
                    <select
                      value={editTime} onChange={(e) => setEditTime(e.target.value)}
                      className="w-full border border-[rgba(73,68,84,0.2)] bg-[#131318] rounded-lg px-2.5 py-2 text-xs text-gray-200 focus:border-[#d0bcff]/50/50 outline-none"
                    >
                      {SIJI_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold mb-1 block text-[#cac4d0]">성별</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['male', 'female'] as const).map((g) => (
                        <button key={g} type="button" onClick={() => setEditGender(g)}
                          className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            editGender === g
                              ? 'border-[#d0bcff]/50 bg-[#d0bcff]/10 text-[#d0bcff]'
                              : 'border-[rgba(73,68,84,0.3)] text-[#cac4d0] hover:border-[rgba(208,188,255,0.3)]'
                          }`}
                        >
                          {g === 'male' ? '남' : '여'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold mb-1 block text-[#cac4d0]">달력</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['solar', 'lunar'] as const).map((c) => (
                        <button key={c} type="button" onClick={() => setEditCalendar(c)}
                          className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            editCalendar === c
                              ? 'border-[#d0bcff]/50 bg-[#d0bcff]/10 text-[#d0bcff]'
                              : 'border-[rgba(73,68,84,0.3)] text-[#cac4d0] hover:border-[rgba(208,188,255,0.3)]'
                          }`}
                        >
                          {c === 'solar' ? '양력' : '음력'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold mb-1 block text-[#cac4d0]">태어난 곳</label>
                    <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)}
                      className="w-full border border-[rgba(73,68,84,0.2)] bg-[#131318] rounded-lg px-2.5 py-2 text-xs text-gray-200 focus:border-[#d0bcff]/50/50 outline-none"
                    />
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-lg py-2 text-xs font-medium border border-[rgba(73,68,84,0.2)] text-[#cac4d0] hover:bg-[#1f1f25] transition-colors"
                    >
                      취소
                    </button>
                    <button onClick={handleSaveEdit} disabled={isSaving}
                      className="flex-1 rounded-lg py-2 text-xs font-medium oracle-gradient hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 하단: 유저 정보 + 로그아웃 */}
          <div className="mt-auto border-t border-[rgba(73,68,84,0.2)]">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                {user.avatar ? (
                  <Image src={user.avatar} alt="" width={28} height={28} className="rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#d0bcff]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#d0bcff]">
                      {(user.name || user.email || '?')[0]}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-300 truncate">
                    {user.name || '사용자'}
                  </p>
                  <p className="text-[10px] text-gray-600 truncate">
                    {user.email}
                  </p>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
                    title="로그아웃"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
