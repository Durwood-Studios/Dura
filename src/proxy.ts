import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

/** OAuth code-exchange budget. Credential attempts are limited in /api/auth handlers. */
const RATE_LIMIT_CONFIGS: Record<string, { limit: number; windowMs: number }> = {
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

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const matched = matchRateLimit(request.nextUrl.pathname);

  if (matched) {
    const [matchedPath, opts] = matched;
    const ip = getClientIp(request);
    // Bucket key: "sign-in:203.0.113.4" — scoped per-route so limits don't bleed across paths.
    const routeSlug = matchedPath.split("/").at(-1) ?? "auth";
    const { success, retryAfter, reason } = await rateLimit(`${routeSlug}:${ip}`, opts);

    if (!success) {
      return new NextResponse(
        reason === "unavailable"
          ? "Sign in is temporarily unavailable. Your local learning remains available."
          : "Too Many Requests",
        {
          status: reason === "unavailable" ? 503 : 429,
          headers: {
            "Retry-After": String(retryAfter),
            "Content-Type": "text/plain",
          },
        }
      );
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
