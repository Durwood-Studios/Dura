import { beforeEach, expect, it, vi } from "vitest";
import { DEFAULT_PREFERENCES } from "@/types/preferences";
const state = vi.hoisted(() => ({ db: null as unknown, name: "dura", fail: false }));
vi.mock("@/lib/db", () => ({
  getDB: async () => {
    if (state.fail) throw new Error("disk");
    return state.db;
  },
}));
vi.mock("@/lib/storage/shadow-write", () => ({ triggerShadowWrite: vi.fn() }));
vi.mock("@/lib/storage/owner", () => ({
  getOwnerGeneration: () => 1,
  assertOwnerGeneration: () => undefined,
  ownerDatabaseName: () => state.name,
}));
import {
  getDiscoveryPassport,
  saveDiscoveryActivity,
  LEGACY_PASSPORT_KEY,
} from "@/lib/discovery/passport";
import { DISCOVERY_ACTIVITY_SLUGS, DiscoveryActivitiesSchema } from "@/lib/discovery/registry";
let record = { ...DEFAULT_PREFERENCES };
let queue: Promise<void> = Promise.resolve();
beforeEach(() => {
  localStorage.clear();
  state.name = "dura";
  state.fail = false;
  record = { ...DEFAULT_PREFERENCES, theme: "light" };
  queue = Promise.resolve();
  state.db = {
    transaction: () => {
      const previous = queue;
      let release: () => void = () => undefined;
      queue = new Promise<void>((resolve) => {
        release = resolve;
      });
      return {
        store: {
          get: async () => {
            await previous;
            return structuredClone(record);
          },
          put: async (value: typeof record) => {
            record = value;
          },
        },
        get done() {
          release();
          return Promise.resolve();
        },
      };
    },
  };
});
it("unions simultaneous stamps without losing preferences", async () => {
  await Promise.all(DISCOVERY_ACTIVITY_SLUGS.slice(0, 3).map(saveDiscoveryActivity));
  expect((await getDiscoveryPassport()).activities).toHaveLength(3);
  expect(record.theme).toBe("light");
});
it("imports only reachable legacy activities once for the original owner", async () => {
  localStorage.setItem(
    LEGACY_PASSPORT_KEY,
    JSON.stringify([DISCOVERY_ACTIVITY_SLUGS[0], "removed", null])
  );
  const result = await getDiscoveryPassport();
  expect(result.activities).toEqual([DISCOVERY_ACTIVITY_SLUGS[0]]);
  expect(result.warning).toBeTruthy();
  expect(localStorage.getItem(LEGACY_PASSPORT_KEY)).toBe(
    JSON.stringify([DISCOVERY_ACTIVITY_SLUGS[0], "removed", null])
  );
  expect((await getDiscoveryPassport()).warning).toBeUndefined();
  localStorage.setItem(LEGACY_PASSPORT_KEY, JSON.stringify([DISCOVERY_ACTIVITY_SLUGS[1]]));
  expect((await getDiscoveryPassport()).activities).toEqual(result.activities);
});
it("does not adopt another owner's legacy passport", async () => {
  state.name = "other";
  localStorage.setItem(LEGACY_PASSPORT_KEY, JSON.stringify([DISCOVERY_ACTIVITY_SLUGS[0]]));
  expect((await getDiscoveryPassport()).activities).toEqual([]);
  expect(localStorage.getItem(LEGACY_PASSPORT_KEY)).not.toBeNull();
});
it("reports malformed legacy data and preserves it when storage fails", async () => {
  localStorage.setItem(LEGACY_PASSPORT_KEY, "{invalid");
  state.fail = true;
  await expect(getDiscoveryPassport()).rejects.toThrow("could not be saved");
  expect(localStorage.getItem(LEGACY_PASSPORT_KEY)).toBe("{invalid");
  state.fail = false;
  expect((await getDiscoveryPassport()).warning).toContain("unreadable");
  expect(localStorage.getItem(LEGACY_PASSPORT_KEY)).toBe("{invalid");
  expect((await getDiscoveryPassport()).warning).toBeUndefined();
});
it("rejects nonexistent and duplicate portable activities", async () => {
  await expect(saveDiscoveryActivity("missing")).rejects.toThrow("not in");
  expect(DiscoveryActivitiesSchema.safeParse(["missing"]).success).toBe(false);
  expect(
    DiscoveryActivitiesSchema.safeParse([DISCOVERY_ACTIVITY_SLUGS[0], DISCOVERY_ACTIVITY_SLUGS[0]])
      .success
  ).toBe(false);
});

it("keeps passport stamps through the portable preferences boundary", async () => {
  const { PORTABLE_RECORD_SCHEMA } = await import("@/lib/learner-record/portable-schema");
  const stored = {
    ...DEFAULT_PREFERENCES,
    discoveryActivities: [DISCOVERY_ACTIVITY_SLUGS[0]],
    discoveryPassportMigrated: true,
  };
  expect(PORTABLE_RECORD_SCHEMA.shape.preferences.parse([stored])[0]).toMatchObject(stored);
  expect(
    PORTABLE_RECORD_SCHEMA.shape.preferences.safeParse([
      { ...stored, discoveryActivities: ["removed"] },
    ]).success
  ).toBe(false);
});
it("has exactly the reachable room activities", async () => {
  const { readFileSync } = await import("node:fs");
  const room = readFileSync("src/app/(marketing)/discover/[slug]/page.tsx", "utf8");
  const slugs = [...room.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]);
  expect([...DISCOVERY_ACTIVITY_SLUGS].sort()).toEqual(slugs.sort());
});

it("removes a fully imported legacy record only after saving all stamps", async (): Promise<void> => {
  localStorage.setItem(LEGACY_PASSPORT_KEY, JSON.stringify(DISCOVERY_ACTIVITY_SLUGS.slice(0, 2)));
  expect((await getDiscoveryPassport()).activities).toEqual(DISCOVERY_ACTIVITY_SLUGS.slice(0, 2));
  expect(localStorage.getItem(LEGACY_PASSPORT_KEY)).toBeNull();
});
