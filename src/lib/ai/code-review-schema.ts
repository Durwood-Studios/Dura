import { z } from "zod";

/**
 * Structured shape of a code review response. Claude is prompted to
 * return JSON conforming to this schema; the client validates with
 * Zod and falls back to surfacing the raw text if the model emits
 * something off-shape (never blow up the page on a formatting glitch).
 */
export const CodeReviewSchema = z.object({
  summary: z.string().min(1).max(500),
  whatWorks: z.array(z.string().min(1).max(400)).max(8),
  improvements: z
    .array(
      z.object({
        issue: z.string().min(1).max(120),
        explanation: z.string().min(1).max(600),
        category: z.string().min(1).max(60),
      })
    )
    .max(10),
  conceptCallouts: z
    .array(
      z.object({
        term: z.string().min(1).max(60),
        why: z.string().min(1).max(400),
      })
    )
    .max(6),
  encouragement: z.string().min(1).max(400),
});

export type CodeReview = z.infer<typeof CodeReviewSchema>;

/** Convenience type for the inline-improvement card. */
export type ImprovementBlock = CodeReview["improvements"][number];
