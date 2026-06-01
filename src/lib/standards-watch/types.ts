/**
 * Standards-watch — track which revision of each cited industry standard is
 * current so the curriculum doesn't ship references to superseded versions.
 *
 * The 2025/2026 standards calendar already produced two corrections in this
 * session's bounded-research output (ISO 10218 unified Jan 2025; OWASP Top 10
 * finalized as 2025). Without an ongoing watch the next revision cycle will
 * silently leave content stale. This module is the structural fix.
 */

export interface StandardRevision {
  /** Family identifier — e.g. "ISO 10218", "OWASP Top 10", "ASME Y14.5". */
  family: string;
  /** Current revision in industry-canonical form — e.g. "ISO 10218-1:2025". */
  current: string;
  /** ISO date the current revision became effective. */
  effectiveFrom: string;
  /** Prior revisions and any partial successors. Each entry is the cited
   *  string the previous revision used. Treated as superseded by current. */
  supersededRevisions: readonly string[];
  /** Optional next revision known to be in progress (committee-confirmed
   *  with a target date). Used to warn authors that the current revision
   *  may be obsolete soon. */
  inProgress?: {
    targetRevision: string;
    estimatedEffectiveFrom: string;
    /** Short note on what's changing. */
    note?: string;
  };
}

export interface OutdatedReference {
  /** Where the outdated reference was found — file path or registry key. */
  source: string;
  /** Lesson or misconception identifier the reference belongs to. */
  ownerId: string;
  /** What was cited. */
  citedAs: string;
  /** What should be cited. */
  currentRevision: string;
  /** Family the standard belongs to. */
  family: string;
}

export interface UpcomingRevision {
  source: string;
  ownerId: string;
  currentRevision: string;
  targetRevision: string;
  estimatedEffectiveFrom: string;
  note?: string;
}

export interface StandardsWatchReport {
  /** When the scan ran. */
  generatedAt: number;
  outdated: readonly OutdatedReference[];
  upcoming: readonly UpcomingRevision[];
  /** Total distinct standards cited across all sources scanned. */
  totalReferences: number;
}
