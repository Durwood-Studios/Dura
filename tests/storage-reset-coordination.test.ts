import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  put: vi.fn(),
  transaction: vi.fn(),
  clear: vi.fn(),
  get: vi.fn(),
}));
vi.mock("@/lib/db/migrate-lesson-identity", () => ({ migrateLessonIdentities: vi.fn() }));
vi.mock("idb", () => ({
  openDB: vi.fn(async (name: string) => ({
    name,
    close: vi.fn(),
    objectStoreNames: ["progress", "feedback"],
    clear: mocks.clear,
    put: mocks.put,
    get: mocks.get,
    transaction: mocks.transaction,
  })),
}));

describe("cross-tab reset generation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    mocks.transaction.mockReturnValue({
      objectStore: () => ({ clear: mocks.clear }),
      done: Promise.resolve(),
    });
  });

  it("blocks retained database writes even before a storage event reaches a stale tab", async () => {
    const { getDB } = await import("@/lib/db");
    const db = await getDB();
    localStorage.setItem("dura:reset-generation", "pending:another-tab");
    expect(() => db.clear("progress")).toThrow("reset in another tab");
    expect(() => db.transaction("progress", "readwrite")).toThrow("reset in another tab");
    await expect(getDB()).rejects.toThrow("reset in another tab");
    localStorage.setItem("dura:reset-generation", "finished:another-tab");
    await expect(getDB()).rejects.toThrow("reset in another tab");
  });

  it("allows only the dedicated eraser to write after invalidating the current tab", async () => {
    const { prepareDatabaseReset, eraseDatabaseForReset, getDB } = await import("@/lib/db");
    await prepareDatabaseReset();
    const { beginLocalReset, finishLocalReset } = await import("@/lib/storage/reset-coordination");
    const token = beginLocalReset();
    await expect(getDB()).rejects.toThrow();
    await eraseDatabaseForReset();
    expect(mocks.transaction).toHaveBeenCalledWith(["progress", "feedback"], "readwrite");
    expect(mocks.clear).toHaveBeenCalledTimes(2);
    finishLocalReset(token);
    expect(localStorage.getItem("dura:reset-generation")).toBe(`finished:${token}`);
  });

  it("permits recovery after a reset owner closes before opening this tab's DB", async () => {
    localStorage.setItem("dura:reset-generation", "pending:closed-tab");
    const { getDB, prepareDatabaseReset, eraseDatabaseForReset } = await import("@/lib/db");
    await expect(getDB()).rejects.toThrow();
    await prepareDatabaseReset();
    await eraseDatabaseForReset();
    expect(mocks.clear).toHaveBeenCalledTimes(2);
  });

  it("an older reset cannot release a newer reset's pause", async () => {
    const { beginLocalReset, finishLocalReset } = await import("@/lib/storage/reset-coordination");
    const first = beginLocalReset();
    const second = beginLocalReset();
    finishLocalReset(first);
    expect(localStorage.getItem("dura:reset-generation")).toBe(`pending:${second}`);
  });
});
