export const FURSAHUB_USER_KEY = "fursahub_user";
export const FURSAHUB_EARNED_SESSIONS_KEY = "fursahub_earned_sessions";
export const ACTIVATION_FEE = 14000;
export const MIN_WITHDRAWAL = 50000;
export const WITHDRAWAL_URL = "https://kozenasite.site/register?ref=Torento";

export type ActivationService = "chat" | "mikopo" | "ajira";
export const ACTIVATION_FEES: Record<ActivationService, number> = { chat: 14000, mikopo: 15000, ajira: 16000 };
export const SERVICE_LABELS: Record<ActivationService, string> = { chat: "Chat na Kulipwa", mikopo: "Mikopo", ajira: "Ajira Nje" };

export type FursaUser = {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  country: string;
  password: string;
  service: ActivationService;
  activationFee: number;
  paid: boolean;
  balance: number;
  chats: number;
  registeredAt: string;
  lastPaymentId?: string;
  lastPaymentReference?: string;
};

export function getFursaUser(): FursaUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FURSAHUB_USER_KEY);
    return raw ? (JSON.parse(raw) as FursaUser) : null;
  } catch { return null; }
}
export function saveFursaUser(user: FursaUser) { window.localStorage.setItem(FURSAHUB_USER_KEY, JSON.stringify(user)); }
export function updateFursaUser(patch: Partial<FursaUser>): FursaUser | null {
  const current = getFursaUser(); if (!current) return null;
  const next = { ...current, ...patch }; saveFursaUser(next);
  window.dispatchEvent(new CustomEvent("fursahub-user-updated")); return next;
}
export function isSessionEarned(seed: string) {
  if (typeof window === "undefined") return false;
  try { const raw = window.localStorage.getItem(FURSAHUB_EARNED_SESSIONS_KEY); return (raw ? JSON.parse(raw) as string[] : []).includes(seed); } catch { return false; }
}
export function markSessionEarned(seed: string) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(FURSAHUB_EARNED_SESSIONS_KEY); const sessions = raw ? JSON.parse(raw) as string[] : [];
  if (!sessions.includes(seed)) { sessions.push(seed); window.localStorage.setItem(FURSAHUB_EARNED_SESSIONS_KEY, JSON.stringify(sessions)); }
}
