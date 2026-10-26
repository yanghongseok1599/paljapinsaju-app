import { notFound } from "next/navigation";

/** 일치하는 라우트가 없는 주소를 [locale]/not-found.tsx 로 보낸다 (next-intl 권장 구성). */
export default function CatchAll() {
  notFound();
}
