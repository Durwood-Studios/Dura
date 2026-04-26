import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteOPFSSnapshot, loadFromOPFS, opfsAvailable, saveToOPFS } from "@/lib/storage/opfs";
import { mountOPFSStub, unmountOPFSStub } from "../helpers/opfs-stub";

describe("LFLRS-R1 — OPFS module", () => {
  afterEach(() => {
    unmountOPFSStub();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("opfsAvailable() returns true when navigator.storage.getDirectory exists", () => {
    mountOPFSStub();
    expect(opfsAvailable()).toBe(true);
  });

  it("opfsAvailable() returns false when getDirectory is missing", () => {
    vi.stubGlobal("navigator", { ...navigator, storage: undefined });
    expect(opfsAvailable()).toBe(false);
  });

  it("saveToOPFS + loadFromOPFS round-trips a JSON object", async () => {
    mountOPFSStub();
    const payload = { hello: "world", n: 42, nested: { ok: true } };
    await saveToOPFS(payload);
    const loaded = await loadFromOPFS<typeof payload>();
    expect(loaded).toEqual(payload);
  });

  it("loadFromOPFS returns null when the file does not exist", async () => {
    mountOPFSStub();
    const loaded = await loadFromOPFS();
    expect(loaded).toBeNull();
  });

  it("saveToOPFS does not throw when OPFS is unavailable", async () => {
    vi.stubGlobal("navigator", { ...navigator, storage: undefined });
    await expect(saveToOPFS({ x: 1 })).resolves.toBeUndefined();
  });

  it("deleteOPFSSnapshot removes the file silently if missing", async () => {
    mountOPFSStub();
    await expect(deleteOPFSSnapshot()).resolves.toBeUndefined();
    await saveToOPFS({ x: 1 });
    await deleteOPFSSnapshot();
    expect(await loadFromOPFS()).toBeNull();
  });
});
