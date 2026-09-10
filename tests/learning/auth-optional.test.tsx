import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fullSync } from "@/lib/supabase/sync";
import { resolveEncryptionKey } from "@/lib/idb/encryption-key";
vi.mock("@/lib/supabase/sync", () => ({
  fullSync: vi.fn(),
  startBackgroundSync: vi.fn(),
  stopBackgroundSync: vi.fn(),
}));
vi.mock("@/lib/idb/encryption-key", () => ({
  resolveEncryptionKey: vi.fn().mockResolvedValue(null),
  readLastAuthUser: vi.fn().mockReturnValue(null),
  rememberLastAuthUser: vi.fn(),
  forgetLastAuthUser: vi.fn(),
}));
vi.mock("@/lib/idb/active-key", () => ({ setActiveKey: vi.fn() }));
function Learner(): React.ReactElement {
  const { loading, user } = useAuth();
  return <p>{loading ? "Loading" : user ? "Signed in" : "Ready to learn locally"}</p>;
}
describe("optional Supabase", (): void => {
  afterEach((): void => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });
  it("initializes local learning with no URL or key and never starts sync", async (): Promise<void> => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(isSupabaseConfigured()).toBe(false);
    render(
      <AuthProvider>
        <Learner />
      </AuthProvider>
    );
    await waitFor((): void => {
      expect(screen.getByText("Ready to learn locally")).toBeInTheDocument();
    });
    expect(resolveEncryptionKey).toHaveBeenCalledWith(null);
    expect(fullSync).not.toHaveBeenCalled();
  });
});
