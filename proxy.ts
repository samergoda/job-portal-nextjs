import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth_token";

/**
 * Routes that require authentication.
 * Add new protected path prefixes here.
 */
const PROTECTED_PATHS = ["/profile", "/applied-jobs", "/saved-jobs", "/employer"];

/**
 * Routes that should redirect to home if already authenticated.
 */
const AUTH_PAGES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Redirect authenticated users away from login/register
  if (AUTH_PAGES.some((path) => pathname.startsWith(path)) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login on protected routes
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path)) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/applied-jobs/:path*",
    "/saved-jobs/:path*",
    "/employer/:path*",
    "/login",
    "/register",
  ],
};
