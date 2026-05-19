/**
 * Telegram Bot 알림 클라이언트
 * 환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_PAYMENTS_CHAT_ID
 *
 * 설계 원칙: fire-and-forget — 알림 실패가 결제 흐름을 절대 차단하지 않음.
 */

export interface SendNotificationOptions {
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export async function sendNotification({
  text,
  parseMode = 'HTML',
}: SendNotificationOptions): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_PAYMENTS_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN 또는 TELEGRAM_PAYMENTS_CHAT_ID가 설정되지 않았습니다. 알림 스킵.');
    return;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '(body unavailable)');
      console.error(`[Telegram] sendMessage 실패: ${res.status} ${body}`);
    }
  } catch (err) {
    // 알림 전송 실패는 결제 흐름에 영향 없음 — 로그만 남김
    console.error('[Telegram] sendMessage 에러:', err);
  }
}
