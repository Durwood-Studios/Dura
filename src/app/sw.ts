/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

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
  runtimeCaching: defaultCache,
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
