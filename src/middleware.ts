import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

/**
 * Per-path rate limit budgets for auth endpoints.
 * Keys are exact path prefixes; first match wins.
 *
 * These limits are intentionally loose enough for real users but tight
 * enough to slow credential-stuffing attacks meaningfully:
 *   sign-in:         5 attempts / 15 min  (brute-force protection)
 *   sign-up:         3 attempts / hour    (account-farming protection)
 *   forgot-password: 3 attempts / hour    (email-spam / enumeration protection)
 *   callback:       20 attempts / min     (OAuth code-exchange — must be generous)
 */
const RATE_LIMIT_CONFIGS: Record<string, { limit: number; windowMs: number }> = {
  "/auth/sign-in": { limit: 5, windowMs: 15 * 60 * 1_000 },
  "/auth/sign-up": { limit: 3, windowMs: 60 * 60 * 1_000 },
  "/auth/forgot-password": { limit: 3, windowMs: 60 * 60 * 1_000 },
  "/auth/callback": { limit: 20, windowMs: 60 * 1_000 },
};

/** Returns the matching config entry for a pathname, or undefined if not rate-limited. */
function matchRateLimit(
  pathname: string
): [string, { limit: number; windowMs: number }] | undefined {
  return Object.entries(RATE_LIMIT_CONFIGS).find(
    ([path]) => pathname === path || pathname.startsWith(path + "/")
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const matched = matchRateLimit(request.nextUrl.pathname);

  if (matched) {
    const [matchedPath, opts] = matched;
    const ip = getClientIp(request);
    // Bucket key: "sign-in:203.0.113.4" — scoped per-route so limits don't bleed across paths.
    const routeSlug = matchedPath.split("/").at(-1) ?? "auth";
    const { success, retryAfter } = await rateLimit(`${routeSlug}:${ip}`, opts);

    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
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
