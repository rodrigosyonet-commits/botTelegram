const TELEGRAM_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN!;

export async function sendMessage(
  chatId: number,
  text: string
) {
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    }
  );
}

export async function requestLocation(
  chatId: number
) {
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "📍 Por favor comparte tu ubicación.",
        reply_markup: {
          keyboard: [
            [
              {
                text: "📍 Compartir ubicación",
                request_location: true,
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }),
    }
  );
}
