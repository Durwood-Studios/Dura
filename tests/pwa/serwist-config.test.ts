import { expect, it, vi } from "vitest";
import type { NextConfig } from "next";

const configureSerwist = vi.hoisted(() => vi.fn());
vi.mock("@serwist/next", () => ({
  default: (options: unknown): ((config: NextConfig) => NextConfig) => {
    configureSerwist(options);
    return (config: NextConfig): NextConfig => config;
  },
}));

it("overrides Serwist's reconnect reload default to preserve unsaved learner work", async (): Promise<void> => {
  await import("../../next.config");
  expect(configureSerwist).toHaveBeenCalledWith(expect.objectContaining({ reloadOnOnline: false }));
});
