import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAllData, exportAllData } from "@/lib/clearAllData";

const mocks = vi.hoisted(() => ({
  clear: vi.fn(),
  prepare: vi.fn(),
  erase: vi.fn(),
  transaction: vi.fn(),
  getAll: vi.fn(),
  deleteSnapshot: vi.fn(),
  pause: vi.fn(),
  suspendSync: vi.fn(),
  suspendShadow: vi.fn(),
  resetSecret: vi.fn(),
  clearKey: vi.fn(),
  configured: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  DB_VERSION: 7,
  prepareDatabaseReset: mocks.prepare,
  eraseDatabaseForReset: mocks.erase,
  getDB: vi.fn(async () => ({
    objectStoreNames: ["progress", "feedback", "dojo-sessions", "future-store"],
    transaction: mocks.transaction,
    getAll: mocks.getAll,
  })),
}));
vi.mock("@/lib/feedback/delivery", () => ({ pauseFeedbackDelivery: mocks.pause }));
vi.mock("@/lib/idb/encryption-key", () => ({ resetDeviceSecret: mocks.resetSecret }));
vi.mock("@/lib/idb/active-key", () => ({ clearActiveKey: mocks.clearKey }));
vi.mock("@/lib/storage/opfs", () => ({ deleteOPFSSnapshot: mocks.deleteSnapshot }));
vi.mock("@/lib/storage/shadow-write", () => ({ suspendShadowWritesForReset: mocks.suspendShadow }));
vi.mock("@/lib/supabase/sync", () => ({ suspendSyncForReset: mocks.suspendSync }));
vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: mocks.configured,
  clearLocalSession: mocks.signOut,
}));

describe("complete local reset", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mocks.clear.mockResolvedValue(undefined);
    mocks.erase.mockImplementation(async (): Promise<void> => {
      mocks.transaction(["progress", "feedback", "dojo-sessions", "future-store"], "readwrite");
      await Promise.all(
        ["progress", "feedback", "dojo-sessions", "future-store"].map(
          (name: string): Promise<void> => mocks.clear(name)
        )
      );
    });
    mocks.getAll.mockResolvedValue([]);
    mocks.transaction.mockReturnValue({
      objectStore: (name: string) => ({ clear: () => mocks.clear(name) }),
      done: Promise.resolve(),
    });
    mocks.signOut.mockResolvedValue({ error: null });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("clears every discovered store atomically, including future stores", async () => {
    await clearAllData();
    expect(mocks.transaction).toHaveBeenCalledWith(
      ["progress", "feedback", "dojo-sessions", "future-store"],
      "readwrite"
    );
    expect(mocks.clear.mock.calls.flat()).toEqual([
      "progress",
      "feedback",
      "dojo-sessions",
      "future-store",
    ]);
    expect(mocks.suspendShadow.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deleteSnapshot.mock.invocationCallOrder[0]
    );
    expect(mocks.deleteSnapshot.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.transaction.mock.invocationCallOrder[0]
    );
  });

  it("removes AI keys, consent, identity and dynamic keys without clearing unrelated storage", async () => {
    for (const key of [
      "dura:ai:anthropic-key",
      "dura:analytics:consent",
      "dura:learner-id",
      "dura-notify-new",
    ])
      localStorage.setItem(key, "saved");
    sessionStorage.setItem("dura:session", "saved");
    localStorage.setItem("other-app", "preserved");
    sessionStorage.setItem("other-app", "preserved");
    await clearAllData();
    expect(localStorage.length).toBe(2);
    expect(sessionStorage.length).toBe(1);
    expect(localStorage.getItem("other-app")).toBe("preserved");
    expect(mocks.clearKey).toHaveBeenCalledOnce();
  });

  it("signs out only this device when configured", async () => {
    mocks.configured.mockReturnValue(true);
    await clearAllData();
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it("surfaces backup erasure failures before destroying database and keys", async () => {
    mocks.deleteSnapshot.mockRejectedValue(new Error("denied"));
    await expect(clearAllData()).rejects.toThrow("Some local data could not be cleared");
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.resetSecret).not.toHaveBeenCalled();
  });

  it("does not claim success or destroy encryption keys after an IDB failure", async () => {
    mocks.clear.mockRejectedValue(new Error("IDB failure"));
    await expect(clearAllData()).rejects.toThrow("Some local data could not be cleared");
    expect(mocks.resetSecret).not.toHaveBeenCalled();
  });

  it("exports the current schema version and every discovered store", async () => {
    const dump = JSON.parse(await exportAllData());
    expect(dump.version).toBe(7);
    expect(dump.feedback).toEqual([]);
    expect(dump["dojo-sessions"]).toEqual([]);
    expect(dump["future-store"]).toEqual([]);
  });
});
