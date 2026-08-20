import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";
const COOKIE_NAME = "auth_token";
const API_VERSION = "1.0";

/**
 * Proxy route handler that forwards authenticated requests to the backend.
 * The JWT is read from the httpOnly cookie — never exposed to client JS.
 */
async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = `/${path.join("/")}`;
  const url = new URL(request.url);
  const queryString = url.search;
  const targetUrl = `${API_BASE_URL}${targetPath}${queryString}`;

  const token = request.cookies.get(COOKIE_NAME)?.value;

  const headers: Record<string, string> = {
    Accept: `application/vnd.eazyapp+json;v=${API_VERSION}`,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Forward content-type and body for non-GET requests
  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (hasBody) {
    headers["Content-Type"] = request.headers.get("content-type") || "application/json";
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

    // Handle 401 — clear cookie
    if (response.status === 401) {
      const res = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error: any) {
    console.error(`[Proxy] Error forwarding ${request.method} ${targetPath}:`, error.message);
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
