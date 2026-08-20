import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.eazyapp+json;v=1.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Authentication failed (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.jwtToken) {
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 }
      );
    }

    // Return user data to the client, but store the token in an httpOnly cookie
    const res = NextResponse.json({ user: data.user });

    res.cookies.set(COOKIE_NAME, data.jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return res;
  } catch (error: any) {
    console.error("[API Login] Error:", error.message);
    return NextResponse.json(
      { error: "Cannot connect to server. Please check if backend is running." },
      { status: 503 }
    );
  }
}
