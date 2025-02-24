import { NextResponse } from "next/server";

export async function middleware(request) {
  console.log("✅ Middleware triggered on:", request.nextUrl.pathname);

  let accessToken = request.cookies.get("access_token")?.value;
  console.log("🔑 Access Token:", accessToken || "No token found");

  // ✅ Allow access to the Next.js login page without any checks
  if (request.nextUrl.pathname === "/login") {
    console.log("🟢 Allowing access to /login page.");
    return NextResponse.next();
  }

  if (!accessToken) {
    console.log("🔄 No token found, requesting from expense backend...");

    try {
      const response = await fetch("http://127.0.0.1:8001/auth/request-token", {
        method: "GET",
        credentials: "include",
      });

      let data = {};
      if (response.ok) {
        data = await response.json(); // Parse JSON only if response is OK
      } else {
        console.warn("⚠ Backend returned non-200 response, skipping JSON parsing.");
      }

      if (data.access_token) {
        accessToken = data.access_token;
        console.log("✅ Token received from expense backend.");

        // ✅ Store the token in a secure HTTP-only cookie
        const nextResponse = NextResponse.next();
        nextResponse.cookies.set("access_token", accessToken, {
          httpOnly: true,
          secure: true,
          path: "/",
        });

        return nextResponse;
      }

      console.log("❌ No token found. Doing nothing (No Redirect).");
      return NextResponse.next(); // ✅ Do nothing, just allow request to continue
    } catch (error) {
      console.error("❌ Error requesting token:", error);
      return NextResponse.next(); // ✅ Do nothing, just allow request to continue
    }
  }

  return NextResponse.next();
}

// ✅ Protect only specific pages (but do nothing if unauthorized)
export const config = {
  matcher: ["/transactions/:path*", "/accounts/:path*"], // Apply only to protected pages
};
