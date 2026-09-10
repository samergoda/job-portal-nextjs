import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG } from "@/lib/server/config";

/**
 * Returns the current user based on the auth cookies.
 * - The JWT (httpOnly) proves the session is valid.
 * - The user cookie holds non-sensitive display data captured at login.
 *
 * We don't call the backend here because a generic "who am I" endpoint that
 * works for every role isn't guaranteed. The JWT presence + stored user data
 * is enough to restore the client session after a refresh.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SERVER_CONFIG.cookie.name)?.value;
  const userCookie = request.cookies.get(SERVER_CONFIG.userCookie.name)?.value;

  if (!token || !userCookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user: unknown = JSON.parse(userCookie);
    return NextResponse.json({ user });
  } catch {
    // Corrupted cookie — clear both and require re-login
    const res = NextResponse.json({ user: null }, { status: 401 });
    res.cookies.set(SERVER_CONFIG.cookie.name, "", { ...SERVER_CONFIG.cookie, maxAge: 0 });
    res.cookies.set(SERVER_CONFIG.userCookie.name, "", { ...SERVER_CONFIG.userCookie, maxAge: 0 });
    return res;
  }
}
