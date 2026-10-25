import type { Metadata } from "next";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import CategoryGrid from "@/components/saju/categories/CategoryGrid";
import { PAID_CATEGORY_PRICE_RANGE } from "@/lib/saju/categories";

export const metadata: Metadata = {
  title: "고민별 유료 상담",
  description: `재회, 상대의 마음, 이직, 궁합, 금전, 신년운세까지 고민별 사주 상담. ${PAID_CATEGORY_PRICE_RANGE.low.toLocaleString("ko-KR")}원부터.`,
};

export default function CategoriesPage() {
  return (
    <SajuLayout>
      <div style={{ backgroundColor: "#131318" }}>
        <CategoryGrid />
      </div>
    </SajuLayout>
  );
}
