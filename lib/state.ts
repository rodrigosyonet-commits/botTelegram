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

export type UserState = {
  step: string;

  name?: string;
  email?: string;
  description?: string;

  telegramId?: string;
  username?: string;

  latitude?: number;
  longitude?: number;
};

const states = new Map<number, UserState>();

export function getUserState(chatId: number) {
  return states.get(chatId);
}

export function setUserState(
  chatId: number,
  data: UserState
) {
  states.set(chatId, data);
}

export function clearUserState(chatId: number) {
  states.delete(chatId);
}
