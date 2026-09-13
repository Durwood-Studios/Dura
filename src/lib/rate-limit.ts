import { createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/** Distributed, atomic request limiting. Raw IP identifiers never enter Redis. */
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
const limiters = new Map<string, Ratelimit>();

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
    !Number.isInteger(opts.windowMs) ||
    opts.windowMs < 1
  )
    throw new Error("Invalid rate-limit configuration");
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") return unavailable();
    return localLimit(`${opts.limit}:${opts.windowMs}:${key}`, opts.limit, opts.windowMs);
  }
  try {
    const credentialId = createHmac("sha256", token).update("dura-limiter-client").digest("hex");
    const config = `${url}:${credentialId}:${opts.limit}:${opts.windowMs}`;
    let limiter = limiters.get(config);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: new Redis({ url, token, retry: { retries: 0 } }),
        limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowMs} ms`),
        prefix: "dura:requests",
        analytics: false,
        timeout: 5_000,
      });
      limiters.set(config, limiter);
    }
    const bucket = createHmac("sha256", token)
      .update(`dura-rate-limit-v1:${opts.limit}:${opts.windowMs}:${key}`)
      .digest("hex");
    const result = await limiter.limit(bucket);
    if (result.reason === "timeout") return unavailable();
    return {
      success: result.success,
      remaining: result.remaining,
      retryAfter: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
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
