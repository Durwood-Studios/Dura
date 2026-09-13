import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDojoStats } from "@/lib/db/dojo";
import type { DojoSession } from "@/types/dojo";

const { readSessions } = vi.hoisted(() => ({
  readSessions: vi.fn<() => Promise<DojoSession[]>>(),
}));
vi.mock("@/lib/db", () => ({ getDB: async () => ({ getAllFromIndex: readSessions }) }));

describe("Dojo all-time and recent statistics", () => {
  beforeEach(() => {
    readSessions.mockReset();
  });
  it("includes more than 100 sessions while charting only the newest ten in chronological order", async () => {
    readSessions.mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => ({
        id: String(index),
        startedAt: index * 1000,
        completedAt: index * 1000 + 100,
        tier: "T1",
        results: [],
        avgScore: index < 91 ? 1 : index - 90,
      }))
    );
    const stats = await getDojoStats();
    expect(stats).toEqual({
      totalSessions: 101,
      avgScore: 1.4,
      bestScore: 10,
      recentTrend: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
    expect(readSessions).toHaveBeenCalledWith("dojo-sessions", "by-completed");
  });
  it("returns an honest empty state", async () => {
    readSessions.mockResolvedValue([]);
    expect(await getDojoStats()).toEqual({
      totalSessions: 0,
      avgScore: 0,
      bestScore: 0,
      recentTrend: [],
    });
  });
  it("propagates a read failure instead of manufacturing zero activity", async () => {
    readSessions.mockRejectedValue(new Error("Storage unavailable"));
    await expect(getDojoStats()).rejects.toThrow("Storage unavailable");
  });
});
