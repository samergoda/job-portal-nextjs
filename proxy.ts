import { NextRequest, NextResponse } from "next/server";

function getCookieName(){
  const name = process.env.AUTH_COOKIE_NAME;
  if (!name) {
    throw new Error("AUTH_COOKIE_NAME environment variable is required");
  }
  return name;
}

/**
 * Routes that require authentication.
 */
const PROTECTED_PATHS = ["/profile", "/applied-jobs", "/saved-jobs", "/employer", "/admin", "/job-applicants"];

/**
 * Routes that should redirect to home if already authenticated.
 */
const AUTH_PAGES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const cookieName = getCookieName();
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(cookieName)?.value;

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
    "/admin/:path*",
    "/job-applicants/:path*",
    "/login",
    "/register",
  ],
};
