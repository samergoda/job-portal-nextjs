import "server-only";

/**
 * Server-side configuration. This module can ONLY be imported in server components
 * or route handlers — never from client code.
 */

export const SERVER_CONFIG = {
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8080/api",
  apiVersion: process.env.API_VERSION || "v1",
  cookie: {
    name: process.env.AUTH_COOKIE_NAME || "auth_token",
    maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE) || 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
  // Non-sensitive user display data. Readable so /me can restore the session
  // without hitting the backend. The JWT itself stays httpOnly.
  userCookie: {
    name: process.env.USER_COOKIE_NAME || "auth_user",
    maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE) || 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
} as const;

export function getAcceptHeader(version?: string): string {
  return `application/vnd.eazyapp+json;v=${version || SERVER_CONFIG.apiVersion}`;
}
