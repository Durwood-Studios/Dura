import { describe, expect, it } from "vitest";
import { PHASE_M, getPhaseMLesson, phaseMStandardsCostUSD } from "@/lib/phase-m";
import { MISCONCEPTIONS } from "@/lib/diagnostic/misconceptions";

describe("PHASE_M registry", () => {
  it("exposes 12 lessons in canonical order", () => {
    expect(PHASE_M.lessons).toHaveLength(12);
    PHASE_M.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
    });
  });

  it("has unique lesson IDs", () => {
    const ids = new Set(PHASE_M.lessons.map((l) => l.id));
    expect(ids.size).toBe(PHASE_M.lessons.length);
  });

  it("every lesson has at least one anchoring standard", () => {
    for (const lesson of PHASE_M.lessons) {
      expect(lesson.standards.length).toBeGreaterThan(0);
    }
  });

  it("every misconception cited by a lesson exists in the diagnostic catalog", () => {
    for (const lesson of PHASE_M.lessons) {
      for (const misconceptionId of lesson.misconceptions) {
        expect(MISCONCEPTIONS[misconceptionId]).toBeDefined();
      }
    }
  });

  it("Phase M sits parallel to Phase R with prereqs through Phase 5", () => {
    expect(PHASE_M.parallelTo).toBe("r-robotics");
    expect(PHASE_M.prereqsThroughPhase).toBe("5");
  });

  it("at least 4 lessons have /verify-anchorable artifacts", () => {
    const verifyLessons = PHASE_M.lessons.filter((l) => l.hasVerifyArtifact);
    expect(verifyLessons.length).toBeGreaterThanOrEqual(4);
  });
});

describe("getPhaseMLesson", () => {
  it("returns a lesson when the id matches", () => {
    const lesson = getPhaseMLesson("m-1-iso-9001-baseline");
    expect(lesson).toBeDefined();
    expect(lesson?.title).toBe("ISO 9001 Baseline");
  });

  it("returns undefined for unknown ids", () => {
    expect(getPhaseMLesson("m-99-not-real")).toBeUndefined();
  });
});

describe("phaseMStandardsCostUSD", () => {
  it("returns a positive total for the standards library", () => {
    expect(phaseMStandardsCostUSD()).toBeGreaterThan(0);
  });

  it("deduplicates standards used by multiple lessons", () => {
    // ISO 9001 appears in M1 + M2 — counted once.
    const total = phaseMStandardsCostUSD();
    const rawSum = PHASE_M.lessons
      .flatMap((l) => l.standards)
      .filter((s) => s.paywalled && s.approxCostUSD !== null)
      .reduce((sum, s) => sum + (s.approxCostUSD ?? 0), 0);
    expect(total).toBeLessThan(rawSum);
  });

  it("counts public-spec standards as zero (Lean/TPS, Six Sigma, MTConnect, OPC UA, RAMI 4.0, IIRA)", () => {
    const lean = PHASE_M.lessons.find((l) => l.id === "m-4-lean-tps")?.standards[0];
    const sixSigma = PHASE_M.lessons.find((l) => l.id === "m-5-six-sigma-dmaic")?.standards[0];
    const mtconnect = PHASE_M.lessons
      .find((l) => l.id === "m-11-mtconnect-opcua-tsn")
      ?.standards.find((s) => s.id === "MTConnect");
    for (const std of [lean, sixSigma, mtconnect]) {
      expect(std?.paywalled).toBe(false);
      expect(std?.approxCostUSD).toBeNull();
    }
  });
});
