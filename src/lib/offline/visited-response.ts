interface ResponseLifetime {
  waitUntil(promise: Promise<unknown>): void;
}

/** Return network content immediately; cache stream consumption must not hold navigation open. */
export function cacheVisitedResponse(
  request: Request,
  response: Response,
  event: ResponseLifetime
): Response {
  const copy = response.clone();
  event.waitUntil(
    (async (): Promise<void> => {
      try {
        const runtime = await caches.open("dura-curriculum-runtime");
        await runtime.put(request, copy);
        const keys = await runtime.keys();
        for (const key of keys.slice(0, Math.max(0, keys.length - 256))) await runtime.delete(key);
      } catch (error) {
        console.warn("[offline] Visited resource could not be cached", error);
      }
    })()
  );
  return response;
}
