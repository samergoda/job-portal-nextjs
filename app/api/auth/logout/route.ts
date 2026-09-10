import { NextResponse } from "next/server";
import { SERVER_CONFIG } from "@/lib/server/config";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Clear both the JWT and user cookies
  res.cookies.set(SERVER_CONFIG.cookie.name, "", {
    httpOnly: SERVER_CONFIG.cookie.httpOnly,
    secure: SERVER_CONFIG.cookie.secure,
    sameSite: SERVER_CONFIG.cookie.sameSite,
    path: SERVER_CONFIG.cookie.path,
    maxAge: 0,
  });

  res.cookies.set(SERVER_CONFIG.userCookie.name, "", {
    httpOnly: SERVER_CONFIG.userCookie.httpOnly,
    secure: SERVER_CONFIG.userCookie.secure,
    sameSite: SERVER_CONFIG.userCookie.sameSite,
    path: SERVER_CONFIG.userCookie.path,
    maxAge: 0,
  });

  return res;
}
