// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const remote = vi.hoisted(() => vi.fn());
vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn();
    limit = remote;
  },
}));
import { rateLimit } from "@/lib/rate-limit";
beforeEach(() => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  remote.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
it("atomically caps simultaneous development attempts", async () => {
  vi.stubEnv("NODE_ENV", "test");
  const results = await Promise.all(
    Array.from({ length: 20 }, () =>
      rateLimit("simultaneous-fixture", { limit: 5, windowMs: 60000 })
    )
  );
  expect(results.filter((result) => result.success)).toHaveLength(5);
});
it("fails closed without production infrastructure", async () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(await rateLimit("test", { limit: 5, windowMs: 60000 })).toMatchObject({
    success: false,
    reason: "unavailable",
  });
});
it("hashes identifiers and rejects the SDK timeout fallback", async () => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.invalid");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only-token");
  remote.mockResolvedValue({ success: true, remaining: 4, reset: Date.now() + 1000 });
  expect((await rateLimit("signin:192.0.2.1", { limit: 5, windowMs: 60000 })).success).toBe(true);
  expect(remote.mock.calls[0][0]).toMatch(/^[0-9a-f]{64}$/);
  remote.mockResolvedValue({ success: true, reason: "timeout" });
  expect(await rateLimit("test", { limit: 5, windowMs: 60000 })).toMatchObject({
    success: false,
    reason: "unavailable",
  });
});
