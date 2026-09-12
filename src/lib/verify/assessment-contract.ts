import { z } from "zod";

export const START_ASSESSMENT_SCHEMA = z
  .object({
    phaseId: z.string().regex(/^(?:[0-9]|1[0-4])$/),
    displayName: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[^\u0000-\u001f\u007f]+$/u),
  })
  .strict();

export const SUBMIT_ASSESSMENT_SCHEMA = z
  .object({
    attempt: z.string().min(1).max(8192),
    answers: z
      .array(
        z
          .object({
            questionId: z.string().min(1).max(120),
            selected: z.array(z.number().int().min(0).max(99)).max(100),
          })
          .strict()
      )
      .min(1)
      .max(30),
  })
  .strict();

export interface PresentedQuestion {
  id: string;
  question: string;
  options: string[];
  isMultiple: boolean;
}

export interface AssessmentStart {
  attempt: string;
  expiresAt: number;
  questions: PresentedQuestion[];
}

export interface IssuedCredential {
  version: 1;
  kind: "dura-server-scored-assessment";
  id: string;
  phaseId: string;
  phaseTitle: string;
  selfReportedName: string;
  correctCount: number;
  totalQuestions: number;
  score: number;
  passingScore: 0.8;
  attemptStartedAt: number;
  questionBankDigest: string;
  assessmentMode: "unproctored-unlimited-practice";
}

export interface AssessmentSubmission {
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  score: number;
  credential?: string;
  claims?: IssuedCredential;
}

export const CREDENTIAL_SCHEMA = z
  .object({
    version: z.literal(1),
    kind: z.literal("dura-server-scored-assessment"),
    id: z.string().regex(/^[a-f0-9]{64}$/),
    phaseId: START_ASSESSMENT_SCHEMA.shape.phaseId,
    phaseTitle: z.string().min(1),
    selfReportedName: START_ASSESSMENT_SCHEMA.shape.displayName,
    correctCount: z.number().int().min(0).max(30),
    totalQuestions: z.number().int().min(1).max(30),
    score: z.number().min(0.8).max(1),
    passingScore: z.literal(0.8),
    attemptStartedAt: z.number().int().positive(),
    questionBankDigest: z.string().regex(/^[a-f0-9]{64}$/),
    assessmentMode: z.literal("unproctored-unlimited-practice"),
  })
  .strict();

export const ASSESSMENT_START_RESPONSE_SCHEMA = z.object({
  attempt: z.string(),
  expiresAt: z.number(),
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        options: z.array(z.string()),
        isMultiple: z.boolean(),
      })
    )
    .min(1),
});
export const ASSESSMENT_SUBMISSION_RESPONSE_SCHEMA = z.object({
  passed: z.boolean(),
  correctCount: z.number(),
  totalQuestions: z.number(),
  score: z.number(),
  credential: z.string().optional(),
  claims: CREDENTIAL_SCHEMA.optional(),
});
