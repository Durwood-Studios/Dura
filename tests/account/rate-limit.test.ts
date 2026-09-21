// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

const remote = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  vi.stubEnv("DURA_RATE_LIMIT_SECRET", "");
  vi.stubGlobal("fetch", remote);
  remote.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function configureRemote(): void {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-fixture");
  vi.stubEnv("DURA_RATE_LIMIT_SECRET", "a".repeat(64));
}
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
  expect(remote).not.toHaveBeenCalled();
});
it("uses the existing Supabase RPC without sending raw identifiers", async () => {
  configureRemote();
  remote.mockResolvedValue(Response.json({ success: true, remaining: 4, retryAfter: 0 }));
  expect((await rateLimit("signin:192.0.2.1", { limit: 5, windowMs: 60000 })).success).toBe(true);
  const [url, init] = remote.mock.calls[0];
  expect(String(url)).toBe("https://example.supabase.co/rest/v1/rpc/consume_rate_limit");
  expect(init).toMatchObject({ method: "POST", cache: "no-store", redirect: "error" });
  expect(init?.body).not.toContain("192.0.2.1");
  expect(JSON.parse(String(init?.body))).toMatchObject({
    p_key: expect.stringMatching(/^[0-9a-f]{64}$/),
    p_limit: 5,
    p_window_ms: 60000,
  });
});
it("preserves database denials and retry timing", async () => {
  configureRemote();
  remote.mockResolvedValue(Response.json({ success: false, remaining: 0, retryAfter: 9 }));
  expect(await rateLimit("test", { limit: 5, windowMs: 60000 })).toEqual({
    success: false,
    remaining: 0,
    retryAfter: 9,
  });
});
it("fails closed on transport failures and malformed or contradictory responses", async () => {
  configureRemote();
  const logger = vi.spyOn(console, "error").mockImplementation(() => undefined);
  try {
    remote.mockRejectedValueOnce(new Error("fixture timeout"));
    expect(await rateLimit("test", { limit: 5, windowMs: 60000 })).toHaveProperty(
      "reason",
      "unavailable"
    );
    for (const response of [
      new Response(null, { status: 503 }),
      Response.json(null),
      Response.json({ success: true }),
      Response.json({ success: true, remaining: 5, retryAfter: 0 }),
      Response.json({ success: false, remaining: 1, retryAfter: 1 }),
    ]) {
      remote.mockResolvedValueOnce(response);
      expect(await rateLimit("test", { limit: 5, windowMs: 60000 })).toHaveProperty(
        "reason",
        "unavailable"
      );
    }
  } finally {
    logger.mockRestore();
  }
});
it("rejects out-of-contract budgets before making a request", async () => {
  configureRemote();
  for (const opts of [
    { limit: 0, windowMs: 1000 },
    { limit: 1001, windowMs: 1000 },
    { limit: 5, windowMs: 86400001 },
  ])
    await expect(rateLimit("test", opts)).rejects.toThrow("Invalid rate-limit configuration");
  expect(remote).not.toHaveBeenCalled();
});
