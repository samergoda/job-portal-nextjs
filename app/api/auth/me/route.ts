import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG, getAcceptHeader } from "@/lib/server/config";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SERVER_CONFIG.cookie.name)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const response = await fetch(`${SERVER_CONFIG.apiBaseUrl}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: getAcceptHeader(),
      },
    });

    if (!response.ok) {
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.set(SERVER_CONFIG.cookie.name, "", {
        httpOnly: SERVER_CONFIG.cookie.httpOnly,
        secure: SERVER_CONFIG.cookie.secure,
        sameSite: SERVER_CONFIG.cookie.sameSite,
        path: SERVER_CONFIG.cookie.path,
        maxAge: 0,
      });
      return res;
    }

    const user: unknown = await response.json();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 503 }
    );
  }
}
