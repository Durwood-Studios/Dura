import { z } from "zod";

const DifficultySchema = z.enum(["intro", "core", "stretch"]);

const RemediationPointerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("lesson"), path: z.string().min(1), label: z.string().min(1) }),
  z.object({ kind: z.literal("drill"), id: z.string().min(1), label: z.string().min(1) }),
  z.object({ kind: z.literal("reading"), href: z.string().url(), label: z.string().min(1) }),
]);

export const MisconceptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  remediation: RemediationPointerSchema,
});

const WorkedSolutionSchema = z.object({
  steps: z.array(z.string().min(1)).min(1),
});

const DistractorSchema = z.object({
  text: z.string().min(1),
  misconception: z.string().min(1),
});

const MCQQuestionSchema = z.object({
  kind: z.literal("mcq"),
  id: z.string().min(1),
  difficulty: DifficultySchema,
  prompt: z.string().min(1),
  correct: z.object({
    text: z.string().min(1),
    explanation: z.string().optional(),
  }),
  distractors: z.array(DistractorSchema).min(1).max(4),
  workedSolution: WorkedSolutionSchema,
  confidenceCheck: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export const QuestionSchema = z.discriminatedUnion("kind", [MCQQuestionSchema]);

const ConfidenceLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const SubmissionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mcq"),
    choiceIndex: z.number().int().nonnegative(),
    confidence: ConfidenceLevelSchema.optional(),
  }),
]);
