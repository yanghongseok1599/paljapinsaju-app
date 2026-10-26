import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import { COMPANY, PAYMENT_PROVIDER } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

/**
 * 이 문서의 표는 코드에서 확인한 사실만 적는다 (2026-10-26 기준).
 *  - 로그인: Google·카카오 OAuth, 이메일(매직링크·비밀번호) — services/auth/actions.ts
 *  - AI: OpenAI — lib/ai/model.ts
 *  - 결제: 별 충전은 토스페이먼츠 위젯, 개별 상품은 trainer-milestone.com(같은 사업자)
 *  - 이메일 발송: Resend (가입 환영 메일) — services/email/actions.ts
 *  - 저장 항목: supabase/migrations/*.sql
 * 새 외부 서비스를 붙이면 위탁·국외이전 표를 함께 고친다.
 *
 * Supabase는 supabase/README.md 대로 서울 리전에 만든다는 전제다.
 * 다른 리전에 만들었다면 Supabase 를 국외이전 표로 옮겨야 한다.
 */
const EFFECTIVE_DATE = "2026년 10월 26일";

const COLLECTED: [string, string][] = [
  [
    "회원가입·로그인",
    "Google 로그인: 이메일, 이름, 프로필 사진 / 카카오 로그인: 이메일, 닉네임, 프로필 사진(카카오에서 이용자가 동의한 항목) / 이메일 가입: 이메일, 비밀번호(암호화 저장)",
  ],
  [
    "사주 분석",
    "이름, 성별, 생년월일, 출생시각(선택), 양력·음력 구분, 출생 도시(선택), 관심 주제",
  ],
  [
    "궁합 분석",
    "상대방의 이름, 성별, 생년월일, 출생시각(선택), 양력·음력 구분",
  ],
  ["AI 상담·타로", "질문 내용, 대화 내용, 뽑은 카드"],
  [
    "결제",
    `주문번호, 상품명, 결제금액, 결제일시, 별 충전·사용 내역 (주문자 정보와 카드번호 등 결제수단 정보는 ${PAYMENT_PROVIDER.pgName}와 결제 페이지에서 처리하며 이 서비스에는 저장하지 않습니다)`,
  ],
  [
    "자동 수집",
    "접속 기록(호스팅사 로그의 IP 주소 포함), 방문 경로(유입 경로·UTM), 기기·브라우저·운영체제 종류, 접속 국가·도시, 쿠키, 서비스 이용 기록",
  ],
];

const PROCESSORS: [string, string][] = [
  ["Supabase Inc.", "데이터베이스 보관 및 회원 인증, 로그인 메일 발송"],
  ["OpenAI, L.L.C.", "AI 사주 상담·타로·별자리 해석 문장 생성"],
  ["Vercel Inc.", "웹 서비스 호스팅"],
  ["Resend, Inc.", "가입 안내 이메일 발송"],
  [PAYMENT_PROVIDER.pgName, "결제 처리 및 결제 취소·환불"],
];

