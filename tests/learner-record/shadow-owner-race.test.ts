import { expect, it, vi } from "vitest";
const h = vi.hoisted(() => ({ build: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/storage/snapshot", () => ({ buildLearnerSnapshot: h.build }));
vi.mock("@/lib/storage/opfs", () => ({ opfsAvailable: () => true, saveToOPFS: h.save }));
it("never saves an old owner's asynchronously built snapshot under the newly selected owner", async () => {
  vi.resetModules();
  localStorage.clear();
  const { selectStorageOwner } = await import("@/lib/storage/owner");
  selectStorageOwner("A");
  let finish: (value: object) => void = (): void => {};
  h.build.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const { flushShadowWrite } = await import("@/lib/storage/shadow-write");
  const pending = flushShadowWrite();
  selectStorageOwner("B");
  finish({ private: "A records" });
  await pending;
  expect(h.save).not.toHaveBeenCalled();
});
