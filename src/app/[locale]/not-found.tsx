import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#131318" }}
    >
      <p className="text-sm tracking-widest text-[#958ea0]">404</p>
      <h1 className="mt-3 text-2xl font-bold text-[#e4e1e9]">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sm text-[#958ea0]">
        주소가 바뀌었거나 없어진 페이지입니다.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl px-6 py-3 text-sm font-semibold oracle-gradient"
        style={{ color: "#3c0091" }}
      >
        처음으로 가기
      </Link>
    </main>
  );
}
