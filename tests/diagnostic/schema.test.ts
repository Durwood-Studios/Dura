import { describe, expect, it } from "vitest";
import { QuestionSchema, SubmissionSchema } from "@/lib/diagnostic/schema";
import { ALL_EXAMPLES } from "@/lib/diagnostic/examples";

describe("QuestionSchema", () => {
  it("accepts the canonical example questions", () => {
    for (const q of ALL_EXAMPLES) {
      expect(() => QuestionSchema.parse(q)).not.toThrow();
    }
  });

  it("rejects an empty prompt", () => {
    const broken = { ...ALL_EXAMPLES[0], prompt: "" };
    expect(() => QuestionSchema.parse(broken)).toThrow();
  });

  it("rejects zero distractors", () => {
    const broken = { ...ALL_EXAMPLES[0], distractors: [] };
    expect(() => QuestionSchema.parse(broken)).toThrow();
  });

  it("rejects more than four distractors", () => {
    const broken = {
      ...ALL_EXAMPLES[0],
      distractors: Array.from({ length: 5 }, () => ({
        text: "x",
        misconception: "off-by-one-indexing",
      })),
    };
    expect(() => QuestionSchema.parse(broken)).toThrow();
  });

  it("rejects an unknown difficulty", () => {
    const broken = { ...ALL_EXAMPLES[0], difficulty: "impossible" };
    expect(() => QuestionSchema.parse(broken)).toThrow();
  });

  it("rejects empty workedSolution steps", () => {
    const broken = { ...ALL_EXAMPLES[0], workedSolution: { steps: [] } };
    expect(() => QuestionSchema.parse(broken)).toThrow();
  });
});

describe("SubmissionSchema", () => {
  it("accepts a minimal submission", () => {
    expect(() => SubmissionSchema.parse({ kind: "mcq", choiceIndex: 0 })).not.toThrow();
  });

  it("accepts a submission with confidence", () => {
    expect(() =>
      SubmissionSchema.parse({ kind: "mcq", choiceIndex: 2, confidence: 4 })
    ).not.toThrow();
  });

  it("rejects negative choice index", () => {
    expect(() => SubmissionSchema.parse({ kind: "mcq", choiceIndex: -1 })).toThrow();
  });

  it("rejects out-of-range confidence", () => {
    expect(() => SubmissionSchema.parse({ kind: "mcq", choiceIndex: 0, confidence: 7 })).toThrow();
  });
});
