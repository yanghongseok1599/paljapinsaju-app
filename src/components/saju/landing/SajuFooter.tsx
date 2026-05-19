export default function SajuFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#131318] w-full py-12 px-8" style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">

        {/* Brand + copyright — left column */}
        <div className="flex flex-col gap-4">
          <div className="text-lg font-bold text-[#d0bcff] font-['Pretendard'] uppercase tracking-widest">
            팔자핀사주
          </div>
          <p className="text-[#d0bcff] font-['Pretendard'] text-[0.75rem] uppercase tracking-widest">
            © {currentYear} 팔자핀사주. 디지털 오라클.
          </p>
        </div>

        {/* Links — right column, flex-wrap justify-end */}
        <div className="flex flex-wrap md:justify-end gap-8">
          <FooterLink href="/privacy-policy">개인정보 처리방침</FooterLink>
          <FooterLink href="/terms">이용약관</FooterLink>
          <FooterLink href="/refund-policy">환불정책</FooterLink>
          <FooterLink href="mailto:your-email@example.com">문의</FooterLink>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-slate-500 font-['Pretendard'] text-[0.75rem] uppercase tracking-widest hover:text-[#8B5CF6] transition-colors opacity-80 hover:opacity-100"
    >
      {children}
    </a>
  );
}
