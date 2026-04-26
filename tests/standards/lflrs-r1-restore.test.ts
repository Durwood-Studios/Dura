import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { restoreFromOPFSIfNeeded } from "@/lib/storage/restore";

vi.mock("@/lib/storage/opfs", () => ({
  opfsAvailable: vi.fn(),
  loadFromOPFS: vi.fn(),
  saveToOPFS: vi.fn(),
  deleteOPFSSnapshot: vi.fn(),
}));

vi.mock("@/lib/storage/snapshot", () => ({
  isLearnerStoreEmpty: vi.fn(),
  restoreSnapshotToIDB: vi.fn(),
  buildLearnerSnapshot: vi.fn(),
}));

describe("LFLRS-R1 — restoreFromOPFSIfNeeded", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 'unsupported' when OPFS is not available", async () => {
    const { opfsAvailable } = await import("@/lib/storage/opfs");
    vi.mocked(opfsAvailable).mockReturnValue(false);

    expect(await restoreFromOPFSIfNeeded()).toBe("unsupported");
  });

  it("returns 'not-needed' when IndexedDB already has data", async () => {
    const { opfsAvailable } = await import("@/lib/storage/opfs");
    const { isLearnerStoreEmpty } = await import("@/lib/storage/snapshot");
    vi.mocked(opfsAvailable).mockReturnValue(true);
    vi.mocked(isLearnerStoreEmpty).mockResolvedValue(false);

    expect(await restoreFromOPFSIfNeeded()).toBe("not-needed");
  });

  it("returns 'no-backup' when IDB is empty and OPFS has no snapshot", async () => {
    const { opfsAvailable, loadFromOPFS } = await import("@/lib/storage/opfs");
    const { isLearnerStoreEmpty } = await import("@/lib/storage/snapshot");
    vi.mocked(opfsAvailable).mockReturnValue(true);
    vi.mocked(isLearnerStoreEmpty).mockResolvedValue(true);
    vi.mocked(loadFromOPFS).mockResolvedValue(null);

    expect(await restoreFromOPFSIfNeeded()).toBe("no-backup");
  });

  it("restores and returns 'restored' when IDB is empty and OPFS has a snapshot", async () => {
    const { opfsAvailable, loadFromOPFS } = await import("@/lib/storage/opfs");
    const { isLearnerStoreEmpty, restoreSnapshotToIDB } = await import("@/lib/storage/snapshot");
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    vi.mocked(opfsAvailable).mockReturnValue(true);
    vi.mocked(isLearnerStoreEmpty).mockResolvedValue(true);
    vi.mocked(loadFromOPFS).mockResolvedValue({
      schemaVersion: 1,
      createdAt: "2026-04-25T00:00:00.000Z",
      progress: [],
      moduleProgress: [],
      phaseProgress: [],
      flashcards: [{ id: "c1" }],
      reviewLogs: [],
      goals: [],
      preferences: [],
      sandboxSaves: [],
      assessmentResults: [],
      certificates: [],
      xpEvents: [],
      tutorialProgress: [],
    });

    expect(await restoreFromOPFSIfNeeded()).toBe("restored");
    expect(restoreSnapshotToIDB).toHaveBeenCalledOnce();
    expect(consoleInfo).toHaveBeenCalled();
    consoleInfo.mockRestore();
  });

  it("returns 'error' when snapshot schemaVersion does not match", async () => {
    const { opfsAvailable, loadFromOPFS } = await import("@/lib/storage/opfs");
    const { isLearnerStoreEmpty, restoreSnapshotToIDB } = await import("@/lib/storage/snapshot");
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mocked(opfsAvailable).mockReturnValue(true);
    vi.mocked(isLearnerStoreEmpty).mockResolvedValue(true);
    vi.mocked(loadFromOPFS).mockResolvedValue({ schemaVersion: 99 });

    expect(await restoreFromOPFSIfNeeded()).toBe("error");
    expect(restoreSnapshotToIDB).not.toHaveBeenCalled();
    consoleWarn.mockRestore();
  });
});
