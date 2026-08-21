import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG, getAcceptHeader } from "@/lib/server/config";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const response = await fetch(`${SERVER_CONFIG.apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: getAcceptHeader(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, string>;
      return NextResponse.json(
        { error: errorData.message || `Authentication failed (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json() as { jwtToken?: string; user?: Record<string, unknown> };

    if (!data.jwtToken) {
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ user: data.user });

    res.cookies.set(SERVER_CONFIG.cookie.name, data.jwtToken, {
      httpOnly: SERVER_CONFIG.cookie.httpOnly,
      secure: SERVER_CONFIG.cookie.secure,
      sameSite: SERVER_CONFIG.cookie.sameSite,
      path: SERVER_CONFIG.cookie.path,
      maxAge: SERVER_CONFIG.cookie.maxAge,
    });

    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API Login] Error:", message);
    return NextResponse.json(
      { error: "Cannot connect to server. Please check if backend is running." },
      { status: 503 }
    );
  }
}
