import { beforeEach, expect, it, vi } from "vitest";
import { awardXP } from "@/lib/db/xp";

const mocks = vi.hoisted(() => ({ transaction: vi.fn(), get: vi.fn(), put: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDB: async () => ({ transaction: mocks.transaction }) }));
vi.mock("@/lib/storage/shadow-write", () => ({ triggerShadowWrite: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.transaction.mockReturnValue({
    store: { get: mocks.get, put: mocks.put },
    done: Promise.resolve(),
  });
});

it("checks and inserts awards in one transaction, returning null on a retry", async () => {
  const event = await awardXP("quiz", 10, "lesson");
  expect(event?.amount).toBe(10);
  expect(mocks.transaction).toHaveBeenCalledWith("xp-events", "readwrite");
  mocks.get.mockResolvedValue(event);
  expect(await awardXP("quiz", 10, "lesson")).toBeNull();
  expect(mocks.put).toHaveBeenCalledOnce();
});

it("rejects non-finite XP before opening storage", async () => {
  expect(await awardXP("quiz", Number.NaN, "lesson")).toBeNull();
  expect(await awardXP("quiz", Number.POSITIVE_INFINITY, "lesson")).toBeNull();
  expect(mocks.transaction).not.toHaveBeenCalled();
});
