// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const { limit, auth } = vi.hoisted(() => ({
  limit: vi.fn(),
  auth: { signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn() },
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: limit }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth }) }));
import { handleAuthAction } from "@/lib/auth/actions";

function request(body: unknown, origin = "https://dura.test"): Request {
  return new Request("https://dura.test/api/auth/sign-in", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test-fixture");
  limit.mockResolvedValue({ success: true, remaining: 4, retryAfter: 0 });
  for (const method of Object.values(auth)) method.mockResolvedValue({ error: null });
});
describe("actual auth attempts", () => {
  it("blocks the provider before executing over-budget attempts and outages", async () => {
    for (const [reason, status] of [
      [undefined, 429],
      ["unavailable", 503],
    ] as const) {
      limit.mockResolvedValue({ success: false, reason, retryAfter: 30 });
      const result = await handleAuthAction(
        "sign-in",
        request({ email: "one@example.com", password: "test-password" })
      );
      expect(result.status).toBe(status);
      expect(result.headers.get("retry-after")).toBe("30");
      expect(auth.signInWithPassword).not.toHaveBeenCalled();
    }
  });
  it("rejects cross-origin and oversized submissions", async () => {
    expect((await handleAuthAction("sign-in", request({}, "https://elsewhere.test"))).status).toBe(
      403
    );
    expect(limit).not.toHaveBeenCalled();
    expect((await handleAuthAction("sign-in", request({ email: "x".repeat(9000) }))).status).toBe(
      400
    );
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it("requires signup age attestation and sends only validated credentials", async () => {
    const payload = { email: "one@example.com", password: "test-password" };
    expect((await handleAuthAction("sign-up", request(payload))).status).toBe(400);
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(
      (await handleAuthAction("sign-up", request({ ...payload, ageAttested: true }))).status
    ).toBe(200);
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        ...payload,
        options: expect.objectContaining({ data: { dura_age_attested: true } }),
      })
    );
  });
  it("signs in through the cookie-aware server client and hides provider login details", async () => {
    const payload = { email: "one@example.com", password: "test-password" };
    expect((await handleAuthAction("sign-in", request(payload))).status).toBe(200);
    expect(auth.signInWithPassword).toHaveBeenCalledWith(payload);
    auth.signInWithPassword.mockResolvedValue({ error: { message: "internal detail" } });
    const failed = await handleAuthAction("sign-in", request(payload));
    expect(failed.status).toBe(401);
    expect(await failed.text()).not.toContain("internal detail");
  });
  it("keeps account-existence responses generic while reporting reset outages", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: { status: 400 } });
    expect(
      (await handleAuthAction("forgot-password", request({ email: "one@example.com" }))).status
    ).toBe(200);
    auth.resetPasswordForEmail.mockResolvedValue({ error: { status: 503 } });
    expect(
      (await handleAuthAction("forgot-password", request({ email: "one@example.com" }))).status
    ).toBe(503);
  });
});
