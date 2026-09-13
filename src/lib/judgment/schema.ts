import { z } from "zod";
import { JUDGMENT_RUBRIC_IDS } from "@/lib/judgment/types";

const text = z.string().max(10_000);
const time = z.number().finite().nonnegative();
const decision = z
  .object({
    optionId: z.string().max(200),
    constraints: text,
    evidence: text,
    tradeoffs: text,
    standardIds: z.array(z.string().max(200)).max(30),
    standardReasoning: text,
    validationPlan: text,
    stopRule: text,
    confidence: z.number().int().min(0).max(100),
  })
  .strict();
/** Bounded local/import format; practice text is never an automatically verified credential. */
export const JUDGMENT_ATTEMPT_SCHEMA = z
  .object({
    schemaVersion: z.literal(1),
    id: z.uuid(),
    caseId: z.string().min(1).max(200),
    caseVersion: z.number().int().positive(),
    createdAt: time,
    updatedAt: time,
    stage: z.enum(["draft", "committed", "revised", "reviewed"]),
    initial: decision,
    revision: decision.optional(),
    committedAt: time.optional(),
    revisedAt: time.optional(),
    reflection: text.optional(),
    selfAssessment: z
      .partialRecord(z.enum(JUDGMENT_RUBRIC_IDS), z.number().int().min(0).max(3))
      .optional(),
    reviewDueAt: time.optional(),
  })
  .strict()
  .superRefine((attempt, context): void => {
    const complete = (value: z.infer<typeof decision>): boolean =>
      value.optionId.trim().length > 0 &&
      value.standardIds.length > 0 &&
      new Set(value.standardIds).size === value.standardIds.length &&
      [
        value.constraints,
        value.evidence,
        value.tradeoffs,
        value.standardReasoning,
        value.validationPlan,
        value.stopRule,
      ].every((field) => field.trim().length >= 15);
    if (
      (attempt.stage !== "draft" && !complete(attempt.initial)) ||
      (["revised", "reviewed"].includes(attempt.stage) &&
        (!attempt.revision || !complete(attempt.revision))) ||
      (attempt.stage === "reviewed" &&
        ((attempt.reflection?.trim().length ?? 0) < 30 ||
          JUDGMENT_RUBRIC_IDS.some((id) => attempt.selfAssessment?.[id] === undefined) ||
          attempt.reviewDueAt === undefined))
    )
      context.addIssue({
        code: "custom",
        message: "This stage requires complete recorded reasoning and self-review evidence.",
      });

    if (
      attempt.updatedAt < attempt.createdAt ||
      (attempt.stage !== "draft" && attempt.committedAt === undefined) ||
      (["revised", "reviewed"].includes(attempt.stage) &&
        (!attempt.revision || attempt.revisedAt === undefined))
    )
      context.addIssue({
        code: "custom",
        message: "The practice attempt has an invalid stage or timestamp.",
      });
  });
