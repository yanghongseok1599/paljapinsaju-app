/**
 * Telegram 알림 메시지 템플릿 (HTML 포맷)
 */

export interface PaymentSuccessOptions {
  userEmail: string;
  amountKrw: number;
  starPack: string;
  stars: number;
  orderId: string;
}

export function paymentSuccessMessage(opts: PaymentSuccessOptions): string {
  return [
    '💰 <b>결제 성공</b>',
    '',
    `<b>이메일:</b> ${escapeHtml(opts.userEmail)}`,
    `<b>상품:</b> ${escapeHtml(opts.starPack)} (${opts.stars}개)`,
    `<b>금액:</b> ${opts.amountKrw.toLocaleString('ko-KR')}원`,
    `<b>주문번호:</b> <code>${escapeHtml(opts.orderId)}</code>`,
    `<b>시각:</b> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
  ].join('\n');
}

export interface PaymentFailureOptions {
  error: string;
  orderId: string;
}

export function paymentFailureMessage(opts: PaymentFailureOptions): string {
  return [
    '⚠️ <b>결제 실패</b>',
    '',
    `<b>주문번호:</b> <code>${escapeHtml(opts.orderId)}</code>`,
    `<b>오류:</b> ${escapeHtml(opts.error)}`,
    `<b>시각:</b> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
  ].join('\n');
}

export interface AdminAlertOptions {
  subject: string;
  body: string;
}

export function adminAlertMessage(opts: AdminAlertOptions): string {
  return [
    `🚨 <b>${escapeHtml(opts.subject)}</b>`,
    '',
    escapeHtml(opts.body),
    '',
    `<i>${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</i>`,
  ].join('\n');
}

/** HTML 특수문자 이스케이프 (Telegram HTML 모드) */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
