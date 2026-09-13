/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { cacheVisitedResponse } from "@/lib/offline/visited-response";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Industry-standard update flow (browser-style). When a new SW finishes
  // installing it sits in `waiting` instead of taking over immediately.
  // The client UI surfaces an "Update available" button; only when the
  // learner clicks it do we postMessage SKIP_WAITING below, swap the
  // controlling worker, and reload. Prevents the blank-screen-mid-lesson
  // failure mode where Vercel ships, the SW hot-swaps under a hydrated
  // tab, and the loaded JS tries to import chunks that no longer exist.
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request, url }) =>
        url.origin === self.location.origin &&
        ((request.mode === "navigate" &&
          (url.pathname.startsWith("/paths") ||
            url.pathname.startsWith("/judgment") ||
            url.pathname.startsWith("/labs"))) ||
          url.pathname.startsWith("/_next/static/") ||
          /^\/labs\/[\w-]+\.zip$/.test(url.pathname)),
      handler: async ({ request, event }) => {
        try {
          const preload =
            "preloadResponse" in event
              ? ((await (event as FetchEvent).preloadResponse) as Response | undefined)
              : undefined;
          const response = preload ?? (await fetch(request));
          if (response.ok) return cacheVisitedResponse(request, response, event);
          throw new Error("Network response unavailable");
        } catch (error) {
          const index = await caches.open("dura-offline-index");
          const pointer = await index.match("/__dura_offline_pack__");
          if (pointer) {
            const pack = (await pointer.json()) as { cache?: unknown };
            if (typeof pack.cache === "string" && pack.cache.startsWith("dura-offline-pack-")) {
              const cached = await (
                await caches.open(pack.cache)
              ).match(decodeURI(new URL(request.url).pathname));
              if (cached) return cached;
            }
          }
          // Preserve ordinary visited-page caching when no full pack was downloaded.
          const visited = await caches.match(request);
          if (visited) return visited;
          throw error;
        }
      },
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Bridge for the user-triggered update flow. The client posts
// { type: "SKIP_WAITING" } when the learner accepts the update; we then
// activate, which fires `controllerchange` on the page so the overlay
// can reload. Keep this message type in sync with
// src/hooks/useServiceWorkerUpdate.ts.
self.addEventListener("message", (event) => {
  if ((event as ExtendableMessageEvent).data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});
