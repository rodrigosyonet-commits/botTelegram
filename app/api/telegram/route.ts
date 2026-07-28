import { NextRequest, NextResponse } from "next/server";

import { createTicket } from "../../../lib/monday";

import {
  getSession,
  saveSession,
  updateSession,
  deleteSession,
} from "../../../lib/state";

import {
  sendMessage,
} from "../../../lib/telegram";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    console.log(
      "TELEGRAM:",
      JSON.stringify(body)
    );

    const chatId = String(
      body?.message?.chat?.id || ""
    );

    const text =
      body?.message?.text?.trim() || "";

    if (!chatId) {
      return NextResponse.json({
        ok: true,
      });
    }

    const session =
      getSession(chatId);

    // =====================
    // START
    // =====================

    if (
      text === "/start" ||
      !session
    ) {
      saveSession(chatId, {
        step: "name",
      });

      await sendMessage(
        chatId,
        "Bienvenido.\n\nIndique su nombre completo."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================
    // NOMBRE
    // =====================

    if (session.step === "name") {
      updateSession(chatId, {
        step: "description",
        priority: text, // reutilizamos temporalmente
      });

      await sendMessage(
        chatId,
        "Describa la incidencia."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================
    // DESCRIPCIÓN
    // =====================

    if (
      session.step ===
      "description"
    ) {
      updateSession(chatId, {
        description: text,
        step: "confirm",
      });

      const updated =
        getSession(chatId);

      await sendMessage(
        chatId,
        `Resumen:

Solicitante:
${updated?.priority}

Incidencia:
${updated?.description}

Escriba CONFIRMAR`
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================
    // CONFIRMAR
    // =====================

    if (
      session.step === "confirm"
    ) {
      if (
        text.toUpperCase() !==
        "CONFIRMAR"
      ) {
        deleteSession(chatId);

        await sendMessage(
          chatId,
          "Proceso cancelado."
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const finalSession =
        getSession(chatId);

      const result =
        await createTicket(
          finalSession?.description ||
            "",
          finalSession?.priority ||
            "Usuario Telegram"
        );

      deleteSession(chatId);

      await sendMessage(
        chatId,
        `✅ Ticket creado correctamente

ID:
${result.data.create_item.id}`
      );

      return NextResponse.json({
        ok: true,
      });
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "telegram-bot",
    status: "ok",
  });
}
