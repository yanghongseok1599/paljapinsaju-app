import { Link } from "@/i18n/routing";

/**
 * 결제 버튼 옆 청약철회 제한 고지.
 *
 * 전자상거래법 제17조⑥: 철회가 제한된다는 사실을 결제 전에 쉽게 알 수 있는 곳에
 * 표시해야 디지털콘텐츠의 철회 제한(제17조②5)을 주장할 수 있다.
 * 문구는 환불정책 페이지(refund-policy) 4·6항과 맞춘다.
 */
const TEXT = {
  report:
    "결제가 확인되면 결과 전체가 바로 열리며, 열린 디지털콘텐츠는 청약철회가 제한됩니다. 결제 오류나 장애로 결과를 받지 못한 경우에는 전액 환불됩니다.",
  stars:
    "사용하지 않은 별은 결제 후 7일 이내에 전액 환불되며, 사용한 별은 청약철회가 제한됩니다.",
} as const;

export default function RefundNotice({
  kind,
  className = "",
}: {
  kind: keyof typeof TEXT;
  className?: string;
}) {
  return (
    <p className={`text-xs leading-relaxed ${className}`}>
      {TEXT[kind]}{" "}
      <Link href="/refund-policy" className="underline underline-offset-2">
        환불정책
      </Link>
    </p>
  );
}
