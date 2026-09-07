export const ADMIN_AUTH_TOKEN_KEY = "digivideas_admin_session";
export const EXPECTED_ADMIN_PASSCODE =
  process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
  process.env.ADMIN_PASSCODE ||
  "MuazDigivideas285561.";

export interface AdminSessionState {
  isAuthenticated: boolean;
  username: string;
  loginTime?: number;
}

export function checkAdminPasscode(passcode: string): boolean {
  return passcode.trim() === EXPECTED_ADMIN_PASSCODE.trim();
}

export function setAdminSession(): void {
  if (typeof window === "undefined") return;
  const sessionData: AdminSessionState = {
    isAuthenticated: true,
    username: "Muaz (Kurucu & Yönetici)",
    loginTime: Date.now(),
  };
  try {
    localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, JSON.stringify(sessionData));
    document.cookie = `${ADMIN_AUTH_TOKEN_KEY}=true; path=/; max-age=86400; SameSite=Strict`;
    window.dispatchEvent(new Event("digivideas_auth_changed"));
  } catch (e) {
    console.error("Failed to set admin session:", e);
  }
}

export function getAdminSession(): AdminSessionState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, username: "" };
  }
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
    if (!raw) return { isAuthenticated: false, username: "" };
    const parsed = JSON.parse(raw) as AdminSessionState;
    return parsed.isAuthenticated ? parsed : { isAuthenticated: false, username: "" };
  } catch {
    return { isAuthenticated: false, username: "" };
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
    document.cookie = `${ADMIN_AUTH_TOKEN_KEY}=; path=/; max-age=0`;
    window.dispatchEvent(new Event("digivideas_auth_changed"));
  } catch (e) {
    console.error("Failed to clear admin session:", e);
  }
}
