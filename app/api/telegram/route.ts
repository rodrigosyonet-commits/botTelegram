import { NextRequest, NextResponse } from "next/server";

import { createTicket } from "../../../lib/monday";

import {
  getUserState,
  setUserState,
  clearUserState,
} from "../../../lib/state";

import {
  sendMessage,
  requestLocation,
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

    const message = body?.message;

    if (!message) {
      return NextResponse.json({
        ok: true,
      });
    }

    const chatId = message.chat.id;

    const text =
      message.text?.trim() || "";

    let state =
      getUserState(chatId);

    // =====================================
    // START
    // =====================================

    if (
      text === "/start" ||
      !state
    ) {
      setUserState(chatId, {
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

    // =====================================
    // NOMBRE
    // =====================================

    if (state.step === "name") {
      state.name = text;
      state.step = "email";

      setUserState(chatId, state);

      await sendMessage(
        chatId,
        "Indique su correo electrónico."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================================
    // EMAIL
    // =====================================

    if (state.step === "email") {
      state.email = text;
      state.step = "phone";

      setUserState(chatId, state);

      await sendMessage(
        chatId,
        "Indique su número de contacto."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================================
    // TELEFONO
    // =====================================

    if (state.step === "phone") {
      state.contactNumber = text;
      state.step = "description";

      setUserState(chatId, state);

      await sendMessage(
        chatId,
        "Describa la incidencia."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================================
    // DESCRIPCION
    // =====================================

    if (
      state.step === "description"
    ) {
      state.description = text;
      state.step = "location";

      setUserState(chatId, state);

      await requestLocation(
        chatId
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================================
    // UBICACION
    // =====================================

    if (
      state.step === "location" &&
      message.location
    ) {
      state.latitude =
        message.location.latitude;

      state.longitude =
        message.location.longitude;

      state.step = "confirm";

      setUserState(chatId, state);

      await sendMessage(
        chatId,
        `Resumen:

👤 Nombre:
${state.name}

📧 Correo:
${state.email}

📞 Teléfono:
${state.contactNumber}

📝 Descripción:
${state.description}

📍 Ubicación capturada

Escriba CONFIRMAR para generar el ticket.`
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =====================================
    // CONFIRMACION
    // =====================================

    if (
      state.step === "confirm"
    ) {
      if (
        text.toUpperCase() !==
        "CONFIRMAR"
      ) {
        clearUserState(chatId);

        await sendMessage(
          chatId,
          "Proceso cancelado."
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const result =
        await createTicket(
          state.description || "",
          state.name || "",
          state.email || "",
          state.contactNumber || "",
          state.latitude || 0,
          state.longitude || 0
        );

      clearUserState(chatId);

      await sendMessage(
        chatId,
        `✅ Ticket creado correctamente

🎫 ID:
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
    console.error(
      "ERROR:",
      error
    );

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
