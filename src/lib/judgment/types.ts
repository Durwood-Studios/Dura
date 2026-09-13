/** Versioned case contracts. A written response is practice evidence, not a credential. */
export interface JudgmentSource {
  id: string;
  title: string;
  url: string;
  scope: string;
}
export interface JudgmentOption {
  id: string;
  label: string;
  feedback: string;
}
export interface JudgmentCase {
  id: string;
  version: number;
  title: string;
  domain: string;
  difficulty: "guided" | "independent" | "transfer";
  estimatedMinutes: number;
  prerequisites: { title: string; href: string }[];
  brief: string;
  constraints: string[];
  evidence: {
    id: string;
    label: string;
    detail: string;
    kind: "observation" | "assumption" | "constraint";
  }[];
  options: JudgmentOption[];
  standards: { sourceId: string; application: string }[];
  newEvidence: string;
  revisionPrompt: string;
  workedExample: { initial: string; revised: string; why: string };
  transferPrompt: string;
  teacherNotes: string;
}
export const JUDGMENT_RUBRIC_IDS = [
  "framing",
  "evidence",
  "tradeoffs",
  "standards",
  "validation",
  "revision",
] as const;
export type JudgmentRubricId = (typeof JUDGMENT_RUBRIC_IDS)[number];
export interface JudgmentRubric {
  id: JudgmentRubricId;
  title: string;
  anchors: readonly [string, string, string, string];
}
export interface JudgmentDecision {
  optionId: string;
  constraints: string;
  evidence: string;
  tradeoffs: string;
  standardIds: string[];
  standardReasoning: string;
  validationPlan: string;
  stopRule: string;
  confidence: number;
}
export interface JudgmentAttempt {
  schemaVersion: 1;
  id: string;
  caseId: string;
  caseVersion: number;
  createdAt: number;
  updatedAt: number;
  stage: "draft" | "committed" | "revised" | "reviewed";
  initial: JudgmentDecision;
  revision?: JudgmentDecision;
  committedAt?: number;
  revisedAt?: number;
  reflection?: string;
  selfAssessment?: Partial<Record<JudgmentRubricId, number>>;
  reviewDueAt?: number;
}
