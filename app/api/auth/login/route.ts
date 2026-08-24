import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG, getAcceptHeader } from "@/lib/server/config";

type CsrfResponse = {
  token: string;
  headerName: string;
};

/**
 * Fetches a CSRF token from the backend.
 * The backend returns { token, headerName } in the JSON body.
 */
async function fetchCsrfToken(): Promise<CsrfResponse | null> {
  try {
    const response = await fetch(`${SERVER_CONFIG.apiBaseUrl}/csrf-token/public`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = await response.json() as CsrfResponse;
    return data;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Fetch CSRF token first (Spring Boot requires it for POST)
    const csrf = await fetchCsrfToken();
console.log("csrf",csrf);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: getAcceptHeader(),
    };

    if (csrf) {
      // Set the CSRF token in the header (using the headerName from backend)
      headers[csrf.headerName] = csrf.token;
      // Also set the CSRF token as a cookie for Spring's CookieCsrfTokenRepository validation
      headers["Cookie"] = `XSRF-TOKEN=${csrf.token}`;
    }

    const response = await fetch(`${SERVER_CONFIG.apiBaseUrl}/auth/login/public`, {
      method: "POST",
      headers,
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
