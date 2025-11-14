// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl;
  const path = url.pathname;
  const token = request.cookies.get("access_token")?.value;

  const PUBLIC_ROUTES = ["/", "/login"];
  const isPublic = PUBLIC_ROUTES.includes(path);

  // 1️⃣ NOT LOGGED IN
  if (!token) {
    if (isPublic) return NextResponse.next();

    // capture the page user wanted
    const nextUrl = encodeURIComponent(path);

    return NextResponse.redirect(
      new URL(`/login?next=${nextUrl}`, request.url)
    );
  }

  // 2️⃣ LOGGED IN
  if (token) {
    // logged-in user should NOT view login page
    if (path === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicons).*)"],
};
