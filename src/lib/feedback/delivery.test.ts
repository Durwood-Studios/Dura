import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { FeedbackEntry } from "@/types/feedback";
import {
  flushFeedback,
  saveFeedback,
  startFeedbackDelivery,
  pauseFeedbackDelivery,
  resumeFeedbackDelivery,
} from "@/lib/feedback/delivery";

const state = vi.hoisted(() => ({ rows: new Map<string, FeedbackEntry>(), failSave: false }));
vi.mock("@/lib/db", () => ({
  getDB: vi.fn(async () => {
    const store = {
      get: async (id: string) => state.rows.get(id),
      put: async (entry: FeedbackEntry) => {
        if (state.failSave) throw new Error("disk full");
        state.rows.set(entry.id, entry);
      },
      index: () => ({
        openCursor: async () => {
          const entries = [...state.rows.values()];
          let index = 0;
          const cursor = {
            get value(): FeedbackEntry {
              return entries[index];
            },
            continue: async () => (++index < entries.length ? cursor : null),
          };
          return entries.length ? cursor : null;
        },
      }),
    };
    return {
      put: async (_name: string, entry: FeedbackEntry) => store.put(entry),
      get: async (_name: string, id: string) => store.get(id),
      transaction: () => ({ store, done: Promise.resolve() }),
    };
  }),
}));
const ENTRY: FeedbackEntry = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  message: "Please add practice",
  category: "content",
  pageUrl: "/learn",
  createdAt: 1,
  synced: false,
};

beforeEach(() => {
  state.rows.clear();
  state.failSave = false;
  resumeFeedbackDelivery();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test-key");
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(async () => {
  await pauseFeedbackDelivery();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("durable feedback delivery", () => {
  it("persists offline and delivers on reconnect with stable idempotency key", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetcher);
    const stop = startFeedbackDelivery();
    await saveFeedback(ENTRY);
    await flushFeedback();
    expect(state.rows.get(ENTRY.id)?.synced).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    window.dispatchEvent(new Event("online"));
    await flushFeedback();
    stop();
    expect(state.rows.get(ENTRY.id)?.synced).toBe(true);
    expect(fetcher.mock.calls[0][0]).toContain("/rest/v1/rpc/submit_feedback");
    expect(JSON.parse(fetcher.mock.calls[0][1].body).p_id).toBe(ENTRY.id);
    expect(fetcher.mock.calls[0][1].headers.Prefer).toBeUndefined();
  });
  it("keeps failed HTTP requests queued and retries without changing the id", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetcher);
    await saveFeedback(ENTRY);
    await flushFeedback();
    expect(state.rows.get(ENTRY.id)?.synced).toBe(false);
    await flushFeedback();
    expect(state.rows.get(ENTRY.id)?.synced).toBe(true);
    expect(fetcher.mock.calls[0][1].body).toBe(fetcher.mock.calls[1][1].body);
  });
  it("reports storage failure and rejects invalid data before sending", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    state.failSave = true;
    await expect(saveFeedback(ENTRY)).rejects.toThrow("could not be saved");
    state.failSave = false;
    await expect(saveFeedback({ ...ENTRY, message: " " })).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("retries saved feedback at startup and coalesces concurrent flushes", async () => {
    state.rows.set(ENTRY.id, ENTRY);
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetcher);
    const stop = startFeedbackDelivery();
    await Promise.all([flushFeedback(), flushFeedback()]);
    stop();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("aborts a stuck request during reset and pauses future retries", async () => {
    state.rows.set(ENTRY.id, ENTRY);
    let started: (() => void) | undefined;
    const requestStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    const fetcher = vi.fn(
      (_url: string, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener("abort", () => reject(new Error("aborted")));
          started?.();
        })
    );
    vi.stubGlobal("fetch", fetcher);
    const pending = flushFeedback();
    await requestStarted;
    await pauseFeedbackDelivery();
    await pending;
    state.rows.clear();
    await flushFeedback();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(state.rows.size).toBe(0);
  });
  it("times out network requests without losing queued feedback", async () => {
    vi.useFakeTimers();
    state.rows.set(ENTRY.id, ENTRY);
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            options.signal?.addEventListener("abort", () => reject(new Error("timeout")));
          })
      )
    );
    const pending = flushFeedback();
    await vi.advanceTimersByTimeAsync(10_001);
    await pending;
    expect(state.rows.get(ENTRY.id)?.synced).toBe(false);
  });
});
