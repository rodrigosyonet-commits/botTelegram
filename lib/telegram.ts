
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// ======================================================
// SEND MESSAGE
// ======================================================

export async function sendMessage(
  chatId: string,
  text: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  return response.json();
}

// ======================================================
// SEND MENU
// ======================================================

export async function sendMainMenu(
  chatId: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "📋 Centro de Soporte\n\nSeleccione una opción:",
        reply_markup: {
          keyboard: [
            ["🎫 Levantar incidencia"],
            ["📌 Consultar ticket"],
            ["👨‍💻 Hablar con soporte"],
          ],
          resize_keyboard: true,
          one_time_keyboard: false,
        },
      }),
    }
  );

  return response.json();
}

// ======================================================
// SEND INLINE PRIORITY
// ======================================================

export async function sendPrioritySelector(
  chatId: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Seleccione prioridad:",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🟢 Baja",
                callback_data: "priority_baja",
              },
            ],
            [
              {
                text: "🟡 Media",
                callback_data: "priority_media",
              },
            ],
            [
              {
                text: "🟠 Alta",
                callback_data: "priority_alta",
              },
            ],
            [
              {
                text: "🔴 Crítica",
                callback_data: "priority_critica",
              },
            ],
          ],
        },
      }),
    }
  );

  return response.json();
}

// ======================================================
// SEND PHOTO
// ======================================================

export async function sendPhoto(
  chatId: string,
  photoUrl: string,
  caption?: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/sendPhoto`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
      }),
    }
  );

  return response.json();
}

// ======================================================
// SEND DOCUMENT
// ======================================================

export async function sendDocument(
  chatId: string,
  documentUrl: string,
  caption?: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/sendDocument`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        document: documentUrl,
        caption,
      }),
    }
  );

  return response.json();
}

// ======================================================
// SEND TICKET CREATED
// ======================================================

export async function sendTicketCreated(
  chatId: string,
  ticketId: string
) {
  return sendMessage(
    chatId,
`✅ <b>Incidencia registrada correctamente</b>

🎫 Ticket: ${ticketId}

📌 Estado: Nuevo

Un agente revisará su solicitud en breve.`
  );
}

// ======================================================
// SEND ERROR
// ======================================================

export async function sendError(
  chatId: string
) {
  return sendMessage(
    chatId,
`❌ Ocurrió un problema al procesar su solicitud.

Intente nuevamente más tarde.`
  );
}

// ======================================================
// SEND UNKNOWN COMMAND
// ======================================================

export async function sendUnknownCommand(
  chatId: string
) {
  return sendMessage(
    chatId,
`No entendí la solicitud.

Escriba:

/start

para iniciar una nueva conversación.`
  );
}

// ======================================================
// REMOVE KEYBOARD
// ======================================================

export async function removeKeyboard(
  chatId: string,
  text: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: {
          remove_keyboard: true,
        },
      }),
    }
  );

  return response.json();
}

// ======================================================
// ANSWER CALLBACK QUERY
// ======================================================

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/answerCallbackQuery`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    }
  );

  return response.json();
}

// ======================================================
// EDIT MESSAGE
// ======================================================

export async function editMessage(
  chatId: string,
  messageId: number,
  text: string
) {
  const response = await fetch(
    `${TELEGRAM_API}/editMessageText`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  return response.json();
}
