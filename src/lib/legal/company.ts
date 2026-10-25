/**
 * 사업자 정보 — 법적 고지의 단일 출처.
 *
 * 전자상거래법상 통신판매업자는 상호·대표자·사업자등록번호·통신판매업 신고번호·
 * 주소·연락처를 이용자가 쉽게 알 수 있도록 표시해야 한다. 이 파일의 값이
 * 이용약관 / 개인정보처리방침 / 환불정책 / 푸터 네 곳에 동시에 쓰인다.
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
  serviceDomain: string;
}

export const COMPANY: CompanyInfo = {
  /** 상호명 (사업자등록증상 명칭) */
  name: "헤븐데일리",
  /** 대표자 성명 */
  representative: "김지민",
  /** 사업자등록번호 (000-00-00000) */
  businessNumber: "506-54-00971",
  /** 통신판매업 신고번호 (제0000-지역-0000호) */
  mailOrderNumber: "제2026-강원동해-0022호",
  /** 사업장 소재지 */
  address: "강원도 동해시",
  /** 고객 문의·환불 접수 이메일 */
  email: "ko6573@naver.com",
  /** 고객센터 전화번호 */
  phone: PLACEHOLDER,
  /** 개인정보 보호책임자 성명 */
  privacyOfficer: "김지민",
  /** 서비스 도메인 */
  serviceDomain: "drsaju.com",
};

/**
 * 결제를 외부에서 받는 경우의 고지.
 * 이용자가 "누구에게 돈을 내는지"를 알 수 있어야 한다.
 */
export interface PaymentProviderInfo {
  name: string;
  domain: string;
  legalName: string;
  country: string;
  transferItems: string;
  transferPurpose: string;
  retentionPeriod: string;
}

export const PAYMENT_PROVIDER: PaymentProviderInfo = {
  /** 결제 페이지를 제공하는 주체 (이용자에게 보여줄 이름) */
  name: "trainer-milestone.com",
  /** 결제 페이지 도메인 */
  domain: "trainer-milestone.com",

  /**
   * 아래는 개인정보 처리위탁·국외이전 고지에 필요한 항목이다.
   * 개인정보보호법은 위탁 시 수탁자와 위탁업무를, 국외 이전 시 이전받는 자·국가·
   * 이전 항목·이전 목적·보유기간을 공개하도록 하고 있다. 추정해서 쓰면 안 된다.
   *
   * 결제를 국내에서 처리한다면 country를 "대한민국"으로 두고
   * 개인정보처리방침의 국외이전 표에서는 이 항목을 빼면 된다.
   */
  /** 수탁자 법인명 (사업자등록증상 명칭) */
  legalName: PLACEHOLDER,
  /** 개인정보가 처리·보관되는 국가 */
  country: PLACEHOLDER,
  /** 이전되는 개인정보 항목 (예: 이메일, 주문번호, 결제금액) */
  transferItems: PLACEHOLDER,
  /** 이전 목적 */
  transferPurpose: "결제 처리 및 정산",
  /** 보유·이용 기간 */
  retentionPeriod: PLACEHOLDER,
};

/** 아직 채워지지 않은 항목 목록 (사업자 정보 + 결제 수탁자 정보) */
export function missingCompanyFields(): string[] {
  const entries = [
    ...Object.entries(COMPANY),
    ...Object.entries(PAYMENT_PROVIDER),
  ];
  return entries.filter(([, v]) => v === PLACEHOLDER).map(([k]) => k);
}

/** 고지에 필요한 정보가 미완성인지 */
export const COMPANY_INFO_INCOMPLETE = missingCompanyFields().length > 0;
