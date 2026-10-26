/**
 * 사업자 정보 — 법적 고지의 단일 출처.
 *
 * 전자상거래법상 통신판매업자는 상호·대표자·사업자등록번호·통신판매업 신고번호·
 * 주소·연락처·호스팅 제공자를 이용자가 쉽게 알 수 있도록 표시해야 한다
 * (제10조①, 시행령 제11조의4). 이 파일의 값이 이용약관 / 개인정보처리방침 /
 * 환불정책 / 푸터 네 곳에 동시에 쓰인다.
 *
 * 값의 정본: 헤븐데일리 사업자 정보(오토사장 companyInfo.ts). 다른 문서에서
 * 복사하지 않는다 — 사업자번호 11자리 오기, 이메일 도메인 오타가 실제로 있었다.
 *
 * ⚠️ PLACEHOLDER 값이 하나라도 남아 있으면 `npm run build`가 실패한다.
 *    (scripts/check-legal.mjs — prebuild 단계에서 검사)
 *    가짜 연락처로 배포되면 환불 창구가 없는 상태가 되기 때문이다.
 *
 * 법률 자문이 아니다. 표기 항목이 사업 형태에 맞는지는 별도 확인이 필요하다.
 */

/** 아직 채우지 않은 값임을 나타내는 표시 */
export const PLACEHOLDER = "__채워주세요__";

export interface CompanyInfo {
  name: string;
  representative: string;
  businessNumber: string;
  mailOrderNumber: string;
  address: string;
  email: string;
  phone: string;
  privacyOfficer: string;
  hostingProvider: string;
  serviceDomain: string;
}

export const COMPANY: CompanyInfo = {
  /** 상호명 (사업자등록증상 명칭) */
  name: "헤븐데일리",
  /** 대표자 성명 */
  representative: "김지민",
  /** 사업자등록번호 (000-00-00000) — 검증숫자 통과 확인함 */
  businessNumber: "506-54-00971",
  /** 통신판매업 신고번호 (제0000-지역-0000호) */
  mailOrderNumber: "제2026-강원동해-0022호",
  /** 사업장 소재지 — 사업자등록증 기재 그대로. 축약하지 않는다. */
  address: "강원특별자치도 동해시 해안로 449, 가동 407호(부곡동, 일정골든타워아파트)",
  /** 고객 문의·환불 접수 이메일 (MX 확인함) */
  email: "info@auto-ceo-milestone.com",
  /** 고객센터 전화번호 */
  phone: "010-7545-1599",
  /** 개인정보 보호책임자 성명 */
  privacyOfficer: "김지민",
  /** 호스팅 서비스 제공자 상호 (전자상거래법 시행령 제11조의4) */
  hostingProvider: "Vercel Inc.",
  /** 서비스 도메인 */
  serviceDomain: "drsaju.com",
};

/**
 * 공정위 통신판매사업자 정보공개 페이지.
 * 초기화면에서 연결해야 한다 (전자상거래법 시행규칙 제7조②).
 */
export const FTC_BUSINESS_INFO_URL = `https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${COMPANY.businessNumber.replace(/\D/g, "")}`;

/**
 * 결제를 외부 페이지에서 받는 경우의 고지.
 * 이용자가 "누구에게 돈을 내는지"를 알 수 있어야 한다.
 *
 * trainer-milestone.com 은 이 서비스와 **같은 사업자(헤븐데일리)** 가 운영한다.
 * 그래서 결제 페이지로 넘어가는 것은 제3자 제공도 처리위탁도 아니다.
 * 처리위탁 대상은 실제로 카드 결제를 처리하는 결제대행사(PG)다.
 */
export interface PaymentProviderInfo {
  name: string;
  domain: string;
  operator: string;
  pgName: string;
  pgCountry: string;
  collectedItems: string;
}

export const PAYMENT_PROVIDER: PaymentProviderInfo = {
  /** 결제 페이지를 제공하는 주체 (이용자에게 보여줄 이름) */
  name: "trainer-milestone.com",
  /** 결제 페이지 도메인 */
  domain: "trainer-milestone.com",
  /** 결제 페이지 운영자 */
  operator: COMPANY.name,
  /** 결제대행사 (개인정보 처리위탁 수탁자) */
  pgName: "토스페이먼츠(주)",
  /** 결제대행사가 개인정보를 처리하는 국가 */
  pgCountry: "대한민국",
  /** 결제 페이지에서 주문자에게 직접 받는 항목 */
  collectedItems: "주문자 이름, 연락처, 이메일, 결제수단 정보",
};

/** 아직 채워지지 않은 항목 목록 (사업자 정보 + 결제 고지 정보) */
export function missingCompanyFields(): string[] {
  const entries = [
    ...Object.entries(COMPANY),
    ...Object.entries(PAYMENT_PROVIDER),
  ];
  return entries.filter(([, v]) => v === PLACEHOLDER).map(([k]) => k);
}

/** 고지에 필요한 정보가 미완성인지 */
export const COMPANY_INFO_INCOMPLETE = missingCompanyFields().length > 0;
