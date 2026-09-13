import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PrintQuiz, PrintWritten } from "@/components/teacher/PrintActivities";
import { standardsCSV } from "@/lib/exports/standards-export";
import type { LessonMeta } from "@/types/curriculum";

function lesson(phaseId: string, moduleId: string, title: string): LessonMeta {
  return {
    id: "01",
    slug: "01",
    phaseId,
    moduleId,
    title,
    description: "",
    estimatedMinutes: 10,
    difficulty: 1,
    bloom: "apply",
    dreyfus: "novice",
    standards: {},
    vocabulary: [],
    order: 1,
  };
}

describe("teacher output", () => {
  it("keeps same-number lesson titles distinct in standards CSV", () => {
    const output = standardsCSV(
      [{ framework: "cs2023", code: "SDF", lessonIds: ["0/0-1/01"] }],
      [lesson("0", "0-1", "Binary"), lesson("14", "14-14", "Metrology")]
    );
    expect(output).toContain("Binary");
    expect(output).not.toContain("Metrology");
  });
  it("prints every quiz question and complete written review without hydration", () => {
    const output = renderToStaticMarkup(
      <>
        <PrintQuiz
          questions={[
            { question: "First prompt", options: ["One", "Two"], correct: 0 },
            { question: "Second prompt", options: ["Three", "Four"], correct: 1 },
          ]}
        />
        <PrintWritten
          instructions="Design a cache"
          rubric={["State freshness"]}
          modelAnswer="A bounded TTL"
        />
      </>
    );
    for (const text of [
      "First prompt",
      "Second prompt",
      "Three",
      "Four",
      "Answer key",
      "State freshness",
      "A bounded TTL",
    ])
      expect(output).toContain(text);
    expect(output).not.toContain("button");
  });
});
