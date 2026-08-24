import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG, getAcceptHeader } from "@/lib/server/config";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

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

/**
 * Proxy route handler that forwards authenticated requests to the backend.
 * - JWT is read from the httpOnly cookie — never exposed to client JS.
 * - CSRF token is fetched and forwarded for state-changing methods.
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = `/${path.join("/")}`;
  const url = new URL(request.url);
  const queryString = url.search;
  const targetUrl = `${SERVER_CONFIG.apiBaseUrl}${targetPath}${queryString}`;

  const token = request.cookies.get(SERVER_CONFIG.cookie.name)?.value;

  const headers: Record<string, string> = {
    Accept: getAcceptHeader(),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const hasBody = !SAFE_METHODS.includes(request.method);
  if (hasBody) {
    headers["Content-Type"] = request.headers.get("content-type") || "application/json";

    // Fetch and attach CSRF token for state-changing requests
    const csrf = await fetchCsrfToken();
    if (csrf) {
      // Set the CSRF token in the header (using the headerName from backend)
      headers[csrf.headerName] = csrf.token;
      // Also set the CSRF token as a cookie for Spring's CookieCsrfTokenRepository validation
      headers["Cookie"] = `XSRF-TOKEN=${csrf.token}`;
    }
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (hasBody) {
      fetchOptions.body = await request.text();
    }

    const response = await fetch(targetUrl, fetchOptions);

    if (response.status === 401) {
      const res = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      res.cookies.set(SERVER_CONFIG.cookie.name, "", {
        httpOnly: SERVER_CONFIG.cookie.httpOnly,
        secure: SERVER_CONFIG.cookie.secure,
        sameSite: SERVER_CONFIG.cookie.sameSite,
        path: SERVER_CONFIG.cookie.path,
        maxAge: 0,
      });
      return res;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data: unknown = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Proxy] Error forwarding ${request.method} ${targetPath}:`, message);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
