import { NextResponse } from "next/server";
import { SERVER_CONFIG } from "@/lib/server/config";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set(SERVER_CONFIG.cookie.name, "", {
    httpOnly: SERVER_CONFIG.cookie.httpOnly,
    secure: SERVER_CONFIG.cookie.secure,
    sameSite: SERVER_CONFIG.cookie.sameSite,
    path: SERVER_CONFIG.cookie.path,
    maxAge: 0,
  });

  return res;
}