/** 국외 이전: [이전받는 자, 국가, 항목, 목적, 보유·이용 기간, 개인정보 문의처] */
const OVERSEAS: [string, string, string, string, string, string][] = [
  [
    "OpenAI, L.L.C.",
    "미국",
    "사주 정보(이름·성별·생년월일시·출생 도시), 질문·대화 내용",
    "AI 해석 문장 생성",
    "OpenAI API 정책에 따라 최대 30일 보관 후 삭제 (모델 학습에 사용되지 않음)",
    "https://openai.com/policies/privacy-policy",
  ],
  [
    "Vercel Inc.",
    "미국",
    "접속 기록, IP 주소, 서비스 이용 중 주고받는 데이터",
    "웹 서비스 호스팅",
    "위탁 계약 종료 시까지 (접속 기록은 Vercel 보관 정책 기간)",
    "https://vercel.com/legal/privacy-policy",
  ],
  [
    "Resend, Inc.",
    "미국",
    "이메일 주소",
    "가입 안내 이메일 발송",
    "발송 완료 후 Resend 보관 정책 기간",
    "https://resend.com/legal/privacy-policy",
  ],
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen text-[#e4e1e9]" style={{ backgroundColor: '#131318' }}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          홈으로 돌아가기
        </Link>

        {/* 제목 */}
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
          개인정보처리방침
        </h1>
        <p className="mb-12 text-sm text-gray-500">
          시행일: {EFFECTIVE_DATE}
        </p>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-300">
          <p>
            {COMPANY.name}(이하 &quot;회사&quot;)는 팔자핀사주(이하
            &quot;서비스&quot;)를 운영하면서 「개인정보 보호법」에 따라 이용자의
            개인정보를 보호하고 관련 고충을 신속하게 처리하기 위해 다음과 같이
            개인정보처리방침을 둡니다.
          </p>

          <Section title="1. 개인정보의 처리 목적">
            <p className="mb-2">
              회사는 다음의 목적으로만 개인정보를 처리하며, 목적이 바뀌는 경우
              「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한
              조치를 합니다.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">회원 관리:</strong> 회원 식별,
                로그인, 부정 이용 방지, 고지·통지
              </li>
              <li>
                <strong className="text-gray-100">서비스 제공:</strong> 사주·궁합
                분석, AI 상담, 타로·별자리 해석, 분석 결과 보관
              </li>
              <li>
                <strong className="text-gray-100">결제·환불:</strong> 유료 상품과
                별 충전의 결제 확인, 별 지급·차감, 청약철회·환불 처리
              </li>
              <li>
                <strong className="text-gray-100">고객 응대:</strong> 문의·불만
                처리, 분쟁 대응
              </li>
              <li>
                <strong className="text-gray-100">서비스 개선:</strong> 이용 통계
                분석
              </li>
            </ul>
          </Section>

          <Section title="2. 처리하는 개인정보 항목과 수집 방법">
            <Table
              head={["구분", "항목"]}
              rows={COLLECTED}
            />
            <ul className="ml-5 mt-3 list-disc space-y-1">
              <li>
                회원가입·로그인 시 Google·카카오에서 이용자가 제공에 동의한 정보를
                받거나, 이용자가 직접 입력한 정보를 수집합니다.
              </li>
              <li>사주·궁합·상담 정보는 이용자가 직접 입력합니다.</li>
              <li>자동 수집 항목은 서비스 이용 과정에서 생성됩니다.</li>
              <li>
                로그인하지 않은 체험 이용 시 입력한 사주 정보와 결과는 회사 서버에
                저장하지 않고 이용자 기기의 브라우저에만 저장됩니다. 결과를 PDF로
                내려받을 때는 PDF를 만들기 위해 일시적으로 전송되며 저장하지
                않습니다.
              </li>
              <li>
                궁합 분석에서 다른 사람의 정보를 입력하는 경우, 이용자는 그
                사람에게 정보 입력 사실을 알리고 동의를 받아야 합니다.
              </li>
              <li>
                AI 상담 대화에는 건강·질병 등 민감한 정보를 입력하지 않도록
                권장합니다. 회사는 민감정보를 따로 수집하지 않습니다.
              </li>
            </ul>
          </Section>

          <Section title="3. 개인정보의 처리 및 보유 기간">
            <p className="mb-2">
              회사는 처리 목적이 달성되면 개인정보를 지체 없이 파기합니다. 다만
              관계 법령에 따라 보존해야 하는 정보는 다른 개인정보와 분리하여 아래
              기간 동안 보관합니다.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">회원 정보·분석 결과·상담 기록:</strong>{" "}
                회원 탈퇴 시까지
              </li>
              <li>
                <strong className="text-gray-100">
                  계약 또는 청약철회에 관한 기록:
                </strong>{" "}
                5년 (전자상거래 등에서의 소비자보호에 관한 법률)
              </li>
              <li>
                <strong className="text-gray-100">
                  대금결제 및 재화 등의 공급에 관한 기록:
                </strong>{" "}
                5년 (전자상거래 등에서의 소비자보호에 관한 법률)
              </li>
              <li>
                <strong className="text-gray-100">
                  소비자 불만 또는 분쟁 처리에 관한 기록:
                </strong>{" "}
                3년 (전자상거래 등에서의 소비자보호에 관한 법률)
              </li>
              <li>
                <strong className="text-gray-100">웹사이트 방문 기록:</strong>{" "}
                3개월 (통신비밀보호법)
              </li>
            </ul>
          </Section>

          <Section title="4. 개인정보의 제3자 제공">
            <p>
              회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 이용자가
              동의하거나 법률에 특별한 규정이 있는 경우에는 예외로 합니다.
            </p>
            <p className="mt-2">
              유료 상품 결제 페이지({PAYMENT_PROVIDER.domain})는 서비스와 같은
              사업자인 {PAYMENT_PROVIDER.operator}가 운영합니다. 결제 페이지에서는{" "}
              {PAYMENT_PROVIDER.collectedItems}를 직접 받으며, 이는 제3자 제공에
              해당하지 않습니다. 결제가 끝나면 서비스는 주문번호·상품·금액·결제일시만
              확인합니다.
            </p>
          </Section>

          <Section title="5. 개인정보 처리의 위탁">
            <p className="mb-3">
              회사는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁합니다.
              위탁 계약 시 개인정보가 안전하게 관리되도록 필요한 사항을 정하고
              있습니다.
            </p>
            <Table head={["수탁자", "위탁 업무"]} rows={PROCESSORS} />
          </Section>

          <Section title="6. 개인정보의 국외 이전">
            <p className="mb-3">
              회사는 서비스 제공(계약의 이행)을 위해 아래와 같이 개인정보를 국외로
              이전합니다. 이전은 이용자가 해당 기능을 이용하는 시점에 네트워크를
              통해 암호화하여 전송하는 방식으로 이루어집니다.
            </p>
            <Table
              head={["이전받는 자", "국가", "이전 항목", "목적", "보유·이용 기간", "문의처"]}
              rows={OVERSEAS}
            />
            <p className="mt-3">
              국외 이전을 원하지 않으시면 회원 탈퇴를 요청하거나 해당 기능(AI
              상담·해석 등)을 이용하지 않으시면 됩니다. 이 경우 AI 해석이 필요한
              서비스는 이용할 수 없습니다.
            </p>
          </Section>

          <Section title="7. 개인정보의 파기 절차 및 방법">
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">파기 절차:</strong> 보유 기간이
                끝나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 법령에
                따라 보존하는 정보는 다른 개인정보와 분리하여 보관한 뒤 기간이
                끝나면 파기합니다.
              </li>
              <li>
                <strong className="text-gray-100">파기 방법:</strong> 전자 파일은
                복구할 수 없는 방법으로 삭제합니다. 종이 문서는 분쇄하거나
                소각합니다.
              </li>
            </ul>
          </Section>

          <Section title="8. 정보주체의 권리와 행사 방법">
            <p className="mb-2">
              이용자는 언제든지 자신의 개인정보에 대해 열람, 정정·삭제, 처리정지,
              동의 철회를 요구할 수 있습니다.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                이메일(
                <MailLink />) 또는 전화({COMPANY.phone})로 요청하시면 지체 없이
                조치합니다.
              </li>
              <li>
                정정·삭제를 요구하신 경우 완료할 때까지 해당 개인정보를 이용하거나
                제공하지 않습니다.
              </li>
              <li>
                법정대리인이나 위임을 받은 사람을 통해서도 권리를 행사할 수
                있습니다. 이 경우 「개인정보 처리 방법에 관한 고시」 별지 제11호
                서식의 위임장을 제출해야 합니다.
              </li>
              <li>
                다른 법령에서 보존하도록 정한 개인정보는 삭제를 요구할 수 없습니다.
              </li>
            </ul>
            <p className="mt-2">
              회사는 만 14세 미만 아동의 회원가입을 받지 않습니다.
            </p>
          </Section>

          <Section title="9. 개인정보의 안전성 확보 조치">
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">관리적 조치:</strong> 개인정보를
                다루는 사람을 대표자 등 최소 인원으로 제한
              </li>
              <li>
                <strong className="text-gray-100">기술적 조치:</strong> 전 구간
                HTTPS(TLS) 암호화 전송, 비밀번호 일방향 암호화 저장, 데이터베이스
                행 단위 접근 제한(본인 데이터만 조회), 결제·이용권 상태는 서버만 변경,
                관리자 기능 접근 권한 제한
              </li>
            </ul>
          </Section>

          <Section title="10. 쿠키 등 자동 수집 장치의 설치·운영 및 거부">
            <p className="mb-2">
              서비스는 로그인 상태 유지와 이용 환경 설정, 이용 통계 분석을 위해
              쿠키와 브라우저 저장소를 사용합니다.
            </p>
            <p>
              이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 거부하면
              로그인이 필요한 서비스를 이용할 수 없습니다.
            </p>
            <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-gray-400">
              <li>Chrome: 설정 &gt; 개인정보 및 보안 &gt; 서드 파티 쿠키</li>
              <li>Safari: 설정 &gt; 개인정보 보호</li>
              <li>Edge: 설정 &gt; 쿠키 및 사이트 권한</li>
            </ul>
          </Section>

          <Section title="11. 개인정보 보호책임자">
            <p className="mb-3">
              개인정보 처리에 관한 업무를 총괄하고 관련 불만 처리와 피해 구제를
              위해 아래와 같이 개인정보 보호책임자를 지정합니다.
            </p>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <ul className="space-y-1 text-sm">
                <li>성명: {COMPANY.privacyOfficer}</li>
                <li>직위: 대표</li>
                <li>전화: {COMPANY.phone}</li>
                <li>
                  이메일: <MailLink />
                </li>
              </ul>
            </div>
          </Section>

          <Section title="12. 권익침해 구제 방법">
            <p className="mb-3">
              개인정보 침해에 대한 신고나 상담이 필요하시면 아래 기관에 문의하실 수
              있습니다.
            </p>
            <div className="space-y-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm">
              <Agency name="개인정보분쟁조정위원회" phone="1833-6972" url="https://www.kopico.go.kr" />
              <Agency name="개인정보침해 신고센터 (한국인터넷진흥원)" phone="118" url="https://privacy.kisa.or.kr" />
              <Agency name="대검찰청" phone="1301" url="https://www.spo.go.kr" />
              <Agency name="경찰청" phone="182" url="https://ecrm.police.go.kr" />
            </div>
          </Section>

          <Section title="13. 개인정보처리방침의 변경">
            <p>
              이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용됩니다. 내용이 바뀌는
              경우 시행 7일 전부터 서비스 화면을 통해 알립니다. 이용자 권리에 중요한
              변경이 있으면 30일 전부터 알립니다.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              이전 버전: 2026년 3월 10일 시행
            </p>
          </Section>
        </div>
      </div>
      <SajuFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium text-gray-100 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i} className="px-3 py-2 align-top">
                  {cell.startsWith("https://") ? (
                    <a
                      href={cell}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-400 underline hover:text-blue-300"
                    >
                      개인정보처리방침
                    </a>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MailLink() {
  return (
    <a
      href={`mailto:${COMPANY.email}`}
      className="text-blue-400 underline hover:text-blue-300"
    >
      {COMPANY.email}
    </a>
  );
}

function Agency({ name, phone, url }: { name: string; phone: string; url: string }) {
  return (
    <div>
      <p className="font-medium text-gray-100">{name}</p>
      <p>전화: (국번없이) {phone}</p>
      <p>
        홈페이지:{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          {url.replace("https://", "")}
        </a>
      </p>
    </div>
  );
}
