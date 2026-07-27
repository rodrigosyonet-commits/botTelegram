
import { NextRequest, NextResponse } from "next/server";
import { createIncident } from "../../../lib/monday";
import {
  getSession,
  saveSession,
  updateSession,
  deleteSession,
} from "../../../lib/state";

import {
  sendMessage,
  sendMainMenu,
  sendTicketCreated,
} from "../../../lib/telegram";

export async function POST(
  req: NextRequest
) {

  const body = await req.json();

  const chatId =
    body.message?.chat?.id;

  const text =
    body.message?.text || "";

  if (!chatId) {
    return NextResponse.json({
      ok: true
    });
  }

  let state = getUserState(chatId);

  if (
    text === "/start" ||
    !state
  ) {

    setUserState(chatId, {
      step: "name"
    });

    await sendTelegramMessage(
      chatId,
      "Bienvenido.\n\nIndique su nombre completo."
    );

    return NextResponse.json({
      ok: true
    });
  }

  if (state.step === "name") {

    state.name = text;
    state.step = "description";

    setUserState(chatId, state);

    await sendTelegramMessage(
      chatId,
      "Describa la incidencia."
    );

    return NextResponse.json({
      ok: true
    });
  }

  if (state.step === "description") {

    state.description = text;
    state.step = "confirm";

    setUserState(chatId, state);

    await sendTelegramMessage(
      chatId,
      `Resumen:

Solicitante:
${state.name}

Incidencia:
${state.description}

Escriba CONFIRMAR`
    );

    return NextResponse.json({
      ok: true
    });
  }

  if (state.step === "confirm") {

    if (
      text.toUpperCase() !==
      "CONFIRMAR"
    ) {

      clearUserState(chatId);

      await sendTelegramMessage(
        chatId,
        "Proceso cancelado."
      );

      return NextResponse.json({
        ok: true
      });
    }

    const result =
      await createTicket(
        state.description!,
        state.name!
      );

    clearUserState(chatId);

    await sendTelegramMessage(
      chatId,
      `✅ Ticket creado correctamente

ID:
${result?.data?.create_item?.id || "N/A"}`
    );
  }

  return NextResponse.json({
    ok: true
  });
}
