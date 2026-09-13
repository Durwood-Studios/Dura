import { z } from "zod";

/** Evidence is local learning work, not independently verified competency. */
export const ACTIVITY_EVIDENCE_SCHEMA = z.object({
  kind: z.enum(["automatic", "self-reviewed"]),
  updatedAt: z.number().finite().nonnegative(),
  completedAt: z.number().finite().nonnegative().nullable(),
  response: z.string().max(50000).optional(),
  score: z.number().min(0).max(1).optional(),
});

export const ACTIVITY_EVIDENCE_MAP_SCHEMA = z.record(
  z.string().min(1).max(200),
  ACTIVITY_EVIDENCE_SCHEMA
);

export type ActivityEvidence = z.infer<typeof ACTIVITY_EVIDENCE_SCHEMA>;

/** A changed prompt creates a new requirement instead of inheriting stale credit. */
export function activityIdentity(kind: string, content: string): string {
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${kind}:${(hash >>> 0).toString(16)}`;
}

/** Every source-versioned requirement needs its own recorded evidence. */
export function areActivitiesComplete(
  required: string[],
  evidence: Record<string, ActivityEvidence> = {}
): boolean {
  return required.every((id) => evidence[id]?.completedAt != null);
}
