'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { TOSS_CONFIG, STAR_PACKS as TOSS_STAR_PACKS, type StarPack } from '@/lib/toss/config';
import RefundNotice from '@/components/saju/payment/RefundNotice';

interface CoinShopClientProps {
  totalCoins: number;
  userId: string;
  userEmail?: string;
}

const STAR_PACKS: {
  pack: StarPack;
  stars: number;
  price: number;
  badge?: string;
}[] = TOSS_STAR_PACKS.map((p) => ({
  pack: p,
  stars: p.stars,
  price: p.priceKrw,
  badge: p.badge,
}));

function generateOrderId(packId: string): string {
  return `${packId}__${crypto.randomUUID()}`;
}

export default function CoinShopClient({ totalCoins, userId, userEmail }: CoinShopClientProps) {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string>(TOSS_STAR_PACKS[1].id); // 중간 팩(인기) 기본 선택
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('paid') === 'true') {
      setShowSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePurchase = async () => {
    const selectedPack = TOSS_STAR_PACKS.find((p) => p.id === selected);
    if (!selectedPack) return;

    if (!TOSS_CONFIG.clientKey) {
      setError('결제 시스템이 초기화되지 않았습니다.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tossPayments = await loadTossPayments(TOSS_CONFIG.clientKey);
      // 결제창(API 개별 연동 키, ck) 방식. 위젯(widgets) 방식은 결제수단 UI 를 먼저 그려야 해서
      // setAmount → requestPayment 만 부르면 NotSelectedPaymentMethodError 로 항상 실패했다.
      const payment = tossPayments.payment({ customerKey: userId });
      const orderId = generateOrderId(selectedPack.id);

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: selectedPack.priceKrw },
        orderId,
        orderName: selectedPack.name,
        successUrl: `${window.location.origin}/api/payments/toss/confirm`,
        failUrl: `${window.location.origin}/ko/coin-shop?error=payment_cancelled`,
        customerEmail: userEmail,
        customerName: userEmail?.split('@')[0] ?? '고객',
      });
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code !== 'USER_CANCEL') {
        console.error('[CoinShop] 결제창 오류', err);
        setError('결제 시스템을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center px-4 py-10" style={{ backgroundColor: '#131318' }}>
      {/* 결제 완료 알림 */}
      {showSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-green-500/15 border border-green-500/30 text-green-400 px-5 py-3.5 rounded-2xl shadow-lg shadow-green-500/10 backdrop-blur-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="font-semibold text-sm">결제가 완료되었습니다! 별이 충전되었어요.</span>
            <button onClick={() => setShowSuccess(false)} className="ml-1 text-green-500/60 hover:text-green-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 현재 보유 코인 */}
      <div className="text-center mb-10">
        <p className="text-sm mb-2" style={{ color: '#958ea0' }}>현재 보유 별</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl" style={{ color: '#ffb95f' }}>&#9733;</span>
          <span className="text-4xl font-bold" style={{ color: '#e4e1e9' }}>{totalCoins}</span>
        </div>
      </div>

      {/* 충전 패키지 */}
      <div className="w-full max-w-md space-y-3 mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#e4e1e9', fontFamily: 'Plus Jakarta Sans, Pretendard, sans-serif' }}>별 충전</h2>
        {STAR_PACKS.map((item) => (
          <button
            key={item.pack.id}
            onClick={() => setSelected(item.pack.id)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm transition-all"
            style={selected === item.pack.id ? {
              borderColor: 'rgba(208,188,255,0.5)',
              backgroundColor: 'rgba(208,188,255,0.08)',
              boxShadow: '0 0 20px rgba(208,188,255,0.1)',
            } : {
              borderColor: 'rgba(73,68,84,0.3)',
              backgroundColor: '#1f1f25',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" style={{ color: '#ffb95f' }}>&#9733;</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base" style={{ color: '#e4e1e9' }}>{item.stars}개</span>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(208,188,255,0.15)', color: '#d0bcff' }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-base" style={{ color: '#e4e1e9' }}>
                {item.price.toLocaleString()}원
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      {/* 충전 버튼 */}
      <div className="w-full max-w-md">
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-base font-semibold oracle-gradient transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ color: '#3c0091' }}
        >
          {loading ? '처리 중...' : '충전하기'}
        </button>
        <RefundNotice kind="stars" className="mt-3 text-center text-gray-500" />
      </div>
    </div>
  );
}
