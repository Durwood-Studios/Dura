import { describe, expect, it } from "vitest";
import { JUDGMENT_CASES, JUDGMENT_RUBRICS, JUDGMENT_SOURCES } from "@/lib/judgment/cases";
import {
  commitInitial,
  commitRevision,
  completeReflection,
  createAttempt,
  emptyDecision,
  exportAttemptMarkdown,
} from "@/lib/judgment/logic";
import type { JudgmentDecision, JudgmentRubricId } from "@/lib/judgment/types";

const case_ = JUDGMENT_CASES[0];
function response(): JudgmentDecision {
  return {
    ...emptyDecision(),
    optionId: case_.options[2].id,
    constraints: "Preserve offline work and separate owners.",
    evidence: "A late acknowledgement overwrites a newer completion.",
    tradeoffs: "Compare timestamp ordering with versioned per-record merge.",
    standardIds: [case_.standards[0].sourceId],
    standardReasoning:
      "Apply the stated integrity contract; a citation alone proves no compliance.",
    validationPlan: "Replay two devices with clock skew and compare every persisted version.",
    stopRule: "Stop cloud writes if the merge cannot preserve local completion.",
    confidence: 65,
  };
}
const ratings: Record<JudgmentRubricId, number> = {
  framing: 2,
  evidence: 2,
  tradeoffs: 2,
  standards: 2,
  validation: 2,
  revision: 2,
};
describe("judgment practice contract", () => {
  it("requires a decision before disclosure, preserves its snapshot and accepts reasoned same-option revision", () => {
    const draft = createAttempt(case_, 1);
    expect(() => commitInitial(draft, emptyDecision())).toThrow();
    expect(() => commitRevision(draft, response())).toThrow();
    const decision = response();
    const committed = commitInitial(draft, decision, 2);
    decision.standardIds.push("unexpected");
    expect(committed.initial.standardIds).toHaveLength(1);
    expect(() => commitInitial(committed, response())).toThrow();
    const revised = commitRevision(committed, { ...response(), confidence: 50 }, 3);
    expect(revised.initial.confidence).toBe(65);
    expect(revised.revision?.confidence).toBe(50);
    expect(() => commitRevision(revised, response())).toThrow();
  });
  it("requires anchored self-review and retains an explicitly unverified portable record", () => {
    const committed = commitInitial(createAttempt(case_), response());
    const revised = commitRevision(committed, response());
    expect(() =>
      completeReflection(committed, ratings, "A long enough reflection for the test.")
    ).toThrow();
    expect(() =>
      completeReflection(
        revised,
        { ...ratings, revision: 9 },
        "A long enough reflection for the test."
      )
    ).toThrow();
    const reviewed = completeReflection(
      revised,
      ratings,
      "Source identity and deletion history change the recovery design.",
      1000
    );
    expect(reviewed.updatedAt).toBeGreaterThan(revised.updatedAt);
    expect(reviewed.reviewDueAt).toBe(reviewed.updatedAt + 7 * 86400000);
    expect(exportAttemptMarkdown(case_, reviewed)).toContain(
      "not independently graded or certified"
    );
    expect(exportAttemptMarkdown(case_, reviewed)).toContain("Recorded revision");
  });
  it("refuses to label exported reasoning with a different case or version", () => {
    const attempt = createAttempt(case_);
    expect(() => exportAttemptMarkdown({ ...case_, id: "other" }, attempt)).toThrow(
      /matching case/
    );
    expect(() => exportAttemptMarkdown({ ...case_, version: case_.version + 1 }, attempt)).toThrow(
      /matching case/
    );
  });
  it("does not silently reinterpret an older case version", () => {
    expect(() => commitInitial({ ...createAttempt(case_), caseVersion: 999 }, response())).toThrow(
      /case has changed/
    );
  });
  it("has complete cases, stable identities, explicit sources and evidence-anchored rubrics", () => {
    expect(new Set(JUDGMENT_CASES.map((item) => item.id)).size).toBe(JUDGMENT_CASES.length);
    for (const item of JUDGMENT_CASES) {
      expect(item.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(item.options.map((option) => option.id)).size).toBe(item.options.length);
      for (const source of item.standards)
        expect(JUDGMENT_SOURCES.some((entry) => entry.id === source.sourceId)).toBe(true);
      for (const text of [
        item.newEvidence,
        item.workedExample.initial,
        item.workedExample.revised,
        item.workedExample.why,
        item.teacherNotes,
        item.transferPrompt,
      ])
        expect(text.length).toBeGreaterThan(40);
    }
    expect(JUDGMENT_RUBRICS).toHaveLength(6);
    for (const rubric of JUDGMENT_RUBRICS) expect(new Set(rubric.anchors).size).toBe(4);
  });
});
