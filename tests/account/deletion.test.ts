import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  owner: vi.fn(),
  database: vi.fn(),
  rpc: vi.fn(),
  remove: vi.fn(),
  erase: vi.fn(),
  clear: vi.fn(),
  pause: vi.fn(),
  sync: vi.fn(),
  shadow: vi.fn(),
  begin: vi.fn(),
  finish: vi.fn(),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
    rpc: mocks.rpc,
    storage: { from: () => ({ remove: mocks.remove }) },
  }),
  clearLocalSession: mocks.clear,
}));
vi.mock("@/lib/storage/owner", () => ({
  getStorageOwner: mocks.owner,
  ownerDatabaseName: mocks.database,
  ownerStorageKey: (key: string) => (mocks.database() === "dura" ? key : `account-owner:${key}`),
}));
vi.mock("@/lib/db", () => ({ eraseOwnerData: mocks.erase }));
vi.mock("@/lib/feedback/delivery", () => ({ pauseFeedbackDelivery: mocks.pause }));
vi.mock("@/lib/supabase/sync", () => ({ suspendSyncForReset: mocks.sync }));
vi.mock("@/lib/storage/shadow-write", () => ({ suspendShadowWritesForReset: mocks.shadow }));
vi.mock("@/lib/storage/reset-coordination", () => ({
  beginLocalReset: mocks.begin,
  finishLocalReset: mocks.finish,
}));
import { deleteOwnAccount } from "@/lib/account/deletion";
describe("account deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.database.mockReturnValue("dura");
    mocks.owner.mockReturnValue("account:owner");
    mocks.begin.mockReturnValue("generation");
    mocks.rpc.mockReset();
    mocks.remove.mockResolvedValue({ error: null });
    mocks.erase.mockResolvedValue(undefined);
  });
  it("does not erase anything when fresh authentication or deployment preflight fails", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "Sign in again" } });
    await expect(deleteOwnAccount("owner")).rejects.toThrow("Sign in again");
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.erase).not.toHaveBeenCalled();
    expect(mocks.begin).not.toHaveBeenCalled();
  });
  it("never deletes the account or local record after Storage removal fails", async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: [{ bucket_id: "avatars", name: "owner/avatar.png" }],
      error: null,
    });
    mocks.remove.mockResolvedValue({ error: { message: "Offline" } });
    await expect(deleteOwnAccount("owner")).rejects.toThrow("some files may already be removed");
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.erase).not.toHaveBeenCalled();
  });
  it("removes files via Storage API before deleting only the account namespace", async () => {
    mocks.rpc
      .mockResolvedValueOnce({
        data: [{ bucket_id: "avatars", name: "owner/avatar.png" }],
        error: null,
      })
      .mockResolvedValueOnce({ error: null });
    await deleteOwnAccount("owner");
    expect(mocks.remove).toHaveBeenCalledWith(["owner/avatar.png"]);
    expect(mocks.rpc).toHaveBeenLastCalledWith("delete_own_account", { p_user_id: "owner" });
    expect(mocks.erase).toHaveBeenCalledWith("owner");
    expect(mocks.clear).toHaveBeenCalled();
    expect(mocks.remove.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.rpc.mock.invocationCallOrder[1]
    );
  });
  it("distinguishes server success from local erasure failure", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ error: null });
    mocks.erase.mockRejectedValue(new Error("blocked"));
    await expect(deleteOwnAccount("owner")).rejects.toThrow("server account was deleted");
    expect(mocks.clear).toHaveBeenCalled();
  });
  it("does not clear a different active learner after server deletion", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ error: null });
    mocks.owner.mockReturnValue("account:other");
    await expect(deleteOwnAccount("owner")).rejects.toThrow("server account was deleted");
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenNthCalledWith(1, "account_deletion_files", { p_user_id: "owner" });
  });

  it.each(["dura", "account-owner"])(
    "erases only owned legacy and identity keys for %s",
    async (database) => {
      mocks.database.mockReturnValue(database);
      mocks.rpc
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ error: null });
      for (const key of [
        "dura:learner-id",
        "account-owner:dura:learner-id",
        "other:dura:learner-id",
        "dura-discovery-passport",
        "dura:written:old",
        "other:dura:written:old",
      ])
        localStorage.setItem(key, "retained");
      await deleteOwnAccount("owner");
      expect(
        localStorage.getItem(
          database === "dura" ? "dura:learner-id" : "account-owner:dura:learner-id"
        )
      ).toBeNull();
      expect(localStorage.getItem("other:dura:learner-id")).toBe("retained");
      expect(localStorage.getItem("other:dura:written:old")).toBe("retained");
      expect(localStorage.getItem("dura:written:old")).toBe(
        database === "dura" ? null : "retained"
      );
      expect(localStorage.getItem("dura-discovery-passport")).toBe(
        database === "dura" ? null : "retained"
      );
    }
  );
});
