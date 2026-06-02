import { describe, expect, it } from "vitest";
import { PHASE_E, getPhaseELesson } from "@/lib/phase-e";

describe("PHASE_E registry", () => {
  it("exposes 8 lessons in canonical order", () => {
    expect(PHASE_E.lessons).toHaveLength(8);
    PHASE_E.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
    });
  });

  it("has unique lesson IDs", () => {
    const ids = new Set(PHASE_E.lessons.map((l) => l.id));
    expect(ids.size).toBe(PHASE_E.lessons.length);
  });

  it("every lesson declares at least one language", () => {
    for (const lesson of PHASE_E.lessons) {
      expect(lesson.languages.length).toBeGreaterThan(0);
    }
  });

  it("every lesson declares a concrete target", () => {
    for (const lesson of PHASE_E.lessons) {
      expect(lesson.target.length).toBeGreaterThan(0);
    }
  });

  it("at least one lesson is Rust-based (the rust-cortex-m lesson)", () => {
    const rustLessons = PHASE_E.lessons.filter((l) => l.languages.includes("rust"));
    expect(rustLessons.length).toBeGreaterThanOrEqual(1);
  });

  it("the capstone has a verify artifact; non-capstones don't", () => {
    const capstone = PHASE_E.lessons.find((l) => l.id === "e-8-capstone");
    expect(capstone?.hasVerifyArtifact).toBe(true);
    const otherLessons = PHASE_E.lessons.filter((l) => l.id !== "e-8-capstone");
    for (const lesson of otherLessons) {
      expect(lesson.hasVerifyArtifact).toBe(false);
    }
  });

  it("Phase E sits after Phase 5 and parallels Phase R", () => {
    expect(PHASE_E.slotsAfterPhase).toBe("5");
    expect(PHASE_E.parallelTo).toBe("r-robotics");
  });

  it("is explicitly code-first — no lesson cites more than one standard", () => {
    // Phase E's design constraint: standards appear only where load-bearing.
    // No lesson should reference multiple standards (that would signal a
    // certification-prep drift like Phase R / Phase M have).
    for (const lesson of PHASE_E.lessons) {
      expect(lesson.standards.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("getPhaseELesson", () => {
  it("returns a lesson when the id matches", () => {
    const lesson = getPhaseELesson("e-1-c-toolchain-arm-cortex-m");
    expect(lesson).toBeDefined();
    expect(lesson?.title).toBe("C Toolchain for ARM Cortex-M");
  });

  it("returns undefined for unknown ids", () => {
    expect(getPhaseELesson("e-99-does-not-exist")).toBeUndefined();
  });
});
