import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isRateLimited } from "@/lib/rate-limit";

/** Auth paths that should be rate-limited (sign-in, sign-up, OAuth, callbacks). */
const AUTH_RATE_LIMITED_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/callback"];

function isAuthPath(pathname: string): boolean {
  return AUTH_RATE_LIMITED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Best-effort IP extraction — works on Vercel and most proxies. */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function middleware(request: NextRequest) {
  // Rate limit auth endpoints to prevent brute-force and credential stuffing.
  // Gracefully skipped when UPSTASH_REDIS_REST_URL is not configured.
  if (isAuthPath(request.nextUrl.pathname)) {
    const ip = getClientIp(request);
    const { limited, reset } = await isRateLimited(ip);

    if (limited) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          "Content-Type": "text/plain",
        },
      });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (build output)
     * - _next/image  (image optimizer)
     * - favicon.ico
     * - /api/v1/*   (public JSON API — no session needed)
     * - common image/static asset extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|api/v1/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
