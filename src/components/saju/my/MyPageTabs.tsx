"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import type {
  SajuReading,
  SajuCompatibility,
  ReadingStatus,
  CompatibilityStatus,
} from "@/types/saju";

// ─── Types ──────────────────────────────────────────────────────────────────

export type StarTransactionRow = {
  id: string;
  amount: number;
  balance_after: number | null;
  type: string;
  reading_id?: string | null;
  created_at: string;
};

export type ProfileSummary = {
  email: string | null;
  name: string | null;
  createdAt: string;
  starBalance: number;
};

type Props = {
  profile: ProfileSummary;
  readings: SajuReading[];
  compats: SajuCompatibility[];
  transactions: StarTransactionRow[];
};

// ─── Status & type mapping ──────────────────────────────────────────────────

const READING_STATUS_BADGE: Record<ReadingStatus, { label: string; cls: string }> = {
  pending:    { label: "대기",     cls: "bg-[#1f1f25] text-[#958ea0]" },
  preview:    { label: "미리보기", cls: "bg-[#1f1f25] text-[#958ea0]" },
  paid:       { label: "결제완료", cls: "bg-[#E8F3FF] text-[#3182F6]" },
  generating: { label: "분석중",   cls: "bg-[#FFF8E1] text-[#F59E0B]" },
  completed:  { label: "완료",     cls: "bg-[#E8F7EF] text-[#10B981]" },
  failed:     { label: "실패",     cls: "bg-[#FFF0F0] text-[#EF4444]" },
};

const COMPAT_STATUS_BADGE: Record<CompatibilityStatus, { label: string; cls: string }> = {
  pending:    { label: "대기",     cls: "bg-[#1f1f25] text-[#958ea0]" },
  paid:       { label: "결제완료", cls: "bg-[#E8F3FF] text-[#3182F6]" },
  generating: { label: "분석중",   cls: "bg-[#FFF8E1] text-[#F59E0B]" },
  completed:  { label: "완료",     cls: "bg-[#E8F7EF] text-[#10B981]" },
  failed:     { label: "실패",     cls: "bg-[#FFF0F0] text-[#EF4444]" },
};

const TX_TYPE_LABEL: Record<string, string> = {
  purchase:        "별 충전",
  signup_bonus:    "가입 보너스",
  referral_bonus:  "친구초대 보너스",
  invite_bonus:    "초대 보너스",
  saju_reading:    "사주 리포트",
  compatibility:   "궁합 리포트",
  zodiac_reading:  "별자리 운세",
  oracle_chat:     "오라클 채팅",
  refund:          "환불",
  admin_grant:     "관리자 지급",
  admin_revoke:    "관리자 차감",
};

function txLabel(t: string): string {
  return TX_TYPE_LABEL[t] ?? t;
}

