export interface UserSession {
  step: string;
  description?: string;
  priority?: string;
}

const sessions = new Map<string, UserSession>();

export function getSession(
  chatId: string
): UserSession | null {
  return sessions.get(chatId) || null;
}

export function saveSession(
  chatId: string,
  session: UserSession
) {
  sessions.set(chatId, session);
}

export function updateSession(
  chatId: string,
  partial: Partial<UserSession>
) {
  const current = sessions.get(chatId);

  if (!current) {
    const session: UserSession = {
      step: "start",
      ...partial,
    };

    sessions.set(chatId, session);

    return session;
  }

  const updated: UserSession = {
    ...current,
    ...partial,
  };

  sessions.set(chatId, updated);

  return updated;
}

export function deleteSession(
  chatId: string
) {
  sessions.delete(chatId);
}
