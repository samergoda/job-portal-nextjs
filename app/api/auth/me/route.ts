import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";
const COOKIE_NAME = "auth_token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.eazyapp+json;v=1.0",
      },
    });

    if (!response.ok) {
      // Token is invalid or expired — clear it
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    const user = await response.json();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 503 }
    );
  }
}
