import { createHmac } from "node:crypto";

/** Distributed, atomic request limiting. Raw IP identifiers never enter the database. */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter: number;
  reason?: "unavailable";
}

interface LocalBucket {
  hits: number[];
  expires: number;
}
const localBuckets = new Map<string, LocalBucket>();

function unavailable(): RateLimitResult {
  return { success: false, remaining: 0, retryAfter: 30, reason: "unavailable" };
}

/** Development-only fallback; no await between checking and reserving a hit. */
function localLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  for (const [id, bucket] of localBuckets) if (bucket.expires <= now) localBuckets.delete(id);
  const bucket = localBuckets.get(key) ?? { hits: [], expires: now + windowMs };
  bucket.hits = bucket.hits.filter((hit) => hit > now - windowMs);
  if (bucket.hits.length >= limit)
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.hits[0] + windowMs - now) / 1000)),
    };
  if (!localBuckets.has(key) && localBuckets.size >= 10_000) return unavailable();
  bucket.hits.push(now);
  bucket.expires = now + windowMs;
  localBuckets.set(key, bucket);
  return { success: true, remaining: limit - bucket.hits.length, retryAfter: 0 };
}

/** Fail closed in production if distributed limiting cannot be established. */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  if (
    !Number.isInteger(opts.limit) ||
    opts.limit < 1 ||
    opts.limit > 1000 ||
    !Number.isInteger(opts.windowMs) ||
    opts.windowMs < 1 ||
    opts.windowMs > 86_400_000
  )
    throw new Error("Invalid rate-limit configuration");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secret = process.env.DURA_RATE_LIMIT_SECRET;
  if (!url || !anonKey || !secret || !/^[0-9a-f]{64}$/.test(secret)) {
    if (process.env.NODE_ENV === "production") return unavailable();
    return localLimit(`${opts.limit}:${opts.windowMs}:${key}`, opts.limit, opts.windowMs);
  }
  try {
    const endpoint = new URL("/rest/v1/rpc/consume_rate_limit", url);
    if (endpoint.protocol !== "https:") return unavailable();
    const bucket = createHmac("sha256", secret)
      .update(`dura-rate-limit-v2:${opts.limit}:${opts.windowMs}:${key}`)
      .digest("hex");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_secret: secret,
        p_key: bucket,
        p_limit: opts.limit,
        p_window_ms: opts.windowMs,
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return unavailable();
    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !("success" in result) ||
      typeof result.success !== "boolean" ||
      !("remaining" in result) ||
      typeof result.remaining !== "number" ||
      !Number.isInteger(result.remaining) ||
      result.remaining < 0 ||
      result.remaining >= opts.limit ||
      !("retryAfter" in result) ||
      typeof result.retryAfter !== "number" ||
      !Number.isInteger(result.retryAfter) ||
      result.retryAfter < 0 ||
      result.retryAfter > Math.ceil(opts.windowMs / 1000) ||
      (result.success ? result.retryAfter !== 0 : result.retryAfter < 1 || result.remaining !== 0)
    )
      return unavailable();
    return { success: result.success, remaining: result.remaining, retryAfter: result.retryAfter };
  } catch {
    console.error("[rate-limit] Distributed limiter unavailable");
    return unavailable();
  }
}

/** Legacy compatibility for callers using the shared auth bucket. */
export async function isRateLimited(ip: string): Promise<{ limited: boolean; reset: number }> {
  const { success, retryAfter } = await rateLimit(`auth:${ip}`, { limit: 10, windowMs: 60_000 });
  return { limited: !success, reset: success ? 0 : Date.now() + retryAfter * 1_000 };
}
