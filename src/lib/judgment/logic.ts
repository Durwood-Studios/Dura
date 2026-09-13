import { JUDGMENT_CASES, JUDGMENT_RUBRICS, JUDGMENT_SOURCES } from "./cases";
import { JUDGMENT_RUBRIC_IDS } from "./types";
import type { JudgmentAttempt, JudgmentCase, JudgmentDecision, JudgmentRubricId } from "./types";

/** Start with no selected answer or implied certainty. Confidence is self-reported. */
export function emptyDecision(): JudgmentDecision {
  return {
    optionId: "",
    constraints: "",
    evidence: "",
    tradeoffs: "",
    standardIds: [],
    standardReasoning: "",
    validationPlan: "",
    stopRule: "",
    confidence: 50,
  };
}

/** New attempts preserve previous practice rather than resetting its history. */
export function createAttempt(case_: JudgmentCase, now: number = Date.now()): JudgmentAttempt {
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    caseId: case_.id,
    caseVersion: case_.version,
    createdAt: now,
    updatedAt: now,
    stage: "draft",
    initial: emptyDecision(),
  };
}

function currentCase(attempt: JudgmentAttempt): JudgmentCase {
  const case_ = JUDGMENT_CASES.find((item) => item.id === attempt.caseId);
  if (!case_ || case_.version !== attempt.caseVersion)
    throw new Error(
      "This case has changed. Keep this record and start a new attempt on the current version."
    );
  return case_;
}

/** Checks completeness only. Text length and selected sources do not grade reasoning. */
export function validateDecision(case_: JudgmentCase, decision: JudgmentDecision): void {
  if (!case_.options.some((option) => option.id === decision.optionId))
    throw new Error("Choose an option before recording your decision.");
  const fields = [
    ["constraints", "the people and constraints"],
    ["evidence", "the observations and uncertainties"],
    ["tradeoffs", "the tradeoffs between alternatives"],
    ["standardReasoning", "how the source applies and where its scope ends"],
    ["validationPlan", "a measurable validation plan"],
    ["stopRule", "a stop or rollback condition"],
  ] as const;
  for (const [key, label] of fields) {
    if (decision[key].trim().length < 15)
      throw new Error(`Explain ${label} in at least 15 characters.`);
    if (decision[key].length > 10_000)
      throw new Error("Keep each response under 10,000 characters.");
  }
  const allowed = new Set(case_.standards.map((item) => item.sourceId));
  if (
    !decision.standardIds.length ||
    new Set(decision.standardIds).size !== decision.standardIds.length ||
    decision.standardIds.some((id) => !allowed.has(id))
  )
    throw new Error("Select at least one of this case's relevant sources.");
  if (
    !Number.isInteger(decision.confidence) ||
    decision.confidence < 0 ||
    decision.confidence > 100
  )
    throw new Error("Choose a confidence estimate from 0 to 100.");
}

function snapshot(decision: JudgmentDecision): JudgmentDecision {
  return { ...decision, standardIds: [...decision.standardIds] };
}

/** Commit before disclosing counterevidence; subsequent saves cannot rewrite this decision. */
export function commitInitial(
  attempt: JudgmentAttempt,
  decision: JudgmentDecision,
  now: number = Date.now()
): JudgmentAttempt {
  if (attempt.stage !== "draft")
    throw new Error(
      "The initial decision is already recorded. Revise it or start another attempt."
    );
  validateDecision(currentCase(attempt), decision);
  now = Math.max(now, attempt.updatedAt + 1);
  return {
    ...attempt,
    initial: snapshot(decision),
    stage: "committed",
    committedAt: now,
    updatedAt: now,
  };
}

/** A defensible revision may retain the same option; reasons, not answer flipping, matter. */
export function commitRevision(
  attempt: JudgmentAttempt,
  decision: JudgmentDecision,
  now: number = Date.now()
): JudgmentAttempt {
  if (attempt.stage !== "committed")
    throw new Error("Record an initial decision before submitting a revision.");
  validateDecision(currentCase(attempt), decision);
  now = Math.max(now, attempt.updatedAt + 1);
  return {
    ...attempt,
    revision: snapshot(decision),
    stage: "revised",
    revisedAt: now,
    updatedAt: now,
  };
}

/** Schedule retrieval practice; seven days is a product default, not a validated optimum. */
export function completeReflection(
  attempt: JudgmentAttempt,
  ratings: Record<JudgmentRubricId, number>,
  reflection: string,
  now: number = Date.now()
): JudgmentAttempt {
  if (attempt.stage !== "revised" || !attempt.revision)
    throw new Error("Submit your revision before completing the self-review.");
  currentCase(attempt);
  now = Math.max(now, attempt.updatedAt + 1);
  if (
    JUDGMENT_RUBRIC_IDS.some(
      (id) => !Number.isInteger(ratings[id]) || ratings[id] < 0 || ratings[id] > 3
    )
  )
    throw new Error("Rate every rubric dimension using its 0–3 evidence anchors.");
  if (reflection.trim().length < 30 || reflection.length > 10_000)
    throw new Error(
      "Write a reflection of 30–10,000 characters explaining the evidence and what transfers to another case."
    );
  return {
    ...attempt,
    selfAssessment: { ...ratings },
    reflection: reflection.trim(),
    stage: "reviewed",
    reviewDueAt: now + 7 * 86_400_000,
    updatedAt: now,
  };
}

/** Portable readable evidence, explicitly separate from signed assessment credentials. */
export function exportAttemptMarkdown(case_: JudgmentCase, attempt: JudgmentAttempt): string {
  if (case_.id !== attempt.caseId || case_.version !== attempt.caseVersion)
    throw new Error("Export requires the matching case identity and version.");
  const decisionText = (name: string, decision: JudgmentDecision): string => {
    const option =
      case_.options.find((item) => item.id === decision.optionId)?.label ?? decision.optionId;
    return (
      `## ${name}\n\nOption: ${option}\n\nSelf-estimated confidence: ${decision.confidence}%\n\n` +
      [
        ["People and constraints", decision.constraints],
        ["Evidence and uncertainty", decision.evidence],
        ["Tradeoffs", decision.tradeoffs],
        ["Source application and limits", decision.standardReasoning],
        ["Validation", decision.validationPlan],
        ["Stop/rollback", decision.stopRule],
      ]
        .map(([title, text]) => `### ${title}\n\n${text}\n`)
        .join("\n") +
      "\nSources: " +
      decision.standardIds
        .map((id) => {
          const source = JUDGMENT_SOURCES.find((item) => item.id === id);
          return source ? `[${source.title}](${source.url})` : id;
        })
        .join(", ") +
      "\n"
    );
  };
  return (
    `# Engineering judgment: ${case_.title}\n\nCase: ${attempt.caseId} v${attempt.caseVersion}; attempt: ${attempt.id}\n\nStage: ${attempt.stage}. Learner-authored practice and self-review; not independently graded or certified.\n\n` +
    decisionText("Initial decision", attempt.initial) +
    (attempt.revision
      ? "\n" +
        decisionText(
          attempt.stage === "committed" ? "Revision draft" : "Recorded revision",
          attempt.revision
        )
      : "") +
    (attempt.reflection ? `\n## Reflection\n\n${attempt.reflection}\n` : "") +
    (attempt.selfAssessment
      ? "\n## Self-assessed rubric (0–3)\n\n" +
        JUDGMENT_RUBRICS.map(
          (rubric) => `- ${rubric.title}: ${attempt.selfAssessment?.[rubric.id] ?? "unrated"}`
        ).join("\n") +
        "\n"
      : "")
  );
}
