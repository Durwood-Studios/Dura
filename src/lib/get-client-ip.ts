/**
 * Extract the real client IP from Next.js request headers.
 *
 * Works in both Edge runtime (NextRequest) and Node.js runtime (Request /
 * Route Handlers) because both implement the same headers interface.
 *
 * Resolution order:
 *   1. x-forwarded-for — set by Vercel and most reverse proxies; first
 *      IP in the comma-separated list is the original client.
 *   2. x-real-ip — set by nginx and some CDNs.
 *   3. "unknown" — direct connection or proxy not forwarding headers.
 */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
