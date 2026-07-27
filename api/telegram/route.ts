import { NextRequest, NextResponse } from "next/server";

import { createIncident } from "@/lib/monday";

import {
  getSession,
  saveSession,
  updateSession,
  deleteSession,
} from "@/lib/state";

import {
  sendMessage,
  sendMainMenu,
  sendTicketCreated,
} from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(
      "📥 TELEGRAM:",
      JSON.stringify(body, null, 2)
    );

    const message = body?.message;

    if (!message) {
      return NextResponse.json({
        success: true,
      });
    }

    const chatId = String(message.chat.id);

    const telegramName =
      [
        message.from?.first_name,
        message.from?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Usuario Telegram";

    const text = message.text?.trim() || "";

    console.log("👤 Usuario:", telegramName);
    console.log("💬 Mensaje:", text);

    // =====================================
    // /START
    // =====================================

    if (text === "/start") {
      saveSession(chatId, {
        step: "menu",
      });

      await sendMainMenu(chatId);

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================
    // SESIÓN ACTUAL
    // =====================================

    const session = getSession(chatId);

    console.log("🗂️ Session:", session);

    // =====================================
    // MENÚ PRINCIPAL
    // =====================================

    if (
      text === "1" ||
      text === "🎫 Levantar incidencia"
    ) {
      saveSession(chatId, {
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

    // =====================================
    // CAPTURA DESCRIPCIÓN
    // =====================================

    if (session?.step === "description") {
      updateSession(chatId, {
        description: text,
        step: "priority",
      });

      await sendMessage(
        chatId,
        `Seleccione la prioridad:

1️⃣ Baja
2️⃣ Media
3️⃣ Alta
4️⃣ Crítica`
      );

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================
    // CAPTURA PRIORIDAD
    // =====================================

    if (session?.step === "priority") {
      let priority = "";

      switch (text) {
        case "1":
        case "1️⃣":
          priority = "Baja";
          break;

        case "2":
        case "2️⃣":
          priority = "Media";
          break;

        case "3":
        case "3️⃣":
          priority = "Alta";
          break;

        case "4":
        case "4️⃣":
          priority = "Crítica";
          break;

        default:
          await sendMessage(
            chatId,
            "⚠️ Seleccione una prioridad válida:\n\n1️⃣ Baja\n2️⃣ Media\n3️⃣ Alta\n4️⃣ Crítica"
          );

          return NextResponse.json({
            success: true,
          });
      }

      updateSession(chatId, {
        priority,
        step: "creating-ticket",
      });

      const finalSession = getSession(chatId);

      console.log(
        "🎫 Creando ticket:",
        finalSession
      );

      // =====================================
      // CREAR ITEM EN MONDAY
      // =====================================

      const item = await createIncident({
        applicant: telegramName,
        telegramId: chatId,
        priority,
        description:
          finalSession?.description || "",
      });

      deleteSession(chatId);

      await sendTicketCreated(
        chatId,
        item.id
      );

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================
    // CONSULTAR TICKET
    // =====================================

    if (
      text === "📌 Consultar ticket"
    ) {
      await sendMessage(
        chatId,
        `🚧 Funcionalidad en construcción.

Próximamente podrás consultar tickets desde Telegram.`
      );

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================
    // SOPORTE
    // =====================================

    if (
      text === "👨‍💻 Hablar con soporte"
    ) {
      await sendMessage(
        chatId,
        `📞 Un asesor se pondrá en contacto contigo a la brevedad.`
      );

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================
    // SIN SESIÓN
    // =====================================

    if (!session) {
      await sendMessage(
        chatId,
        `👋 Bienvenido.

Escriba:

/start

para iniciar una nueva solicitud.`
      );

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================
    // FALLBACK
    // =====================================

    await sendMessage(
      chatId,
      "No entendí tu mensaje. Escribe /start para comenzar."
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      "❌ ERROR TELEGRAM:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Error interno",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================
// GET
// =====================================

export async function GET() {
  return NextResponse.json({
    service: "Telegram Bot",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
}
