import { afterEach, expect, it, vi } from "vitest";
import { checkSignature } from "@/lib/verify/client";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it.each([true, false])("preserves a completed signature verdict: %s", async (valid: boolean) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: () => ({ valid }) }));
  expect(await checkSignature("hash", "signature")).toBe(valid);
});
it("does not mislabel offline signatures as invalid", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Offline")));
  expect(await checkSignature("hash", "signature")).toBeNull();
});
it.each([
  { ok: false, json: () => ({}) },
  { ok: true, json: () => ({}) },
])("treats unavailable or malformed verification as unknown", async (response) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
  expect(await checkSignature("hash", "signature")).toBeNull();
});
