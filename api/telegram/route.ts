import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const MONDAY_API_KEY = process.env.MONDAY_API_KEY!;

const BOARD_ID = 18422912060;

// ======================================
// ESTADO TEMPORAL
// ======================================

const sessions = new Map<
  string,
  {
    step: string;
    description?: string;
  }
>();

// ======================================
// POST WEBHOOK TELEGRAM
// ======================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message = body?.message;

    if (!message) {
      return NextResponse.json({
        success: true,
      });
    }

    const chatId = String(message.chat.id);

    const telegramName = [
      message.from?.first_name,
      message.from?.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    const text = message.text?.trim() || "";

    const session = sessions.get(chatId);

    // ======================================
    // START
    // ======================================

    if (text === "/start") {
      sessions.set(chatId, {
        step: "menu",
      });

      await sendMessage(
        chatId,
        `👋 Bienvenido al Centro de Soporte

1️⃣ Levantar incidencia

Responde con:
1`
      );

      return NextResponse.json({
        success: true,
      });
    }

    // ======================================
    // MENU
    // ======================================

    if (session?.step === "menu") {
      if (text === "1") {
        sessions.set(chatId, {
          step: "description",
        });

        await sendMessage(
          chatId,
          "📝 Describe detalladamente el problema."
        );

        return NextResponse.json({
          success: true,
        });
      }
    }

    // ======================================
    // DESCRIPCIÓN
    // ======================================

    if (session?.step === "description") {
      sessions.set(chatId, {
        step: "priority",
        description: text,
      });

      await sendMessage(
        chatId,
        `Selecciona la prioridad:

1️⃣ Baja
2️⃣ Media
3️⃣ Alta
4️⃣ Crítica`
      );

      return NextResponse.json({
        success: true,
      });
    }

    // ======================================
    // PRIORIDAD
    // ======================================

    if (session?.step === "priority") {
      const prioridades: Record<string, string> = {
        "1": "Baja",
        "2": "Media",
        "3": "Alta",
        "4": "Crítica",
      };

      const prioridad = prioridades[text];

      if (!prioridad) {
        await sendMessage(
          chatId,
          "Seleccione una opción válida (1,2,3 o 4)"
        );

        return NextResponse.json({
          success: true,
        });
      }

      const itemId = await createIncident({
        applicant: telegramName || "Solicitante",
        telegramId: chatId,
        priority: prioridad,
        description: session.description || "",
      });

      sessions.delete(chatId);

      await sendMessage(
        chatId,
        `✅ Incidencia registrada correctamente.

🎫 Ticket ID: ${itemId}

Estado: Nuevo`
      );

      return NextResponse.json({
        success: true,
      });
    }

    // ======================================
    // DEFAULT
    // ======================================

    await sendMessage(
      chatId,
      `Escriba /start para iniciar.`
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================
// TELEGRAM
// ======================================

async function sendMessage(
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

// ======================================
// MONDAY
// ======================================

async function mondayQuery(query: string) {
  const response = await fetch(
    "https://api.monday.com/v2",
    {
      method: "POST",
      headers: {
        Authorization: MONDAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    }
  );

  const data = await response.json();

  if (data.errors) {
    throw new Error(
      JSON.stringify(data.errors)
    );
  }

  return data.data;
}

// ======================================
// CREAR INCIDENCIA
// ======================================

async function createIncident({
  applicant,
  telegramId,
  priority,
  description,
}: {
  applicant: string;
  telegramId: string;
  priority: string;
  description: string;
}) {
  const values = JSON.stringify({
    color_mm5hpkcz: {
      label: "Whatsapp",
    },

    color_mm5ehr79: {
      label: "Nuevo",
    },

    text_mm5gsejq: applicant,
  });

  const mutation = `
    mutation {
      create_item(
        board_id: ${BOARD_ID},
        item_name: ${JSON.stringify(description.substring(0, 120))},
        column_values: ${JSON.stringify(values)}
      ) {
        id
        name
      }
    }
  `;

  const data = await mondayQuery(mutation);

  const itemId = data.create_item.id;

  await createUpdate(
    itemId,
`🚨 NUEVA INCIDENCIA

👤 Solicitante:
${applicant}

🆔 Telegram:
${telegramId}

⚠️ Prioridad:
${priority}

📝 Descripción:

${description}`
  );

  return itemId;
}

// ======================================
// UPDATE
// ======================================

async function createUpdate(
  itemId: string,
  text: string
) {
  const mutation = `
    mutation {
      create_update(
        item_id: ${itemId},
        body: ${JSON.stringify(text)}
      ) {
        id
      }
    }
  `;

  await mondayQuery(mutation);
}
