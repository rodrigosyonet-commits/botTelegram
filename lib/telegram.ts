const TELEGRAM_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(
  chatId: number,
  text: string
) {

  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    }
  );
}
