import { describe, expect, it } from "vitest";
import { PHASE_S, getPhaseSLesson } from "@/lib/phase-s";

describe("PHASE_S registry", () => {
  it("exposes 8 lessons in canonical order", () => {
    expect(PHASE_S.lessons).toHaveLength(8);
    PHASE_S.lessons.forEach((l, i) => expect(l.order).toBe(i + 1));
  });

  it("every lesson cites at least one standard", () => {
    for (const lesson of PHASE_S.lessons) {
      expect(lesson.standards.length).toBeGreaterThan(0);
    }
  });

  it("the capstone has a /verify artifact", () => {
    const capstone = PHASE_S.lessons.find((l) => l.id === "s-8-capstone-harden-a-service");
    expect(capstone?.hasVerifyArtifact).toBe(true);
  });
});

describe("getPhaseSLesson", () => {
  it("returns a lesson when the id matches", () => {
    expect(getPhaseSLesson("s-1-threat-modeling")?.title).toBe(
      "Threat Modeling — STRIDE, Attack Trees, Data-Flow Diagrams"
    );
  });
  it("returns undefined for unknown ids", () => {
    expect(getPhaseSLesson("s-99-fake")).toBeUndefined();
  });
});
