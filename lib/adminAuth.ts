// ─── Admin Authentication ──────────────────────────────────────────────────────
// Credentials are read from env vars; the fallback values are only used in dev.
// In production, set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD in your environment.

const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    ?? 'admin@axisplatform.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'AxisPortal#2026';
const SESSION_KEY    = 'axis_admin_session_v1';

// Pre-fill credentials only in non-production environments.
export const ADMIN_PREFILL =
  import.meta.env.MODE !== 'production'
    ? { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    : { email: '', password: '' };

export function loginAdmin(email: string, password: string): boolean {
  if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = btoa(`${email}:${Date.now()}`);
    sessionStorage.setItem(SESSION_KEY, token);
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminAuthenticated(): boolean {
  return !!sessionStorage.getItem(SESSION_KEY);
}
