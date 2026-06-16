import { describe, expect, it } from "vitest";
import { PHASE_Q, getPhaseQLesson } from "@/lib/phase-q";

describe("PHASE_Q registry", () => {
  it("exposes 8 lessons in canonical order", () => {
    expect(PHASE_Q.lessons).toHaveLength(8);
    PHASE_Q.lessons.forEach((l, i) => expect(l.order).toBe(i + 1));
  });

  it("every lesson cites at least one standard", () => {
    for (const lesson of PHASE_Q.lessons) {
      expect(lesson.standards.length).toBeGreaterThan(0);
    }
  });

  it("the capstone has a /verify artifact", () => {
    const capstone = PHASE_Q.lessons.find((l) => l.id === "q-8-capstone-order-book");
    expect(capstone?.hasVerifyArtifact).toBe(true);
  });
});

describe("getPhaseQLesson", () => {
  it("returns a lesson when the id matches", () => {
    expect(getPhaseQLesson("q-1-modern-cpp-for-hft")?.title).toBe(
      "Modern C++ for HFT — Move Semantics, Templates, constexpr"
    );
  });
  it("returns undefined for unknown ids", () => {
    expect(getPhaseQLesson("q-99-fake")).toBeUndefined();
  });
});
