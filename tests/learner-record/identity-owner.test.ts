import { afterEach, expect, it } from "vitest";
import { getLocalLearnerId, resetLocalLearnerId } from "@/lib/learner-record/identity";
import { selectStorageOwner } from "@/lib/storage/owner";

afterEach((): void => {
  localStorage.clear();
  selectStorageOwner(null);
});

it("keeps export subjects distinct across guests and accounts and restores each returning subject", (): void => {
  localStorage.clear();
  selectStorageOwner(null);
  const guest = getLocalLearnerId();
  selectStorageOwner("learner-a");
  const first = getLocalLearnerId();
  selectStorageOwner("learner-b");
  const second = getLocalLearnerId();
  expect(new Set([guest, first, second]).size).toBe(3);
  selectStorageOwner("learner-a");
  expect(getLocalLearnerId()).toBe(first);
  resetLocalLearnerId();
  expect(getLocalLearnerId()).not.toBe(first);
  selectStorageOwner("learner-b");
  expect(getLocalLearnerId()).toBe(second);
  selectStorageOwner(null);
  expect(getLocalLearnerId()).toBe(guest);
});

it("retains a legacy export subject only for its recorded original account", (): void => {
  localStorage.clear();
  const legacy = "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f";
  localStorage.setItem("dura:idb:last-auth-uid", "original");
  localStorage.setItem("dura:learner-id", legacy);
  selectStorageOwner("different");
  expect(getLocalLearnerId()).not.toBe(legacy);
  selectStorageOwner("original");
  expect(getLocalLearnerId()).toBe(legacy);
});
