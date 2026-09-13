import { z } from "zod";

export const OFFLINE_INDEX = "dura-offline-index";
export const OFFLINE_POINTER = "/__dura_offline_pack__";
const ASSETS = z.object({
  version: z.string().min(1),
  assets: z
    .array(
      z.object({ url: z.string().startsWith("/_next/static/"), bytes: z.number().nonnegative() })
    )
    .min(1),
});
const PAGES = z.object({
  pages: z
    .array(
      z
        .string()
        .regex(/^\/(paths(?:\/[\w-]+)*|judgment(?:\/[\w-]+)*|labs(?:\/[\w-]+(?:\.zip)?)?|offline)$/)
    )
    .min(1),
  lessons: z.number().int().positive(),
});
export interface OfflinePlan {
  version: string;
  urls: string[];
  lessons: number;
  assetBytes: number;
}
export interface OfflinePack {
  cache: string;
  version: string;
  lessons: number;
  resources: number;
  bytes: number;
  downloadedAt: number;
}

/** Read the exact production asset list and authored curriculum list before requesting storage. */
export async function planOfflineDownload(): Promise<OfflinePlan> {
  try {
    const responses = await Promise.all([
      fetch("/offline-assets.json", { cache: "no-store" }),
      fetch("/api/offline/manifest", { cache: "no-store" }),
    ]);
    if (responses.some((response) => !response.ok))
      throw new Error(
        "Offline downloads require the production asset manifest. Reload online or ask the site operator to rebuild."
      );
    const assets = ASSETS.parse(await responses[0].json());
    const pages = PAGES.parse(await responses[1].json());
    return {
      version: assets.version,
      urls: [...new Set([...assets.assets.map((asset) => asset.url), ...pages.pages])],
      lessons: pages.lessons,
      assetBytes: assets.assets.reduce((total, asset) => total + asset.bytes, 0),
    };
  } catch (error) {
    console.error("[offline] Planning failed", error);
    throw error;
  }
}

/** Read a committed offline pack; incomplete downloads are never advertised as available. */
export async function getOfflinePack(): Promise<OfflinePack | null> {
  try {
    const response = await (await caches.open(OFFLINE_INDEX)).match(OFFLINE_POINTER);
    if (!response) return null;
    const pack = (await response.json()) as OfflinePack;
    if (
      !(await caches.has(pack.cache)) ||
      (await (await caches.open(pack.cache)).keys()).length !== pack.resources
    )
      return null;
    return pack;
  } catch (error) {
    console.warn("[offline] Pack status unavailable", error);
    return null;
  }
}

/** Download into a new cache and publish its pointer only after every response is verified. */
export async function downloadOfflinePack(
  plan: OfflinePlan,
  onProgress: (done: number, total: number, bytes: number) => void,
  signal: AbortSignal
): Promise<OfflinePack> {
  const cacheName = `dura-offline-pack-${crypto.randomUUID()}`;
  let committed = false;
  try {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller)
      throw new Error(
        "Offline support is not active yet. Reload this installed production app and retry."
      );
    const estimate = await navigator.storage?.estimate();
    if (estimate?.quota && estimate.quota - (estimate.usage ?? 0) < plan.assetBytes)
      throw new Error(
        "There is not enough browser storage for the application assets. Free storage and retry."
      );
    const previousPack = await getOfflinePack();
    const cache = await caches.open(cacheName);
    let bytes = 0;
    for (let i = 0; i < plan.urls.length; i++) {
      signal.throwIfAborted();
      const url = plan.urls[i];
      const response = await fetch(url, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
        credentials: "omit",
        cache: "no-store",
      });
      if (!response.ok || response.redirected)
        throw new Error(`Could not download ${url}. Your previous completed pack is unchanged.`);
      const blob = await response.clone().blob();
      if (
        url.startsWith("/paths") ||
        url.startsWith("/judgment") ||
        (url.startsWith("/labs") && !url.endsWith(".zip"))
      ) {
        if (!response.headers.get("content-type")?.includes("text/html"))
          throw new Error(`Expected a lesson document at ${url}.`);
        const document = new DOMParser().parseFromString(await blob.text(), "text/html");
        // Streaming SSR can finish with HTTP 200 while carrying a failed server component.
        // Client-only boundaries are expected; actual render digests must not become a complete pack.
        const failedBoundary = document.querySelector(
          'template[data-dgst]:not([data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"])'
        );
        const failedFlight = [...document.scripts].some(
          (script) =>
            script.textContent?.includes("self.__next_f.push") &&
            /[0-9a-f]+:E\{\\?"digest\\?":/i.test(script.textContent)
        );
        if (failedBoundary || failedFlight || document.getElementById("__next_error__"))
          throw new Error(
            `The page at ${url} failed to render. Your previous completed pack is unchanged.`
          );
        for (const element of document.querySelectorAll("script[src],link[href]")) {
          const source = element.getAttribute("src") ?? element.getAttribute("href");
          if (
            source?.startsWith("/_next/static/") &&
            !plan.urls.includes(decodeURI(source.split("?")[0]))
          )
            throw new Error("The site updated during download. Retry to get a consistent version.");
        }
      }
      bytes += blob.size;
      signal.throwIfAborted();
      await cache.put(url, response);
      onProgress(i + 1, plan.urls.length, bytes);
    }
    signal.throwIfAborted();
    if ((await cache.keys()).length !== plan.urls.length)
      throw new Error(
        "The browser did not retain every downloaded resource. Free storage and retry."
      );
    const pack: OfflinePack = {
      cache: cacheName,
      version: plan.version,
      lessons: plan.lessons,
      resources: plan.urls.length,
      bytes,
      downloadedAt: Date.now(),
    };
    await (await caches.open(OFFLINE_INDEX)).put(OFFLINE_POINTER, Response.json(pack));
    committed = true;
    // Never delete another tab's in-progress cache while replacing the old pack.
    if (previousPack && previousPack.cache !== cacheName) {
      try {
        await caches.delete(previousPack.cache);
      } catch (cleanupError) {
        console.warn("[offline] Old pack cleanup failed", cleanupError);
      }
    }
    return pack;
  } catch (error) {
    console.error("[offline] Download did not complete", error);
    throw error;
  } finally {
    if (!committed) await caches.delete(cacheName);
  }
}

/** Remove downloaded application content without touching learner records. */
export async function removeOfflinePack(): Promise<void> {
  try {
    await caches.delete(OFFLINE_INDEX);
    for (const name of await caches.keys())
      if (name.startsWith("dura-offline-pack-")) await caches.delete(name);
  } catch (error) {
    console.error("[offline] Removal failed", error);
    throw error;
  }
}
