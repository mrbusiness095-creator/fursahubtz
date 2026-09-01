export const FURSAHUB_USER_KEY = "fursahub_user";
export const FURSAHUB_EARNED_SESSIONS_KEY = "fursahub_earned_sessions";
export const ACTIVATION_FEE = 14500;
export const MIN_WITHDRAWAL = 50000;
export const WITHDRAWAL_URL = "https://kozenasite.site/register?ref=Torento";

export type FursaUser = {
  name: string;
  username: string;
  phone: string;
  email: string;
  country: string;
  password: string;
  paid: boolean;
  balance: number;
  chats: number;
  registeredAt: string;
  lastPaymentOrderId?: string;
};

export function getFursaUser(): FursaUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FURSAHUB_USER_KEY);
    return raw ? (JSON.parse(raw) as FursaUser) : null;
  } catch {
    return null;
  }
}

export function saveFursaUser(user: FursaUser) {
  window.localStorage.setItem(FURSAHUB_USER_KEY, JSON.stringify(user));
}

export function updateFursaUser(patch: Partial<FursaUser>): FursaUser | null {
  const current = getFursaUser();
  if (!current) return null;
  const next = { ...current, ...patch };
  saveFursaUser(next);
  window.dispatchEvent(new CustomEvent("fursahub-user-updated"));
  return next;
}

export function isSessionEarned(seed: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(FURSAHUB_EARNED_SESSIONS_KEY);
    const sessions = raw ? (JSON.parse(raw) as string[]) : [];
    return sessions.includes(seed);
  } catch {
    return false;
  }
}

export function markSessionEarned(seed: string) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(FURSAHUB_EARNED_SESSIONS_KEY);
  const sessions = raw ? (JSON.parse(raw) as string[]) : [];
  if (!sessions.includes(seed)) {
    sessions.push(seed);
    window.localStorage.setItem(FURSAHUB_EARNED_SESSIONS_KEY, JSON.stringify(sessions));
  }
}
