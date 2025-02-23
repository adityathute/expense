import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("✅ Middleware triggered on:", request.nextUrl.pathname);

  const accessToken = request.cookies.get("access_token")?.value;
  console.log("🔑 Access Token:", accessToken || "No token found");

  return NextResponse.next();
}

// Apply middleware to all pages
export const config = {
  matcher: ["/:path*"], // Apply to ALL routes
};

