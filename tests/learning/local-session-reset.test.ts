import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ stop: vi.fn(), signOut: vi.fn() }));
vi.mock("@supabase/ssr", async (importOriginal) => {
  const original = await importOriginal<typeof import("@supabase/ssr")>();
  return {
    ...original,
    createBrowserClient: () => ({ auth: { stopAutoRefresh: mocks.stop, signOut: mocks.signOut } }),
  };
});

describe("device-only session reset", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    for (const cookie of document.cookie.split(";"))
      document.cookie = `${cookie.split("=")[0].trim()}=; Max-Age=0; Path=/`;
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://testproject.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test-key");
  });

  it("removes session cookie chunks offline without calling network signout or touching another project", async () => {
    const { clearLocalSession } = await import("@/lib/supabase/client");
    document.cookie = "sb-testproject-auth-token.0=part-a; Path=/";
    document.cookie = "sb-testproject-auth-token.1=part-b; Path=/";
    document.cookie = "sb-testproject-auth-token-code-verifier=verifier; Path=/";
    document.cookie = "sb-other-auth-token=other-session; Path=/";
    await clearLocalSession();
    expect(document.cookie).toBe("sb-other-auth-token=other-session");
    expect(mocks.stop).toHaveBeenCalledOnce();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("rejects a late refresh cookie write after reset while allowing deletions", async () => {
    const { writeAuthCookies } = await import("@/lib/supabase/client");
    localStorage.setItem("dura:reset-generation", "pending:reset");
    expect(() =>
      writeAuthCookies([
        { name: "sb-testproject-auth-token", value: "stale", options: { path: "/" } },
      ])
    ).toThrow("reset in another tab");
    expect(() =>
      writeAuthCookies([
        { name: "sb-testproject-auth-token", value: "", options: { path: "/", maxAge: 0 } },
      ])
    ).not.toThrow();
    expect(document.cookie).toBe("");
  });
});
