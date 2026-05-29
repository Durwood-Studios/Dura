import { describe, expect, it } from "vitest";
import { buildPlan, pressureShare } from "@/lib/prescription/engine";
import {
  COLD_START,
  GATE_AVAILABLE,
  HEAVY_DEBT_RETURN,
  LIGHT_REVIEW_DAY,
  REMEDIATION_TRIGGERED,
} from "@/lib/prescription/fixtures";
import { PRESSURE_BUCKETS, STALE_REVIEW_DAMPENING } from "@/lib/prescription/policy";

describe("pressureShare", () => {
  it("returns 0 when no cards are due", () => {
    expect(pressureShare(0)).toBe(0);
  });

  it("hits the heavy bucket at 50+ due", () => {
    expect(pressureShare(50)).toBe(0.7);
    expect(pressureShare(200)).toBe(0.7);
  });

  it("hits the moderate bucket at 20–49 due", () => {
    expect(pressureShare(20)).toBe(0.5);
    expect(pressureShare(49)).toBe(0.5);
  });

  it("hits the light bucket at 1–19 due", () => {
    expect(pressureShare(1)).toBe(0.3);
    expect(pressureShare(19)).toBe(0.3);
  });

  it("every bucket in the policy is reachable", () => {
    for (const bucket of PRESSURE_BUCKETS) {
      expect(pressureShare(bucket.duePastThreshold)).toBe(bucket.fsrsShare);
    }
  });
});

describe("buildPlan — purity", () => {
  it("is referentially transparent for every fixture", () => {
    for (const inputs of [
      COLD_START,
      LIGHT_REVIEW_DAY,
      HEAVY_DEBT_RETURN,
      REMEDIATION_TRIGGERED,
      GATE_AVAILABLE,
    ]) {
      expect(buildPlan(inputs)).toEqual(buildPlan(inputs));
    }
  });

  it("does not mutate its inputs", () => {
    const snapshot = JSON.parse(JSON.stringify(LIGHT_REVIEW_DAY));
    buildPlan(LIGHT_REVIEW_DAY);
    expect(LIGHT_REVIEW_DAY).toEqual(snapshot);
  });
});

describe("buildPlan — cold start", () => {
  it("returns a single fresh-start block when the learner has no signal", () => {
    const plan = buildPlan(COLD_START);
    expect(plan.signalQuality).toBe("fresh");
    expect(plan.blocks).toHaveLength(1);
    expect(plan.blocks[0].kind).toBe("fresh-start");
    expect(plan.blocks[0].minutes).toBe(COLD_START.preferences.targetMinutes);
    expect(plan.blocks[0].href).toMatch(/^\/paths\/0\//);
  });
});

describe("buildPlan — light review", () => {
  it("allocates ~30% to review and ~70% to advance with 12 cards due", () => {
    const plan = buildPlan(LIGHT_REVIEW_DAY);
    const fsrsBlock = plan.blocks.find((b) => b.kind === "fsrs-review");
    const lessonBlocks = plan.blocks.filter((b) => b.kind === "lesson");
    expect(fsrsBlock).toBeDefined();
    expect(fsrsBlock!.minutes).toBeCloseTo(30 * 0.3, 0);
    expect(lessonBlocks.length).toBeGreaterThanOrEqual(1);
  });

  it("totals to the target minutes", () => {
    const plan = buildPlan(LIGHT_REVIEW_DAY);
    const sum = plan.blocks.reduce((s, b) => s + b.minutes, 0);
    expect(sum).toBe(LIGHT_REVIEW_DAY.preferences.targetMinutes);
  });

  it("emits a calibrated signal when both FSRS and session are present", () => {
    expect(buildPlan(LIGHT_REVIEW_DAY).signalQuality).toBe("calibrated");
  });
});

describe("buildPlan — heavy debt", () => {
  it("leads with FSRS review when 50+ cards are overdue", () => {
    const plan = buildPlan(HEAVY_DEBT_RETURN);
    expect(plan.blocks[0].kind).toBe("fsrs-review");
  });

  it("applies stale-deck dampening when the oldest card is over a week", () => {
    const plan = buildPlan(HEAVY_DEBT_RETURN);
    const fsrs = plan.blocks.find((b) => b.kind === "fsrs-review")!;
    // 30 min × 70% bucket × 0.8 dampening = 16.8 → rounded 17
    const expected = Math.round(30 * 0.7 * STALE_REVIEW_DAMPENING);
    expect(fsrs.minutes).toBe(expected);
  });

  it("warming signal when only FSRS data is present, no session", () => {
    expect(buildPlan(HEAVY_DEBT_RETURN).signalQuality).toBe("warming");
  });
});

describe("buildPlan — remediation", () => {
  it("switches to a remediation plan after 3 consecutive again ratings", () => {
    const plan = buildPlan(REMEDIATION_TRIGGERED);
    expect(plan.blocks[0].kind).toBe("remediation");
    expect(plan.blocks[0].target).toBe("N+1 queries");
    expect(plan.summary).toMatch(/N\+1 queries/);
  });

  it("does not switch to remediation without the streak", () => {
    const plan = buildPlan(LIGHT_REVIEW_DAY);
    expect(plan.blocks.some((b) => b.kind === "remediation")).toBe(false);
  });
});

describe("buildPlan — mastery gate priority", () => {
  it("inserts a mastery-gate block when the gate is available", () => {
    const plan = buildPlan(GATE_AVAILABLE);
    expect(plan.blocks.some((b) => b.kind === "mastery-gate")).toBe(true);
  });
});

describe("buildPlan — block links", () => {
  it("every block has a non-empty href", () => {
    for (const inputs of [
      LIGHT_REVIEW_DAY,
      HEAVY_DEBT_RETURN,
      REMEDIATION_TRIGGERED,
      GATE_AVAILABLE,
    ]) {
      for (const block of buildPlan(inputs).blocks) {
        expect(block.href.length).toBeGreaterThan(0);
      }
    }
  });

  it("every block has a non-empty rationale", () => {
    for (const block of buildPlan(LIGHT_REVIEW_DAY).blocks) {
      expect(block.rationale.length).toBeGreaterThan(0);
    }
  });
});
