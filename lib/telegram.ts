const TELEGRAM_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN!;

export async function sendMessage(
  chatId: string,
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

export async function sendMainMenu(
  chatId: string
) {
  await sendMessage(
    chatId,
    `👋 Bienvenido al Centro de Soporte

1️⃣ Levantar incidencia

Responde con:
1`
  );
}

export async function sendTicketCreated(
  chatId: string,
  ticketId: string
) {
  await sendMessage(
    chatId,
    `✅ Ticket creado correctamente

🎫 Ticket ID:
${ticketId}

Estado: Nuevo`
  );
}

export async function requestLocation(
  chatId: number
) {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "📍 Por favor comparta su ubicación.",
        reply_markup: {
          keyboard: [
            [
              {
                text: "📍 Compartir ubicación",
                request_location: true
              }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      })
    }
  );
}
