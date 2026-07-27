
export interface UserSession {
  step: string;
  description?: string;
  priority?: string;
  category?: string;
}

const sessions = new Map<string, UserSession>();

// =====================================
// OBTENER SESIÓN
// =====================================

export function getSession(
  chatId: string
): UserSession | null {
  return sessions.get(chatId) ?? null;
}

// =====================================
// GUARDAR SESIÓN
// =====================================

export function saveSession(
  chatId: string,
  session: UserSession
) {
  sessions.set(chatId, session);
}

// =====================================
// ACTUALIZAR SESIÓN
// =====================================

export function updateSession(
  chatId: string,
  data: Partial<UserSession>
) {
  const current = sessions.get(chatId);

  if (!current) {
    const newSession = {
      step: "start",
      ...data,
    } as UserSession;

    sessions.set(chatId, newSession);

    return newSession;
  }

  const updated = {
    ...current,
    ...data,
  };

  sessions.set(chatId, updated);

  return updated;
}

// =====================================
// ELIMINAR SESIÓN
// =====================================

export function deleteSession(
  chatId: string
) {
  sessions.delete(chatId);
}

// =====================================
// REINICIAR
// =====================================

export function resetSession(
  chatId: string
) {
  sessions.set(chatId, {
    step: "menu",
  });
}

// =====================================
// EXISTE
// =====================================

export function hasSession(
  chatId: string
): boolean {
  return sessions.has(chatId);
}
