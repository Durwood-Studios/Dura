import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/verify/sign/route";
import { signHash } from "@/lib/verify/hmac";
vi.mock("@/lib/verify/hmac", () => ({ signHash: vi.fn(), isSigningConfigured: vi.fn(() => true) }));
afterEach(() => vi.unstubAllEnvs());
describe("public certificate issuance", () => {
  it("never issues arbitrary hash signatures, even with a provisioned signing secret", async () => {
    vi.stubEnv("VERIFICATION_HMAC_SECRET", "test-only-secret".repeat(4));
    const response = POST();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "trusted-issuance-unavailable" });
    expect(signHash).not.toHaveBeenCalled();
  });
});
