import { AuthForm } from "@/components/features/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 aurora-bg" style={{ backgroundColor: '#131318' }}>
      {/* Ambient violet blob */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(208,188,255,0.06)' }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#d0bcff] to-[#a078ff] uppercase mb-2" style={{ fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>
            팔자핀사주
          </div>
          <p className="text-[#958ea0] text-sm">디지털 오라클에 오신 것을 환영합니다</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
