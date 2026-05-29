import { describe, expect, it } from "vitest";
import {
  ADVANCE_STREAK,
  MAX_BLOCK_MINUTES,
  MIN_BLOCK_MINUTES,
  PRESSURE_BUCKETS,
  REMEDIATION_STREAK,
  STALE_REVIEW_DAMPENING,
  TARGET_BLOCK_MINUTES,
} from "@/lib/prescription/policy";

describe("policy invariants", () => {
  it("pressure buckets are ordered from heaviest threshold to lightest", () => {
    for (let i = 1; i < PRESSURE_BUCKETS.length; i++) {
      expect(PRESSURE_BUCKETS[i].duePastThreshold).toBeLessThan(
        PRESSURE_BUCKETS[i - 1].duePastThreshold
      );
    }
  });

  it("heavier pressure allocates more time to review", () => {
    for (let i = 1; i < PRESSURE_BUCKETS.length; i++) {
      expect(PRESSURE_BUCKETS[i].fsrsShare).toBeLessThan(PRESSURE_BUCKETS[i - 1].fsrsShare);
    }
  });

  it("every fsrsShare is between 0 and 1 exclusive", () => {
    for (const bucket of PRESSURE_BUCKETS) {
      expect(bucket.fsrsShare).toBeGreaterThan(0);
      expect(bucket.fsrsShare).toBeLessThan(1);
    }
  });

  it("block minute targets are in order MIN ≤ TARGET ≤ MAX", () => {
    expect(MIN_BLOCK_MINUTES).toBeLessThanOrEqual(TARGET_BLOCK_MINUTES);
    expect(TARGET_BLOCK_MINUTES).toBeLessThanOrEqual(MAX_BLOCK_MINUTES);
  });

  it("streak thresholds are positive integers", () => {
    expect(Number.isInteger(REMEDIATION_STREAK)).toBe(true);
    expect(REMEDIATION_STREAK).toBeGreaterThan(0);
    expect(Number.isInteger(ADVANCE_STREAK)).toBe(true);
    expect(ADVANCE_STREAK).toBeGreaterThan(0);
  });

  it("stale-review dampening is strictly less than 1 (a discount, not a boost)", () => {
    expect(STALE_REVIEW_DAMPENING).toBeLessThan(1);
    expect(STALE_REVIEW_DAMPENING).toBeGreaterThan(0);
  });
});
