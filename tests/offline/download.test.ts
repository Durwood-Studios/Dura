import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  downloadOfflinePack,
  getOfflinePack,
  OFFLINE_INDEX,
  OFFLINE_POINTER,
} from "@/lib/offline/download";
const stores = new Map<string, Map<string, Response>>();
function cache(name: string) {
  const entries = stores.get(name) ?? new Map<string, Response>();
  stores.set(name, entries);
  return {
    put: async (key: string, response: Response) => {
      entries.set(key, response.clone());
    },
    match: async (key: string) => entries.get(key)?.clone(),
    keys: async () => [...entries.keys()],
  };
}
beforeEach(() => {
  stores.clear();
  vi.stubGlobal("caches", {
    open: async (name: string) => cache(name),
    keys: async () => [...stores.keys()],
    has: async (name: string) => stores.has(name),
    delete: async (name: string) => stores.delete(name),
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { controller: {} },
  });
  Object.defineProperty(navigator, "storage", {
    configurable: true,
    value: { estimate: async () => ({ quota: 1000000, usage: 0 }) },
  });
});
const plan = {
  version: "build",
  urls: ["/_next/static/app.js", "/paths/0/0-1/01"],
  lessons: 1,
  assetBytes: 20,
};
describe("atomic offline download", () => {
  it("never publishes a partial pack after a failed page download", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("asset"))
        .mockResolvedValueOnce(new Response("error", { status: 503 }))
    );
    await expect(downloadOfflinePack(plan, vi.fn(), new AbortController().signal)).rejects.toThrow(
      "Could not download"
    );
    expect([...stores.keys()].some((name) => name.startsWith("dura-offline-pack-"))).toBe(false);
    expect(stores.get(OFFLINE_INDEX)?.has(OFFLINE_POINTER)).not.toBe(true);
  });
  it("commits complete resources and detects later eviction", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("cached", { headers: { "content-type": "text/html" } }))
    );
    const pack = await downloadOfflinePack(plan, vi.fn(), new AbortController().signal);
    expect(await getOfflinePack()).toEqual(pack);
    expect(stores.get(OFFLINE_INDEX)?.has(OFFLINE_POINTER)).toBe(true);
    stores.get(pack.cache)?.delete(plan.urls[0]);
    expect(await getOfflinePack()).toBeNull();
  });
  it("leaves the previous completed pack intact on cancellation", async () => {
    stores.set("dura-offline-pack-old", new Map());
    const abort = new AbortController();
    abort.abort();
    await expect(downloadOfflinePack(plan, vi.fn(), abort.signal)).rejects.toThrow();
    expect(stores.has("dura-offline-pack-old")).toBe(true);
  });
  it.each([
    '<template data-dgst="764183779"></template>',
    '<script>self.__next_f.push([1,"a:E{\\"digest\\":\\"764183779\\"}\\n"])</script>',
    '<html id="__next_error__"><body>Failed render</body></html>',
  ])("rejects HTTP 200 server-render failures without publishing a pack: %s", async (html) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("asset"))
        .mockResolvedValueOnce(new Response(html, { headers: { "content-type": "text/html" } }))
    );
    await expect(downloadOfflinePack(plan, vi.fn(), new AbortController().signal)).rejects.toThrow(
      "failed to render"
    );
    expect(stores.get(OFFLINE_INDEX)?.has(OFFLINE_POINTER)).not.toBe(true);
    expect([...stores.keys()].some((name) => name.startsWith("dura-offline-pack-"))).toBe(false);
  });
});
