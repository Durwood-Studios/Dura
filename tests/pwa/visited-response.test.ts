import { afterEach, expect, it, vi } from "vitest";
import { cacheVisitedResponse } from "@/lib/offline/visited-response";
afterEach(() => vi.unstubAllGlobals());
it("returns a readable response while cache persistence is still blocked", async () => {
  let release: () => void = () => undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const put = vi.fn(async () => pending);
  const keys = vi.fn(async () => []);
  vi.stubGlobal("caches", { open: async () => ({ put, keys }) });
  const work: Promise<unknown>[] = [];
  const response = new Response("complete document");
  const result = cacheVisitedResponse(new Request("https://dura.test/judgment/case"), response, {
    waitUntil: (promise) => {
      work.push(promise);
    },
  });
  expect(result).toBe(response);
  expect(await result.text()).toBe("complete document");
  expect(put).toHaveBeenCalledOnce();
  expect(keys).not.toHaveBeenCalled();
  release();
  await Promise.all(work);
  expect(keys).toHaveBeenCalledOnce();
});
it("does not turn cache failure into a failed network response", async () => {
  vi.stubGlobal("caches", {
    open: async () => {
      throw new Error("quota");
    },
  });
  const work: Promise<unknown>[] = [];
  const result = cacheVisitedResponse(
    new Request("https://dura.test/paths/0"),
    new Response("lesson"),
    {
      waitUntil: (promise) => {
        work.push(promise);
      },
    }
  );
  expect(await result.text()).toBe("lesson");
  await expect(Promise.all(work)).resolves.toEqual([undefined]);
});
