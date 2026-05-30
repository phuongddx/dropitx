import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const securityHeaders: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-xss-protection": "1; mode=block",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers to every response
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // HSTS only in production (avoids issues on localhost)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "strict-transport-security",
      "max-age=31536000; includeSubDomains"
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and OG image generation
    "/((?!_next/static|_next/image|favicon.ico|api/og-image).*)",
  ],
};
