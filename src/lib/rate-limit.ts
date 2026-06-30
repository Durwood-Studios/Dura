/**
 * Supabase-backed sliding-window rate limiter.
 *
 * Uses the Supabase REST API via raw fetch so this module is compatible with
 * both the Node.js runtime (Route Handlers / Server Components) and the Edge
 * runtime (middleware). No Redis or external dependency is required.
 *
 * Fail-open contract: any Supabase error returns { success: true } — legitimate
 * users are never blocked because of infrastructure issues.
 *
 * Requires the rate_limits table:
 *   xDocs/active/rate-limiting/staged/supabase/20260630000001_rate_limits.sql
 */

export interface RateLimitResult {
  success: boolean;
  /** Requests remaining in the current window. 0 when blocked. */
  remaining: number;
  /**
   * Seconds to wait before retrying. 0 when not blocked.
   * Always the full window duration (conservative — avoids a second DB round-trip
   * to find the exact oldest record).
   */
  retryAfter: number;
}

/**
 * Perform a sliding-window rate limit check for the given key.
 *
 * Algorithm:
 *   1. COUNT rows in rate_limits WHERE key = $key AND created_at >= $windowStart
 *   2. If count >= limit → blocked
 *   3. Otherwise INSERT a new row and return success
 *
 * @param key   Unique bucket identifier, e.g. "sign-in:203.0.113.4"
 * @param opts  limit = max allowed requests; windowMs = window length in ms
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail open when Supabase is not configured (local dev without env vars).
  if (!supabaseUrl || !anonKey) {
    return { success: true, remaining: opts.limit, retryAfter: 0 };
  }

  const windowStart = new Date(Date.now() - opts.windowMs).toISOString();
  const encodedKey = encodeURIComponent(key);

  const baseHeaders: Record<string, string> = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  };

  try {
    // Count existing hits in the sliding window.
    // Prefer: count=exact tells PostgREST to compute the total and surface it
    // in the Content-Range response header ("start-end/total" or "*/total").
    // We fetch at most 1 row to minimise payload; the header gives the full count.
    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/rate_limits?key=eq.${encodedKey}&created_at=gte.${windowStart}&select=id&limit=1`,
      {
        method: "GET",
        headers: { ...baseHeaders, Prefer: "count=exact" },
      }
    );

    if (!countRes.ok) {
      // Unexpected HTTP error from Supabase — fail open.
      return { success: true, remaining: opts.limit, retryAfter: 0 };
    }

    // Content-Range examples: "0-0/42" (rows found) or "*/0" (no rows).
    const contentRange = countRes.headers.get("Content-Range") ?? "*/0";
    const currentCount = parseInt(contentRange.split("/")[1] ?? "0", 10);

    if (currentCount >= opts.limit) {
      return {
        success: false,
        remaining: 0,
        // Conservative: quote the full window. Avoids a second query to find
        // the exact oldest record (which would give a shorter but more precise value).
        retryAfter: Math.ceil(opts.windowMs / 1000),
      };
    }

    // Record this request so subsequent calls within the window count it.
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/rate_limits`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify({ key }),
    });

    // Fail open on a write error — do not block the user for a DB issue.
    if (!insertRes.ok) {
      return { success: true, remaining: Math.max(0, opts.limit - currentCount), retryAfter: 0 };
    }

    return {
      success: true,
      remaining: Math.max(0, opts.limit - currentCount - 1),
      retryAfter: 0,
    };
  } catch {
    // Network or parse error — fail open.
    return { success: true, remaining: opts.limit, retryAfter: 0 };
  }
}

/**
 * Legacy wrapper retained for backward compatibility.
 * New callers should use rateLimit() directly with explicit per-route limits.
 */
export async function isRateLimited(ip: string): Promise<{ limited: boolean; reset: number }> {
  const { success, retryAfter } = await rateLimit(`auth:${ip}`, { limit: 10, windowMs: 60_000 });
  return {
    limited: !success,
    reset: success ? 0 : Date.now() + retryAfter * 1_000,
  };
}
