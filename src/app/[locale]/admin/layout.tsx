import { requireAdminOrRedirect } from "@/utils/auth/adminGuard";
import { Link } from "@/i18n/routing";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminOrRedirect("/");

  return (
    <div className="min-h-screen bg-[#131318] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1a1a24] border-r border-[#d0bcff]/10 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[#d0bcff]/10">
          <Link
            href="/admin/analytics/overview"
            className="text-base font-bold text-[#d0bcff] tracking-tight"
          >
            ⭐ 관리자
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="관리자 메뉴">
          <NavSection label="애널리틱스">
            <NavItem href="/admin/analytics/overview" label="개요" icon="📊" />
            <NavItem href="/admin/analytics/traffic" label="트래픽" icon="🌐" />
            <NavItem href="/admin/analytics/behavior" label="행동" icon="🎯" />
            <NavItem href="/admin/analytics/revenue" label="매출" icon="💰" />
            <NavItem href="/admin/analytics/funnel" label="퍼널" icon="🔽" />
          </NavSection>
          <NavSection label="사용자">
            <NavItem href="/admin/users" label="유저 목록" icon="👥" />
          </NavSection>
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t border-[#d0bcff]/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-[#d0bcff] hover:bg-[#d0bcff]/8 rounded-lg transition-colors"
          >
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-[#d0bcff] hover:bg-[#d0bcff]/8 rounded-lg transition-colors"
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  );
}
