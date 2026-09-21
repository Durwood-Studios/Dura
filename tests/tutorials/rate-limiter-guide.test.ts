// @vitest-environment node
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import ts from "typescript";
const source = readFileSync("src/content/tutorials/33-rate-limiter.mdx", "utf8");
function load(name: string, dependency?: unknown): unknown {
  const block = [...source.matchAll(/```typescript\n([\s\S]*?)```/g)].find(
    (match) =>
      match[1].includes(`export class ${name}`) ||
      match[1].includes(`export async function ${name}`)
  );
  if (!block) throw new Error(`Missing authored ${name}`);
  const text = block[1]
    .replace(/^import .*;$/gm, "")
    .replace(/^export /gm, "")
    .replace(/^loadTest\(.*$/gm, "");
  const js = ts.transpileModule(text, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  // Execute the actual trusted teaching snippets, rather than a copied implementation.
  return new Function(
    name === "CleanableStore" ? "unused" : "CleanableStore",
    `${js}; return ${name};`
  )(dependency) as unknown;
}
interface Store {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  cleanup(): void;
  destroy(): void;
}
interface Bucket {
  consume(key: string): { allowed: boolean; remaining: number };
  destroy(): void;
}
const StoreClass = load("CleanableStore") as new (
  ttl: number,
  interval: number,
  clock: () => number
) => Store;
const BucketClass = load("TokenBucketLimiter", StoreClass) as new (
  config: { maxTokens: number; refillRate: number },
  clock: () => number
) => Bucket;
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("expires stored keys and injects time into actual bucket refill", () => {
  let now = 0;
  const store = new StoreClass(100, 60000, () => now);
  const bucket = new BucketClass({ maxTokens: 2, refillRate: 10 }, () => now);
  try {
    store.set("old", { value: 1 });
    expect(bucket.consume("a").allowed).toBe(true);
    expect(bucket.consume("a").allowed).toBe(true);
    expect(bucket.consume("a").allowed).toBe(false);
    now = 100;
    store.cleanup();
    expect(store.get("old")).toBeUndefined();
    expect(bucket.consume("a").allowed).toBe(true);
    now = 1000;
    expect(bucket.consume("a").remaining).toBe(1);
  } finally {
    store.destroy();
    bucket.destroy();
  }
});
it("reserves exactly the requested attempts despite concurrent failures and nonstandard statuses", async () => {
  const loadTest = load("loadTest") as (
    url: string,
    count: number,
    concurrency: number
  ) => Promise<{ allowed: number; rejected: number; errors: number }>;
  let calls = 0;
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, options: RequestInit): Promise<Response> => {
      expect(options.signal).toBeInstanceOf(AbortSignal);
      calls++;
      if (calls % 2) throw new Error("fixture connection error");
      return new Response(null, { status: 503 });
    })
  );
  expect(await loadTest("http://localhost", 17, 8)).toEqual({
    allowed: 0,
    rejected: 0,
    errors: 17,
  });
  expect(calls).toBe(17);
  await expect(loadTest("http://localhost", 1, 0)).rejects.toThrow("budget");
});
it("classifies successes and rate denials without overshooting a small budget", async () => {
  const loadTest = load("loadTest") as (
    url: string,
    count: number,
    concurrency: number
  ) => Promise<{ allowed: number; rejected: number; errors: number }>;
  const fetcher = vi.fn(async (): Promise<Response> => new Response(null, { status: 429 }));
  vi.stubGlobal("fetch", fetcher);
  expect(await loadTest("http://localhost", 3, 10)).toEqual({ allowed: 0, rejected: 3, errors: 0 });
  expect(fetcher).toHaveBeenCalledTimes(3);
});
