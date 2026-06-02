import { describe, expect, it } from "vitest";
import { PHASE_H, getPhaseHLesson } from "@/lib/phase-h";

describe("PHASE_H registry", () => {
  it("exposes 8 lessons in canonical order", () => {
    expect(PHASE_H.lessons).toHaveLength(8);
    PHASE_H.lessons.forEach((l, i) => expect(l.order).toBe(i + 1));
  });

  it("every lesson cites at least one IEEE standard", () => {
    for (const lesson of PHASE_H.lessons) {
      expect(lesson.standards.length).toBeGreaterThan(0);
      expect(lesson.standards.some((s) => s.includes("IEEE"))).toBe(true);
    }
  });

  it("the capstone has a /verify artifact", () => {
    const capstone = PHASE_H.lessons.find((l) => l.id === "h-8-capstone-uart-uvm-tb");
    expect(capstone?.hasVerifyArtifact).toBe(true);
  });

  it("parallels Phase E (both are post-Phase-5 code-teaching tracks)", () => {
    expect(PHASE_H.parallelTo).toBe("e-embedded");
    expect(PHASE_H.slotsAfterPhase).toBe("5");
  });
});

describe("getPhaseHLesson", () => {
  it("returns a lesson when the id matches", () => {
    const lesson = getPhaseHLesson("h-1-systemverilog-basics");
    expect(lesson?.title).toBe("SystemVerilog Basics for Verification");
  });

  it("returns undefined for unknown ids", () => {
    expect(getPhaseHLesson("h-99-fake")).toBeUndefined();
  });
});
