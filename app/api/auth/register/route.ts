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
    const response = await fetch(`${SERVER_CONFIG.apiBaseUrl}/v1/csrf-token/public`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return null;

    return await response.json() as CsrfResponse;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Fetch CSRF token first (Spring Boot requires it for POST)
    const csrf = await fetchCsrfToken();

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

    const response = await fetch(`${SERVER_CONFIG.apiBaseUrl}/v1/auth/register/public`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, string>;
      return NextResponse.json(
        { error: errorData.message || `Registration failed (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API Register] Error:", message);
    return NextResponse.json(
      { error: "Cannot connect to server. Please check if backend is running." },
      { status: 503 }
    );
  }
}
