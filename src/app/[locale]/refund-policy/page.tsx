import type { Metadata } from "next";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import { COMPANY, PAYMENT_PROVIDER } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "환불 정책",
};

/**
 * 전자상거래법 법정 최소선 — 이보다 불리하게 정한 조항은 무효다.
 *  - 제17조①: 7일 청약철회 / 제17조②5: 디지털콘텐츠는 제공 개시 부분만 철회 제한(가분적이면 나머지는 철회 가능)
 *  - 제17조⑥ + 시행령 제21조의2: 철회 제한 사실 표시 + 미리보기 제공이 있어야 제한을 주장할 수 있다
 *  - 제18조②: 3영업일 내 환급
 * 결제 버튼 옆 고지(RefundNotice)와 문구를 맞춘다.
 */
const EFFECTIVE_DATE = "2026년 10월 26일";

export default function RefundPolicyPage() {
  return (
    <SajuLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#131318' }}>
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="text-xl font-bold text-gray-100 mb-2">환불 정책</h1>
          <p className="text-xs text-gray-600 mb-8">시행일: {EFFECTIVE_DATE}</p>

          <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">1. 개요</h2>
              <p>
                본 환불 정책은 {COMPANY.name}(이하 &ldquo;회사&rdquo;)가 운영하는 팔자핀사주({COMPANY.serviceDomain}, 이하 &ldquo;서비스&rdquo;)에서
                판매하는 유료 서비스의 청약철회와 환불 기준을 정합니다. 이 정책보다 법령이 이용자에게
                유리한 경우 법령을 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">2. 유료 서비스와 결제 방법</h2>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li>별(Star) 충전: AI 상담·타로·별자리 해석에 쓰는 이용권 (30개 9,900원 / 70개 19,900원 / 120개 29,900원)</li>
                <li>종합 사주분석: 19,900원</li>
                <li>궁합 분석: 9,900원</li>
                <li>
                  고민별 상담 7종: 재회·이별 후, 상대의 마음 각 9,900원 / 환승·바람 의심, 이직·합격,
                  금전·투자 각 14,900원 / 결혼 결정·배우자운, 신년운세 각 19,900원
                </li>
              </ul>
              <p className="mt-3 text-gray-400">모든 금액은 부가세 포함 금액입니다.</p>

              <h3 className="text-sm font-semibold text-gray-200 mt-5 mb-2">결제 처리</h3>
              <p className="text-gray-400">
                별 충전은 서비스 화면에서 {PAYMENT_PROVIDER.pgName} 결제창으로, 개별 분석 상품은 회사가
                운영하는 결제 페이지({PAYMENT_PROVIDER.domain})에서 결제합니다. 어느 경우든 판매자와 환불
                책임은 {COMPANY.name}에 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">3. 청약철회 (결제 후 7일 이내)</h2>
              <p>
                결제일(서비스를 제공받은 날이 더 늦으면 그날)부터 7일 이내에 청약을 철회할 수 있습니다.
                다만 아래 4항에 따라 이미 제공받은 디지털콘텐츠는 철회가 제한됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">4. 청약철회가 제한되는 경우</h2>
              <p className="mb-3">
                서비스의 분석 결과와 별은 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항 제5호의
                디지털콘텐츠입니다. 제공이 시작된 부분은 청약철회가 제한되고, 제공되지 않은 부분은 철회할 수
                있습니다.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li>
                  <strong className="text-gray-300">개별 분석 상품:</strong> 결제가 확인되어 결과 전체가
                  열리면 제공이 시작된 것으로 보아 철회가 제한됩니다.
                </li>
                <li>
                  <strong className="text-gray-300">별:</strong> 사용한 별은 철회가 제한되고, 사용하지 않은
                  별은 7일 이내에 철회할 수 있습니다.
                </li>
              </ul>
              <div className="mt-4 rounded-xl px-4 py-3" style={{ backgroundColor: '#1b1b20', border: '1px solid rgba(73,68,84,0.2)' }}>
                <p className="text-xs text-gray-400">
                  회사는 결제 전에 사주 원국 요약과 일부 분석 항목을 무료로 미리 볼 수 있게 제공하며, 결제
                  버튼 옆에 청약철회 제한 사실을 표시합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">5. 언제든 전액 환불되는 경우</h2>
              <p className="mb-3">아래의 경우에는 제공 여부와 관계없이 전액 환불합니다.</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li>결제 오류로 중복 결제된 경우</li>
                <li>결제했으나 시스템 장애로 결과나 별을 받지 못한 경우</li>
                <li>
                  제공된 내용이 표시·광고와 다르거나 계약 내용과 다르게 제공된 경우 (제공받은 날부터 3개월,
                  그 사실을 안 날부터 30일 이내)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">6. 7일이 지난 뒤 남은 별의 환불</h2>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li>
                  결제일부터 7일이 지난 뒤에도 사용하지 않은 유료 별은 환불을 요청할 수 있습니다. 이 경우
                  결제대행 수수료 등을 고려해 남은 금액의 10%를 공제하고 환불합니다.
                </li>
                <li>남은 금액은 &ldquo;결제금액 ÷ 충전한 별 개수 × 남은 별 개수&rdquo;로 계산합니다.</li>
                <li>
                  회원가입·친구 초대 등으로 무상 지급된 별은 환불 대상이 아닙니다. 유료 별과 무상 별이 함께
                  있으면 무상 별을 먼저 사용한 것으로 봅니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">7. 미성년자의 결제</h2>
              <p className="text-gray-400">
                만 19세 미만 미성년자가 법정대리인의 동의 없이 결제한 경우 미성년자 본인 또는 법정대리인이
                계약을 취소할 수 있으며, 취소하면 전액 환불합니다. 자세한 내용은 이용약관의 미성년자 결제 조항을 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">8. 환불 신청 방법</h2>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
                <li>
                  이메일(<a href={`mailto:${COMPANY.email}`} className="text-[#d0bcff] hover:text-[#e4e1e9]">{COMPANY.email}</a>)
                  또는 전화({COMPANY.phone})로 신청해 주세요. 별도 서류는 필요하지 않습니다.
                </li>
                <li>알려주실 내용: 로그인 계정(이메일), 결제일시, 결제금액, 환불 사유</li>
                <li>
                  청약철회·환불이 확정되면 3영업일 이내에 결제하신 수단으로 환급합니다. 카드 결제는 카드사
                  취소 처리 일정에 따라 실제 반영이 며칠 늦어질 수 있습니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">9. 문의</h2>
              <div className="text-gray-400 space-y-1">
                <p>이메일: <a href={`mailto:${COMPANY.email}`} className="text-[#d0bcff] hover:text-[#e4e1e9]">{COMPANY.email}</a></p>
                <p>전화: {COMPANY.phone}</p>
                <p>상호: {COMPANY.name} | 대표: {COMPANY.representative}</p>
              </div>
            </section>
          </div>
        </div>
        <SajuFooter />
      </div>
    </SajuLayout>
  );
}
