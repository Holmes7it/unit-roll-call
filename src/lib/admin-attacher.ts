import { createMiddleware } from "@tanstack/react-start";
import { ADMIN_SESSION_PASSWORD_KEY } from "./admin-session";

// Forwards the admin password (stored in sessionStorage after login) to
// every server function call as the x-admin-password header. Server-side
// `requireAdmin()` verifies it against the ADMIN_PASSWORD env var.
export const attachAdminPassword = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const pw = typeof window !== "undefined"
      ? window.sessionStorage.getItem(ADMIN_SESSION_PASSWORD_KEY)
      : null;
    return next({ headers: pw ? { "x-admin-password": pw } : {} });
  },
);