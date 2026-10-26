import { COMPANY, FTC_BUSINESS_INFO_URL } from "@/lib/legal/company";
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
          <FooterLink href={`mailto:${COMPANY.email}`}>문의</FooterLink>
        </div>
      </div>

      {/*
        통신판매업자 신원정보.
        전자상거래법상 상호·대표자·사업자등록번호·통신판매업 신고번호·주소·연락처를
        이용자가 쉽게 알 수 있는 곳에 표시해야 한다. 모든 페이지 하단에 노출된다.
      */}
      <div
        className="max-w-7xl mx-auto mt-8 pt-6 w-full"
        style={{ borderTop: "1px solid rgba(73,68,84,0.15)" }}
      >
        <dl className="flex flex-wrap gap-x-5 gap-y-1.5 text-[0.7rem] leading-relaxed text-slate-500 font-['Pretendard']">
          <BizItem label="상호" value={COMPANY.name} />
          <BizItem label="대표자" value={COMPANY.representative} />
          <BizItem label="사업자등록번호" value={COMPANY.businessNumber} />
          <BizItem label="통신판매업 신고번호" value={COMPANY.mailOrderNumber} />
          <BizItem label="소재지" value={COMPANY.address} />
          <BizItem label="고객센터" value={COMPANY.phone} />
          <BizItem label="이메일" value={COMPANY.email} />
          <BizItem label="개인정보 보호책임자" value={COMPANY.privacyOfficer} />
          <BizItem label="호스팅 제공자" value={COMPANY.hostingProvider} />
          <div className="flex gap-1.5">
            <a
              href={FTC_BUSINESS_INFO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-300"
            >
              사업자정보 확인
            </a>
          </div>
        </dl>

        <p className="mt-4 text-[0.7rem] leading-relaxed text-slate-600 font-['Pretendard']">
          본 서비스의 사주·운세 해석은 전통 역학 이론과 AI 생성 결과를 바탕으로 한
          참고용 콘텐츠이며, 의료·법률·금융·투자에 대한 전문적 조언이 아닙니다.
          이용자의 판단과 선택에 따른 결과에 대해 회사는 책임을 지지 않습니다.
        </p>
      </div>
    </footer>
  );
}

function BizItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-slate-600">{label}</dt>
      <dd>{value}</dd>
    </div>
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
