export const ADMIN_SESSION_KEY = "isAdminLoggedIn";
export const ADMIN_SESSION_PASSWORD_KEY = "adminPassword";

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function storeAdminPassword(pw: string) {
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  window.sessionStorage.setItem(ADMIN_SESSION_PASSWORD_KEY, pw);
}

export function clearAdminSession() {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.sessionStorage.removeItem(ADMIN_SESSION_PASSWORD_KEY);
}