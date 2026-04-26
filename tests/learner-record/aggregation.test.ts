import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDPNoise,
  buildContentDifficultySignal,
  buildDailyReviewAggregate,
  buildSessionDurationAggregate,
  laplaceNoise,
} from "@/lib/analytics/aggregation";

describe("laplaceNoise", () => {
  it("returns 0 when sensitivity is 0", () => {
    expect(laplaceNoise(0, 1)).toBe(0);
  });

  it("throws when epsilon is non-positive", () => {
    expect(() => laplaceNoise(1, 0)).toThrow();
    expect(() => laplaceNoise(1, -0.1)).toThrow();
  });

  it("throws when sensitivity is negative", () => {
    expect(() => laplaceNoise(-1, 1)).toThrow();
  });

  it("scales noise by sensitivity / epsilon (smaller epsilon → more noise on average)", () => {
    const samples = 5_000;
    const tight = Array.from({ length: samples }, () => laplaceNoise(1, 10));
    const loose = Array.from({ length: samples }, () => laplaceNoise(1, 0.1));
    const meanAbs = (xs: number[]) => xs.reduce((a, b) => a + Math.abs(b), 0) / xs.length;
    expect(meanAbs(loose)).toBeGreaterThan(meanAbs(tight));
  });

  it("is centered near zero (mean of many samples is close to 0)", () => {
    const samples = 10_000;
    const xs = Array.from({ length: samples }, () => laplaceNoise(1, 1));
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(Math.abs(mean)).toBeLessThan(0.1);
  });
});

describe("addDPNoise", () => {
  beforeEach(() => {
    // Force Math.random to a deterministic non-0.5 value so noise is reproducible.
    vi.spyOn(Math, "random").mockReturnValue(0.7);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds noise to fields listed in sensitivity, leaves others alone", () => {
    const noised = addDPNoise(
      { a: 100, b: 50, c: 0, label: "foo" as const },
      { epsilon: 1, sensitivity: { a: 10 } }
    );
    expect(noised.a).not.toBe(100);
    expect(noised.b).toBe(50);
    expect(noised.c).toBe(0);
    expect(noised.label).toBe("foo");
  });

  it("treats missing sensitivities as 0 (no noise) — deliberate fail-safe", () => {
    const noised = addDPNoise(
      { documented: 100, undocumented: 200 },
      { epsilon: 1, sensitivity: { documented: 10 } }
    );
    expect(noised.undocumented).toBe(200);
    expect(noised.documented).not.toBe(100);
  });

  it("clamps to non-negative when nonNegative is set", () => {
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.001); // big negative noise
    const noised = addDPNoise(
      { count: 1 },
      { epsilon: 0.1, sensitivity: { count: 100 }, nonNegative: true }
    );
    expect(noised.count).toBeGreaterThanOrEqual(0);
  });

  it("rounds to integer when round is set", () => {
    const noised = addDPNoise(
      { count: 100 },
      { epsilon: 1, sensitivity: { count: 5 }, round: true }
    );
    expect(Number.isInteger(noised.count)).toBe(true);
  });
});

describe("buildDailyReviewAggregate", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // noise = 0
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty aggregate when no reviews", () => {
    expect(buildDailyReviewAggregate("2026-04-25", [])).toEqual({
      date: "2026-04-25",
      review_count: 0,
      avg_rating: 0,
    });
  });

  it("computes count + mean rating from raw reviews (noise mocked to 0)", () => {
    const reviews = [
      { rating: "good", reviewedAt: 1 }, // 3
      { rating: "easy", reviewedAt: 2 }, // 4
      { rating: "again", reviewedAt: 3 }, // 1
    ];
    const out = buildDailyReviewAggregate("2026-04-25", reviews);
    expect(out.review_count).toBe(3);
    expect(out.avg_rating).toBeCloseTo(8 / 3, 5);
  });

  it("clamps review_count to non-negative even after noise pushes negative", () => {
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.0001);
    const reviews = [{ rating: "good", reviewedAt: 1 }];
    const out = buildDailyReviewAggregate("2026-04-25", reviews);
    expect(out.review_count).toBeGreaterThanOrEqual(0);
  });
});

describe("buildSessionDurationAggregate", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("converts milliseconds to minutes", () => {
    const sessions = [
      { durationMs: 1_800_000, endedAt: 1 }, // 30 min
      { durationMs: 600_000, endedAt: 2 }, //  10 min
    ];
    const out = buildSessionDurationAggregate("2026-04-25", sessions);
    expect(out.total_minutes).toBeCloseTo(40, 5);
  });

  it("returns 0 minutes for an empty session list", () => {
    expect(buildSessionDurationAggregate("2026-04-25", [])).toEqual({
      date: "2026-04-25",
      total_minutes: 0,
    });
  });
});

describe("buildContentDifficultySignal", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when sample size is below threshold (noise would dominate)", () => {
    const ratings = Array.from({ length: 5 }, () => ({ rating: "good" }));
    expect(buildContentDifficultySignal("lesson-1", ratings, 10)).toBeNull();
  });

  it("computes lapse rate as fraction of 'again' ratings", () => {
    const ratings = [
      ...Array.from({ length: 7 }, () => ({ rating: "good" })),
      ...Array.from({ length: 3 }, () => ({ rating: "again" })),
    ];
    const out = buildContentDifficultySignal("lesson-1", ratings, 10);
    expect(out).not.toBeNull();
    expect(out!.lapse_rate).toBeCloseTo(0.3, 5);
    expect(out!.sample_size).toBe(10);
  });

  it("preserves the lessonId (not noised — it's a string)", () => {
    const ratings = Array.from({ length: 10 }, () => ({ rating: "good" }));
    const out = buildContentDifficultySignal("lesson-42", ratings, 10);
    expect(out?.lessonId).toBe("lesson-42");
  });
});
