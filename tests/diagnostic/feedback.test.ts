import { describe, expect, it } from "vitest";
import { evaluate, renderChoices } from "@/lib/diagnostic/feedback";
import { MISCONCEPTIONS } from "@/lib/diagnostic/misconceptions";
import type { MCQQuestion } from "@/lib/diagnostic/types";

const FIXTURE: MCQQuestion = {
  kind: "mcq",
  id: "fixture-1",
  difficulty: "intro",
  prompt: "What is the last element of ['a','b','c']?",
  correct: { text: "'c'" },
  distractors: [
    { text: "'d'", misconception: "off-by-one-indexing" },
    { text: "undefined", misconception: "off-by-one-indexing" },
    { text: "an error", misconception: "list-vs-array-confusion" },
  ],
  workedSolution: { steps: ["Step 1.", "Step 2.", "Step 3."] },
  confidenceCheck: true,
};

function findIndex(question: MCQQuestion, predicate: (text: string) => boolean): number {
  const choices = renderChoices(question);
  return choices.findIndex((c) => predicate(c.text));
}

describe("renderChoices", () => {
  it("is deterministic — same question id → same order", () => {
    const a = renderChoices(FIXTURE).map((c) => c.text);
    const b = renderChoices(FIXTURE).map((c) => c.text);
    expect(a).toEqual(b);
  });

  it("includes the correct answer exactly once", () => {
    const choices = renderChoices(FIXTURE);
    const correctCount = choices.filter((c) => c.correct).length;
    expect(correctCount).toBe(1);
  });

  it("includes every distractor", () => {
    const choices = renderChoices(FIXTURE);
    expect(choices).toHaveLength(FIXTURE.distractors.length + 1);
  });
});

describe("evaluate", () => {
  it("marks the correct choice as correct", () => {
    const correctIdx = findIndex(FIXTURE, (t) => t === "'c'");
    const result = evaluate(FIXTURE, { kind: "mcq", choiceIndex: correctIdx }, MISCONCEPTIONS);
    expect(result.correct).toBe(true);
    expect(result.selectedText).toBe("'c'");
    expect(result.correctText).toBe("'c'");
    expect(result.diagnosis).toBeUndefined();
  });

  it("attaches a diagnosis to a wrong choice tagged with a misconception", () => {
    const wrongIdx = findIndex(FIXTURE, (t) => t === "'d'");
    const result = evaluate(FIXTURE, { kind: "mcq", choiceIndex: wrongIdx }, MISCONCEPTIONS);
    expect(result.correct).toBe(false);
    expect(result.diagnosis).toBeDefined();
    expect(result.diagnosis?.misconception.id).toBe("off-by-one-indexing");
    expect(result.diagnosis?.explanation).toContain("Off-by-one");
  });

  it("returns the worked solution regardless of outcome", () => {
    const anyIdx = 0;
    const result = evaluate(FIXTURE, { kind: "mcq", choiceIndex: anyIdx }, MISCONCEPTIONS);
    expect(result.worked.steps).toHaveLength(3);
  });

  it("emits calibration only when confidence is provided", () => {
    const idx = findIndex(FIXTURE, (t) => t === "'c'");
    const without = evaluate(FIXTURE, { kind: "mcq", choiceIndex: idx }, MISCONCEPTIONS);
    const withC = evaluate(
      FIXTURE,
      { kind: "mcq", choiceIndex: idx, confidence: 5 },
      MISCONCEPTIONS
    );
    expect(without.calibration).toBeUndefined();
    expect(withC.calibration).toBeDefined();
    expect(withC.calibration?.confidence).toBe(5);
  });

  it("rating defaults to good for right + no confidence", () => {
    const idx = findIndex(FIXTURE, (t) => t === "'c'");
    const result = evaluate(FIXTURE, { kind: "mcq", choiceIndex: idx }, MISCONCEPTIONS);
    expect(result.rating).toBe("good");
  });

  it("rating downgrades to hard for right + low confidence (lucky guess)", () => {
    const idx = findIndex(FIXTURE, (t) => t === "'c'");
    const result = evaluate(
      FIXTURE,
      { kind: "mcq", choiceIndex: idx, confidence: 1 },
      MISCONCEPTIONS
    );
    expect(result.rating).toBe("hard");
  });

  it("rating upgrades to easy for right + high confidence", () => {
    const idx = findIndex(FIXTURE, (t) => t === "'c'");
    const result = evaluate(
      FIXTURE,
      { kind: "mcq", choiceIndex: idx, confidence: 5 },
      MISCONCEPTIONS
    );
    expect(result.rating).toBe("easy");
  });

  it("rating is always again on wrong, regardless of confidence", () => {
    const wrongIdx = findIndex(FIXTURE, (t) => t === "an error");
    const sure = evaluate(
      FIXTURE,
      { kind: "mcq", choiceIndex: wrongIdx, confidence: 5 },
      MISCONCEPTIONS
    );
    const guess = evaluate(
      FIXTURE,
      { kind: "mcq", choiceIndex: wrongIdx, confidence: 1 },
      MISCONCEPTIONS
    );
    expect(sure.rating).toBe("again");
    expect(guess.rating).toBe("again");
  });

  it("is referentially transparent — same inputs → identical output", () => {
    const idx = findIndex(FIXTURE, (t) => t === "'c'");
    const a = evaluate(FIXTURE, { kind: "mcq", choiceIndex: idx, confidence: 4 }, MISCONCEPTIONS);
    const b = evaluate(FIXTURE, { kind: "mcq", choiceIndex: idx, confidence: 4 }, MISCONCEPTIONS);
    expect(a).toEqual(b);
  });

  it("throws on an unknown misconception reference", () => {
    const broken: MCQQuestion = {
      ...FIXTURE,
      id: "fixture-broken",
      distractors: [{ text: "wrong", misconception: "does-not-exist" }],
    };
    const wrongIdx = findIndex(broken, (t) => t === "wrong");
    expect(() => evaluate(broken, { kind: "mcq", choiceIndex: wrongIdx }, MISCONCEPTIONS)).toThrow(
      /Unknown misconception/
    );
  });

  it("throws on an out-of-range choice index", () => {
    expect(() => evaluate(FIXTURE, { kind: "mcq", choiceIndex: 99 }, MISCONCEPTIONS)).toThrow(
      /out of range/
    );
  });
});
