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
            className="text-base font-extrabold text-[#d0bcff] tracking-[0.15em] uppercase font-['Space_Grotesk']"
          >
            관리자
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-3 p-3 flex-1" aria-label="관리자 메뉴">
          <NavSection label="애널리틱스">
            <NavItem href="/admin/analytics/overview" label="개요" />
            <NavItem href="/admin/analytics/traffic" label="트래픽" />
            <NavItem href="/admin/analytics/behavior" label="행동" />
            <NavItem href="/admin/analytics/revenue" label="매출" />
            <NavItem href="/admin/analytics/funnel" label="퍼널" last />
          </NavSection>
          <NavSection label="사용자">
            <NavItem href="/admin/users" label="유저 목록" last />
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
    <div>
      <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
        {label}
      </p>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}

function NavItem({
  href,
  label,
  last,
}: {
  href: string;
  label: string;
  last?: boolean;
}) {
  return (
    <li className={last ? "" : "border-b border-[#d0bcff]/[0.06]"}>
      <Link
        href={href}
        className="group relative block px-3 py-3 text-[13px] font-medium text-slate-300 tracking-tight transition-all duration-200 hover:text-[#d0bcff] hover:tracking-[0.04em] hover:pl-5"
      >
        {/* Left accent bar revealed on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-[#d0bcff] opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100 transition-all duration-200"
        />
        <span
          className="transition-[text-shadow] duration-200 group-hover:[text-shadow:0_0_12px_rgba(208,188,255,0.55)]"
        >
          {label}
        </span>
      </Link>
    </li>
  );
}
