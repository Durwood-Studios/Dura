import { describe, expect, it } from "vitest";
import { PHASE_R, getPhaseRLesson, phaseRStandardsCostUSD } from "@/lib/phase-r";
import { MISCONCEPTIONS } from "@/lib/diagnostic/misconceptions";

describe("PHASE_R registry", () => {
  it("exposes 8 lessons in canonical order", () => {
    expect(PHASE_R.lessons).toHaveLength(8);
    PHASE_R.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
    });
  });

  it("has unique lesson IDs", () => {
    const ids = new Set(PHASE_R.lessons.map((l) => l.id));
    expect(ids.size).toBe(PHASE_R.lessons.length);
  });

  it("every lesson has at least one anchoring standard", () => {
    for (const lesson of PHASE_R.lessons) {
      expect(lesson.standards.length).toBeGreaterThan(0);
    }
  });

  it("every misconception cited by a lesson exists in the diagnostic catalog", () => {
    for (const lesson of PHASE_R.lessons) {
      for (const misconceptionId of lesson.misconceptions) {
        expect(MISCONCEPTIONS[misconceptionId]).toBeDefined();
      }
    }
  });

  it("Phase R slot is between Phase 5 and Phase 8", () => {
    expect(PHASE_R.slotsAfterPhase).toBe("5");
    expect(PHASE_R.slotsBeforePhase).toBe("8");
  });
});

describe("getPhaseRLesson", () => {
  it("returns a lesson when the id matches", () => {
    const lesson = getPhaseRLesson("r-1-iso-8373-vocabulary");
    expect(lesson).toBeDefined();
    expect(lesson?.title).toBe("ISO 8373 Vocabulary");
  });

  it("returns undefined for unknown ids", () => {
    expect(getPhaseRLesson("r-99-does-not-exist")).toBeUndefined();
  });
});

describe("phaseRStandardsCostUSD", () => {
  it("returns a positive total under five thousand USD", () => {
    const total = phaseRStandardsCostUSD();
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(5000);
  });

  it("deduplicates standards used by multiple lessons", () => {
    // ISO 10218-1:2025 appears in R3, R4, and R6 — counted once.
    const total = phaseRStandardsCostUSD();
    const everyStandardSummed = PHASE_R.lessons
      .flatMap((l) => l.standards)
      .filter((s) => s.paywalled && s.approxCostUSD !== null)
      .reduce((sum, s) => sum + (s.approxCostUSD ?? 0), 0);
    // The dedup'd total should be strictly less than the raw sum since at
    // least one standard (ISO 10218-1:2025) is reused.
    expect(total).toBeLessThan(everyStandardSummed);
  });

  it("counts ROS-Industrial as zero (public spec)", () => {
    const rosLesson = PHASE_R.lessons.find((l) => l.id === "r-6-ros-industrial");
    const rosStandard = rosLesson?.standards[0];
    expect(rosStandard?.paywalled).toBe(false);
    expect(rosStandard?.approxCostUSD).toBeNull();
  });
});
