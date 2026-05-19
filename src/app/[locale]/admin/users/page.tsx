import { requireAdminOrRedirect } from "@/utils/auth/adminGuard";
import { getUserList } from "@/services/analytics/actions";

export default async function AdminUsersPage() {
  await requireAdminOrRedirect("/");

  const { users, total } = await getUserList({ page: 1, pageSize: 50 });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">유저 목록</h1>
        <p className="text-sm text-slate-400 mt-1">
          총{" "}
          <span className="text-[#d0bcff] font-semibold">{total.toLocaleString()}</span>명 표시 중
          (최대 50명/페이지)
        </p>
      </div>

      <div className="bg-[#1a1a24] border border-[#d0bcff]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d0bcff]/10 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">이름/이메일</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">사주분석</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">별 잔액</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">가입일</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">최근 로그인</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">
                    사용자가 없습니다
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#d0bcff]/5 hover:bg-[#d0bcff]/4 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        {user.fullName && (
                          <p className="text-slate-200 font-medium text-sm">{user.fullName}</p>
                        )}
                        <p className="text-slate-400 text-xs">{user.email || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold text-sm ${
                          user.readingCount > 0 ? "text-[#d0bcff]" : "text-slate-500"
                        }`}
                      >
                        {user.readingCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold text-sm ${
                          user.starBalance > 0 ? "text-[#ffb95f]" : "text-slate-500"
                        }`}
                      >
                        {user.starBalance > 0 ? `★ ${user.starBalance}` : "0"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {user.lastSignIn ? formatDate(user.lastSignIn) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
