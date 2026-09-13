import { beforeEach, expect, it, vi } from "vitest";
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});
it("pins legacy guest work before selecting a newly signed-in account", async () => {
  const owners = await import("@/lib/storage/owner");
  owners.selectStorageOwner(null);
  expect(owners.ownerDatabaseName()).toBe("dura");
  owners.selectStorageOwner("A");
  expect(owners.ownerDatabaseName()).not.toBe("dura");
  const a = owners.ownerDatabaseName();
  owners.selectStorageOwner("B");
  expect(owners.ownerDatabaseName()).not.toBe(a);
  expect(owners.ownerDatabaseName("guest")).toBe("dura");
});
it("retains the last authenticated owner of an existing database and invalidates stale handles", async () => {
  localStorage.setItem("dura:idb:last-auth-uid", "A");
  const owners = await import("@/lib/storage/owner");
  owners.selectStorageOwner("A");
  expect(owners.ownerDatabaseName()).toBe("dura");
  const generation = owners.getOwnerGeneration();
  owners.selectStorageOwner(null);
  expect(() => owners.assertOwnerGeneration(generation)).toThrow("learner changed");
  expect(owners.ownerDatabaseName()).not.toBe("dura");
  expect(owners.knownOwnerDatabaseNames()).toContain("dura");
});

it("holds persistent reads until owner and key initialization completes", async () => {
  const owners = await import("@/lib/storage/owner");
  owners.beginOwnerInitialization();
  let released = false;
  const pending = owners.waitForOwnerInitialization().then(() => {
    released = true;
  });
  await Promise.resolve();
  expect(released).toBe(false);
  expect(owners.isOwnerInitialized()).toBe(false);
  owners.selectStorageOwner("A");
  owners.finishOwnerInitialization();
  await pending;
  expect(released).toBe(true);
  expect(owners.isOwnerInitialized()).toBe(true);
  expect(owners.getStorageOwner()).toBe("account:A");
});
