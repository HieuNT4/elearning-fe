import type { VerificationSessionData } from "../types";
import { VERIFY_OCR_SESSION_KEY } from "../types";

/**
 * Session storage helpers for eKYC verification state (client-only).
 */
export function getSession(): VerificationSessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(VERIFY_OCR_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VerificationSessionData;
  } catch {
    return null;
  }
}

export function setSession(data: VerificationSessionData): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(VERIFY_OCR_SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(VERIFY_OCR_SESSION_KEY);
  } catch {
    // ignore
  }
}
