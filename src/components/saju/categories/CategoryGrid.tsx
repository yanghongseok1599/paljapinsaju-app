"use client";

import { motion } from "framer-motion";
import { ACCOUNTS_ENABLED } from "@/lib/accounts";
import { Link } from "@/i18n/routing";
import { getCharacter } from "@/lib/saju/characters";
import {
  PAID_CATEGORIES,
  PRICING_PROVISIONAL,
  type PaidCategory,
} from "@/lib/saju/categories";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default function CategoryGrid() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {/* 헤더 */}
      <div className="mb-12 md:mb-16">
        {PRICING_PROVISIONAL && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ffb95f]/30 bg-[#ffb95f]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb95f]">
            가격 미확정 · 임시 책정
          </span>
        )}
        <h1
          className="mt-5 text-4xl md:text-5xl font-bold text-[#e4e1e9]"
          style={{ fontFamily: "Plus Jakarta Sans, Pretendard, sans-serif" }}
        >
          고민별 유료 상담
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#958ea0]">
          막연한 운세 대신, 지금 답이 필요한 질문 하나를 골라주세요. 사주 데이터
          기반으로 해당 주제만 깊게 분석합니다.
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PAID_CATEGORIES.map((category, i) => (
          <CategoryCard key={category.id} category={category} index={i} />
        ))}
      </div>

      {PRICING_PROVISIONAL && (
        <p className="mt-12 text-center text-xs leading-relaxed text-[#6f6878]">
          표시된 금액과 별 차감량은 확정 전 임시값입니다.
          <br className="sm:hidden" /> 실제 결제 정책이 정해지면 변경됩니다.
        </p>
      )}
    </div>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: PaidCategory;
  index: number;
}) {
  const character = getCharacter(category.characterId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Link
        href={ACCOUNTS_ENABLED ? `/chat/${category.characterId}?category=${category.id}` : `/reading?category=${category.id}`}
        className="group flex h-full flex-col rounded-2xl border border-[rgba(73,68,84,0.35)] bg-[#1a1a20] p-6 transition-colors duration-200 hover:border-[rgba(208,188,255,0.35)]"
      >
        {/* 상단: 액센트 바 + 배지 */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <span
            aria-hidden="true"
            className="block h-1 w-10 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          {category.badge && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
              style={{
                color: category.color,
                backgroundColor: `${category.color}1f`,
              }}
            >
              {category.badge}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-[#e4e1e9]">{category.name}</h2>
        <p className="mt-1 text-sm font-medium" style={{ color: category.color }}>
          {category.subtitle}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-[#958ea0]">
          {category.description}
        </p>

        {/* 질문 예시 */}
        <ul className="mt-5 space-y-2">
          {category.questions.map((q) => (
            <li
              key={q}
              className="flex gap-2 text-[13px] leading-relaxed text-[#cac4d0]"
            >
              <span aria-hidden="true" className="text-[#6f6878]">
                &ldquo;
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ul>

        {/* 하단: 상담사 + 가격 */}
        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-3 border-t border-[rgba(73,68,84,0.3)] pt-4">
            <div>
              <p className="text-[11px] text-[#6f6878]">담당 상담사</p>
              <p className="text-sm font-semibold text-[#cac4d0]">
                {character.name}
                <span className="ml-1.5 font-normal text-[#6f6878]">
                  {character.title}
                </span>
              </p>
            </div>
            <div className="text-right">
              {/* 고민 상담은 마일스톤 현금 결제로만 판다. 별 가격은 살 수 없는 값이라 보여주지 않는다. */}
              <p className="text-lg font-bold text-[#e4e1e9]">
                {won(category.priceKrw)}
              </p>
            </div>
          </div>

          <span className="mt-4 flex items-center justify-center rounded-xl bg-[rgba(208,188,255,0.1)] py-3 text-sm font-semibold text-[#d0bcff] transition-colors group-hover:bg-[rgba(208,188,255,0.18)]">
            상담 시작하기
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
