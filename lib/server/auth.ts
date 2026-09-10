import "server-only";
import { cookies } from "next/headers";
import { SERVER_CONFIG } from "@/lib/server/config";
import type { AuthUser } from "@/lib/auth-context";

/**
 * Reads the current user from cookies on the server.
 * Used by Server Components (e.g. the root layout) to render the correct
 * auth state on the first paint — no client round-trip, no flash.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SERVER_CONFIG.cookie.name)?.value;
  const userCookie = cookieStore.get(SERVER_CONFIG.userCookie.name)?.value;

  if (!token || !userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie) as AuthUser;
  } catch {
    return null;
  }
}
