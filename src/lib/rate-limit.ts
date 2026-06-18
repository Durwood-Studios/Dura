import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Edge-compatible rate limiter for auth endpoints.
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env.
 * If those vars are absent (local dev without Redis), the limiter is null
 * and callers must skip the check — see isRateLimited() below.
 *
 * Strategy: sliding window, 10 requests per 60 seconds per IP.
 * Tighter than most CDN defaults but loose enough for normal login flows.
 * A human typing their password will never hit this; a credential stuffer will.
 */
function createRateLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: false,
    prefix: "dura:auth:rl",
  });
}

const limiter = createRateLimiter();

/**
 * Returns true if the given IP has exceeded the auth rate limit.
 * Returns false (allow through) when Redis is not configured.
 */
export async function isRateLimited(ip: string): Promise<{ limited: boolean; reset: number }> {
  if (!limiter) return { limited: false, reset: 0 };

  const { success, reset } = await limiter.limit(ip);
  return { limited: !success, reset };
}
