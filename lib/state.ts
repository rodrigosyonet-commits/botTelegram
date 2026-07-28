export type UserState = {
  step: string;

  name?: string;
  email?: string;
  description?: string;
  contactNumber?: string;

  latitude?: number;
  longitude?: number;
};

const states = new Map<number, UserState>();

export function getUserState(
  chatId: number
) {
  return states.get(chatId);
}

export function setUserState(
  chatId: number,
  data: UserState
) {
  states.set(chatId, data);
}

export function clearUserState(
  chatId: number
) {
  states.delete(chatId);
}