function formatDate(s: string): string {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatBirth(y: number, m: number, d: number): string {
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

type TabKey = "readings" | "compats" | "transactions" | "profile";

export default function MyPageTabs({ profile, readings, compats, transactions }: Props) {
  const [tab, setTab] = useState<TabKey>("readings");

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "readings",     label: "사주 리포트",      count: readings.length },
    { key: "compats",      label: "궁합 리포트",      count: compats.length },
    { key: "transactions", label: "별 충전·사용 내역", count: transactions.length },
    { key: "profile",      label: "내 정보",          count: 0 },
  ];

  return (
    <div>
      {/* Profile summary card */}
      <ProfileCard profile={profile} />

      {/* Tab nav */}
      <div className="mt-8 border-b border-[rgba(208,188,255,0.12)]">
        <nav className="flex gap-1 overflow-x-auto -mb-px" role="tablist">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={[
                  "px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2",
                  active
                    ? "text-[#d0bcff] border-[#d0bcff]"
                    : "text-[#958ea0] border-transparent hover:text-[#d0bcff]/80",
                ].join(" ")}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-1.5 text-[11px] ${active ? "text-[#d0bcff]/80" : "text-[#958ea0]/70"}`}>
                    ({t.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tab === "readings" && <ReadingsTab readings={readings} />}
        {tab === "compats" && <CompatsTab compats={compats} />}
        {tab === "transactions" && <TransactionsTab transactions={transactions} />}
        {tab === "profile" && <ProfileTab profile={profile} />}
      </div>
    </div>
  );
}

// ─── Profile card ───────────────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: ProfileSummary }) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
      style={{ backgroundColor: "rgba(208,188,255,0.06)", border: "1px solid rgba(208,188,255,0.12)" }}
    >
      <div className="min-w-0">
        <p className="text-xs text-[#958ea0] mb-1">로그인 계정</p>
        <p className="text-base font-semibold text-[#e4e1e9] truncate">{profile.email ?? "—"}</p>
        <p className="text-xs text-[#958ea0] mt-1">
          가입일 {formatDate(profile.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-[#ffb95f]/80 mb-0.5">보유 별</p>
          <p className="text-2xl font-black text-[#ffb95f]">★ {profile.starBalance.toLocaleString("ko-KR")}</p>
        </div>
        <Link
          href="/coin-shop"
          className="inline-flex items-center h-10 px-4 rounded-xl bg-[#ffb95f]/15 hover:bg-[#ffb95f]/25 text-[#ffb95f] text-sm font-bold transition-colors"
        >
          충전하기
        </Link>
      </div>
    </div>
  );
}

// ─── Tab: Readings ──────────────────────────────────────────────────────────

function ReadingsTab({ readings }: { readings: SajuReading[] }) {
  if (readings.length === 0) {
    return (
      <EmptyState
        title="아직 분석한 사주가 없어요"
        sub="지금 바로 사주 분석을 시작해보세요"
        cta={{ href: "/", label: "사주 분석 시작" }}
      />
    );
  }
  return (
    <ul className="space-y-3">
      {readings.map((r) => {
        const badge = READING_STATUS_BADGE[r.status];
        return (
          <li key={r.id}>
            <Link
              href={`/reading/${r.id}`}
              className="block rounded-2xl p-5 transition-all border"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(73,68,84,0.3)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold truncate text-[#e4e1e9]">{r.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#958ea0]">
                    {formatBirth(r.birth_year, r.birth_month, r.birth_day)}
                    {r.is_lunar ? " (음력)" : " (양력)"}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0 text-[#958ea0]">{formatDate(r.created_at)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Tab: Compatibilities ──────────────────────────────────────────────────

function CompatsTab({ compats }: { compats: SajuCompatibility[] }) {
  if (compats.length === 0) {
    return (
      <EmptyState
        title="아직 궁합 분석이 없어요"
        sub="궁금한 상대와의 궁합을 확인해보세요"
        cta={{ href: "/compatibility", label: "궁합 보러가기" }}
      />
    );
  }
  return (
    <ul className="space-y-3">
      {compats.map((c) => {
        const badge = COMPAT_STATUS_BADGE[c.status];
        const score = c.analysis?.score;
        const target = c.status === "completed" ? `/compatibility/${c.id}` : "/compatibility";
        return (
          <li key={c.id}>
            <Link
              href={target}
              className="block rounded-2xl p-5 transition-all border"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(73,68,84,0.3)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-semibold truncate text-[#e4e1e9]">
                      <span className="text-[#958ea0]">상대:</span> {c.partner_name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                    {typeof score === "number" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#d0bcff]/10 text-[#d0bcff]">
                        {score}점
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#958ea0]">
                    {formatBirth(c.partner_birth_year, c.partner_birth_month, c.partner_birth_day)}
                    {c.partner_is_lunar ? " (음력)" : " (양력)"}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0 text-[#958ea0]">{formatDate(c.created_at)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Tab: Transactions ─────────────────────────────────────────────────────

function TransactionsTab({ transactions }: { transactions: StarTransactionRow[] }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="별 거래 내역이 없어요"
        sub="별을 충전하거나 리포트를 결제하면 이곳에 표시돼요"
        cta={{ href: "/coin-shop", label: "별 충전하기" }}
      />
    );
  }
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(73,68,84,0.3)" }}>
      <table className="w-full text-sm">
        <thead className="text-[#958ea0]" style={{ backgroundColor: "rgba(208,188,255,0.05)" }}>
          <tr>
            <th className="text-left px-4 py-3 font-medium">날짜</th>
            <th className="text-left px-4 py-3 font-medium">유형</th>
            <th className="text-right px-4 py-3 font-medium">변동</th>
            <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">잔액</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const isCredit = t.amount > 0;
            return (
              <tr key={t.id} className="border-t" style={{ borderColor: "rgba(73,68,84,0.2)" }}>
                <td className="px-4 py-3 text-[#958ea0] whitespace-nowrap">{formatDate(t.created_at)}</td>
                <td className="px-4 py-3 text-[#e4e1e9]">{txLabel(t.type)}</td>
                <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${isCredit ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  {isCredit ? "+" : ""}{t.amount.toLocaleString("ko-KR")} ★
                </td>
                <td className="px-4 py-3 text-right text-[#958ea0] hidden sm:table-cell whitespace-nowrap">
                  {t.balance_after !== null ? `${t.balance_after.toLocaleString("ko-KR")} ★` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab: Profile ───────────────────────────────────────────────────────────

function ProfileTab({ profile }: { profile: ProfileSummary }) {
  return (
    <div className="space-y-4">
      <Row label="이메일" value={profile.email ?? "—"} />
      {profile.name && <Row label="이름" value={profile.name} />}
      <Row label="가입일" value={formatDate(profile.createdAt)} />
      <Row label="보유 별" value={`★ ${profile.starBalance.toLocaleString("ko-KR")}`} />

      <div className="pt-4 border-t" style={{ borderColor: "rgba(73,68,84,0.3)" }}>
        <p className="text-xs text-[#958ea0] leading-relaxed">
          탈퇴·이메일 변경·환불 문의는 고객센터로 연락 주세요.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "rgba(73,68,84,0.2)" }}>
      <span className="text-sm text-[#958ea0]">{label}</span>
      <span className="text-sm font-semibold text-[#e4e1e9]">{value}</span>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({
  title, sub, cta,
}: {
  title: string;
  sub: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="text-center py-16">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "rgba(208,188,255,0.1)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B95A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      </div>
      <p className="font-semibold mb-1 text-[#e4e1e9]">{title}</p>
      <p className="text-sm mb-6 text-[#958ea0]">{sub}</p>
      <Link
        href={cta.href}
        className="inline-flex items-center justify-center h-11 px-7 bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl text-sm font-semibold transition-colors"
      >
        {cta.label}
      </Link>
    </div>
  );
}
