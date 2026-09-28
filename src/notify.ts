// Telegram is optional: with no TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID set, this does nothing.
export async function telegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    if (!res.ok) console.warn(`Telegram send failed: ${res.status}`);
  } catch (err) {
    console.warn(`Telegram send failed: ${(err as Error).message}`);
  }
}
