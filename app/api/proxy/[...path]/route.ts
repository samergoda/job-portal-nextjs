import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG, getAcceptHeader } from "@/lib/server/config";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

type CsrfResult = {
  token: string;
  headerName: string;
  /** The raw XSRF-TOKEN cookie string issued by the backend (name=value). */
  cookie: string | null;
};

/**
 * Fetches a CSRF token from the backend, forwarding the JWT + any incoming
 * cookies so the token is issued in the SAME security context as the
 * subsequent authenticated request (important for CookieCsrfTokenRepository).
 *
 * Returns the token, the header name to use, and the raw XSRF-TOKEN cookie
 * the backend set — so we can echo the exact cookie back to the backend.
 */
async function fetchCsrfToken(token: string | undefined, incomingCookie: string): Promise<CsrfResult | null> {
  try {
    const headers: Record<string, string> = {
      Accept: getAcceptHeader(),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (incomingCookie) headers["Cookie"] = incomingCookie;

    const response = await fetch(`${SERVER_CONFIG.apiBaseUrl}/v1/csrf-token/public`, {
      method: "GET",
      headers,
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { token: string; headerName: string };

    // Capture the XSRF-TOKEN cookie the backend just issued (if any)
    const setCookie = response.headers.get("set-cookie") || "";
    const match = setCookie.match(/XSRF-TOKEN=[^;]+/);
    const cookie = match ? match[0] : `XSRF-TOKEN=${data.token}`;

    return { token: data.token, headerName: data.headerName || "X-XSRF-TOKEN", cookie };
  } catch {
    return null;
  }
}

/**
 * Proxy route handler that forwards requests from the browser to the Spring backend.
 * - JWT is read from the httpOnly cookie and sent as Authorization: Bearer (server-side).
 * - CSRF token is fetched and forwarded (header + matching cookie) for state-changing methods.
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const joined = path.join("/");
  // Prepend the /v1 version prefix to every backend request (unless already present)
  const targetPath = joined.startsWith("v1/") ? `/${joined}` : `/v1/${joined}`;
  const url = new URL(request.url);
  const queryString = url.search;
  const targetUrl = `${SERVER_CONFIG.apiBaseUrl}${targetPath}${queryString}`;

  // JWT from the httpOnly cookie — Spring reads it from the Authorization header.
  const token = request.cookies.get(SERVER_CONFIG.cookie.name)?.value;
  // Forward the browser's original cookies (JSESSIONID, etc.) to preserve session context.
  const incomingCookie = request.headers.get("cookie") || "";

  // Forward the browser's Accept header so binary endpoints (image/pdf) work.
  // Fall back to the vendor JSON type for normal API calls.
  const incomingAccept = request.headers.get("accept") || "";
  const acceptHeader =
    incomingAccept && !incomingAccept.includes("text/html")
      ? incomingAccept
      : getAcceptHeader();

  const headers: Record<string, string> = {
    Accept: acceptHeader,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cookieParts: string[] = [];
  if (incomingCookie) {
    cookieParts.push(incomingCookie);
  }

  const hasBody = !SAFE_METHODS.includes(request.method);
  if (hasBody) {
    headers["Content-Type"] = request.headers.get("content-type") || "application/json";

    // Fetch a CSRF token in the same auth/session context as this request
    const csrf = await fetchCsrfToken(token, incomingCookie);
    if (csrf) {
      // Header must match the cookie value (URL-decoded)
      headers[csrf.headerName] = decodeURIComponent(csrf.token);
      // Echo the exact XSRF-TOKEN cookie the backend issued
      if (csrf.cookie) {
        cookieParts.push(csrf.cookie);
      }
    }
  }

  if (cookieParts.length > 0) {
    headers["Cookie"] = cookieParts.join("; ");
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
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      res.cookies.set(SERVER_CONFIG.cookie.name, "", { ...SERVER_CONFIG.cookie, maxAge: 0 });
      res.cookies.set(SERVER_CONFIG.userCookie.name, "", { ...SERVER_CONFIG.userCookie, maxAge: 0 });
      return res;
    }

    const contentType = response.headers.get("content-type") || "";
    if (targetPath.includes("/picture/") || targetPath.includes("/resume/")) {
      console.log(`[Proxy binary] ${targetPath} → status ${response.status}, content-type: "${contentType}"`);
    }
    const isJson = contentType.includes("application/json");
    const isText =
      contentType.startsWith("text/") ||
      contentType.includes("json") ||
      contentType.includes("xml") ||
      contentType === "";

    let res: NextResponse;

    if (isJson) {
      const bodyText = await response.text();
      res = bodyText
        ? NextResponse.json(JSON.parse(bodyText), { status: response.status })
        : new NextResponse(null, { status: response.status });
    } else if (isText) {
      const bodyText = await response.text();
      res = new NextResponse(bodyText, {
        status: response.status,
        headers: contentType ? { "Content-Type": contentType } : undefined,
      });
    } else {
      // Binary payload (images, PDFs, etc.) — pass raw bytes through untouched.
      // Let Next compute Content-Length from the buffer to avoid mismatches.
      const buffer = await response.arrayBuffer();
      const headers = new Headers();
      headers.set("Content-Type", contentType || "application/octet-stream");
      const contentDisposition = response.headers.get("content-disposition");
      if (contentDisposition) headers.set("Content-Disposition", contentDisposition);
      res = new NextResponse(buffer, { status: response.status, headers });
    }

    // Forward any XSRF-TOKEN cookie the backend set back to the browser
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
      if (match) {
        res.cookies.set("XSRF-TOKEN", decodeURIComponent(match[1]), {
          httpOnly: false, // readable by JS/axios per Spring's default
          secure: SERVER_CONFIG.cookie.secure,
          sameSite: "lax",
          path: "/",
        });
      }
    }

    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Proxy] Error forwarding ${request.method} ${targetPath}:`, message);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
