import { describe, expect, it } from "vitest";
import { ALL_QUESTIONS } from "@/content/questions";
import { PHASES } from "@/content/phases";
import { selectVerificationQuestions } from "@/lib/assessment";
import { recommendPath } from "@/lib/skill-assessment";
import type { SkillScore } from "@/types/skill-assessment";

describe("assessment blueprint", () => {
  it("uses unique questions and canonical phase-module pairs", () => {
    expect(new Set(ALL_QUESTIONS.map((question) => question.id)).size).toBe(ALL_QUESTIONS.length);
    const pairs = new Set(
      PHASES.flatMap((phase) => phase.modules.map((entry) => `${phase.id}/${entry.id}`))
    );
    for (const question of ALL_QUESTIONS) {
      expect(pairs.has(`${question.phaseId}/${question.moduleId}`), question.id).toBe(true);
    }
  });

  it("provides a full twelve-question practice gate for every registered module", () => {
    for (const phase of PHASES)
      for (const entry of phase.modules) {
        const pool = ALL_QUESTIONS.filter(
          (question) => question.phaseId === phase.id && question.moduleId === entry.id
        );
        expect(pool.length, `${phase.id}/${entry.id} ${entry.title}`).toBeGreaterThanOrEqual(12);
      }
  });

  it("samples every nonempty module before taking extra questions", () => {
    for (const phase of PHASES) {
      const expected = new Set(
        ALL_QUESTIONS.filter((q) => q.phaseId === phase.id).map((q) => q.moduleId)
      );
      for (const random of [0, 0.2, 0.5, 0.99]) {
        const selected = selectVerificationQuestions(phase.id, ALL_QUESTIONS, 30, () => random);
        expect(new Set(selected.map((q) => q.moduleId))).toEqual(expected);
        expect(new Set(selected.map((q) => q.id)).size).toBe(selected.length);
      }
      expect(selectVerificationQuestions(phase.id, ALL_QUESTIONS, expected.size - 1)).toEqual([]);
    }
  });

  it("does not recommend advanced entry with unestablished foundations", () => {
    for (let correct = 0; correct < 7; correct++) {
      const score: SkillScore = {
        total: 50,
        correct,
        dreyfusLevel: "novice",
        byBracket: {
          "0-1": { total: 10, correct },
          "2-3": { total: 10, correct: 0 },
          "4-5": { total: 10, correct: 0 },
          "6-7": { total: 10, correct: 0 },
          "8-9": { total: 10, correct: 0 },
        },
      };
      expect(recommendPath(score)).toBe("foundation");
    }
  });
});
