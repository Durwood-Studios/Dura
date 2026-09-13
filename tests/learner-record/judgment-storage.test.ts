import { expect, it } from "vitest";
import { JUDGMENT_ATTEMPT_SCHEMA } from "@/lib/judgment/schema";
import { mergeJudgmentAttempt } from "@/lib/db/judgment";
import type { JudgmentAttempt } from "@/lib/judgment/types";
const initial = {
  optionId: "a",
  constraints: "A complete authored explanation for this field.",
  evidence: "A complete authored explanation for this field.",
  tradeoffs: "A complete authored explanation for this field.",
  standardIds: ["source"],
  standardReasoning: "A complete authored explanation for this field.",
  validationPlan: "A complete authored explanation for this field.",
  stopRule: "A complete authored explanation for this field.",
  confidence: 50,
};
const attempt: JudgmentAttempt = {
  schemaVersion: 1,
  id: "550e8400-e29b-41d4-a716-446655440000",
  caseId: "case",
  caseVersion: 1,
  createdAt: 1,
  updatedAt: 2,
  stage: "committed",
  committedAt: 2,
  initial,
};
it("preserves committed reasoning, case version and stage against stale or destructive saves", () => {
  expect(mergeJudgmentAttempt(attempt, { ...attempt, updatedAt: 1 })).toBe(attempt);
  expect(mergeJudgmentAttempt(attempt, { ...attempt, updatedAt: 3, stage: "draft" })).toBe(attempt);
  expect(() =>
    mergeJudgmentAttempt(attempt, {
      ...attempt,
      updatedAt: 3,
      initial: { ...initial, evidence: "rewrite" },
    })
  ).toThrow("Committed");
  expect(() => mergeJudgmentAttempt(attempt, { ...attempt, updatedAt: 3, caseVersion: 2 })).toThrow(
    "identity"
  );
  const revised: JudgmentAttempt = {
    ...attempt,
    updatedAt: 3,
    stage: "revised",
    revision: initial,
    revisedAt: 3,
  };
  expect(mergeJudgmentAttempt(attempt, revised)).toEqual(revised);
  expect(() =>
    mergeJudgmentAttempt(revised, {
      ...revised,
      updatedAt: 4,
      revision: { ...initial, evidence: "rewrite" },
    })
  ).toThrow("submitted revision");
});
it("rejects malformed, huge or impossible practice records before storage/import", () => {
  expect(JUDGMENT_ATTEMPT_SCHEMA.safeParse(attempt).success).toBe(true);
  for (const bad of [
    { ...attempt, id: "no" },
    { ...attempt, initial: { ...initial, evidence: "x".repeat(10001) } },
    { ...attempt, committedAt: undefined },
    { ...attempt, stage: "revised" },
    { ...attempt, stage: "reviewed", revision: initial, revisedAt: 3, updatedAt: 3 },
    { ...attempt, initial: { ...initial, evidence: "" } },
  ])
    expect(JUDGMENT_ATTEMPT_SCHEMA.safeParse(bad).success).toBe(false);
});
