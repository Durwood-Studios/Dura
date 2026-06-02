/**
 * Paths — typed registry of curated learner outcomes per FM-1.0.
 *
 * A Path is a named outcome ("Robotics Software Engineer", "Embedded
 * Engineer") that resolves to a sequence of phases + optional module
 * scoping. Paths are the discovery primitive that lets learners pick
 * an outcome and have the platform sequence the existing PHASES
 * registry for them.
 *
 * Paths are ADDITIVE — they reference PHASES; they do not duplicate
 * lesson content. Adding a new Path requires no new lessons.
 */

/**
 * A reference from a Path to a specific phase. The optional module
 * scoping lets a Path select a subset of a phase's modules when only
 * part of the phase is on the path's spine.
 */
export type PathPhaseRef = {
  /** PHASES entry id — "0", "1", "r", "m", "e", etc. */
  phaseId: string;
  /**
   * Optional module ids ("0-1", "0-2") to include. If omitted, the
   * entire phase is on the path. Use sparingly — most paths want
   * the whole phase.
   */
  moduleIds?: readonly string[];
  /**
   * "spine" — required for the path's stated outcome. The learner
   * is expected to complete this phase's selected modules.
   * "elective" — recommended companion content that deepens the path
   * but is not strictly required.
   */
  scope: "spine" | "elective";
  /**
   * One short sentence explaining why this phase is on this path.
   * Shown on the path detail page next to the phase reference.
   */
  rationale: string;
};

/**
 * A Path is a curated journey through the curriculum aimed at a
 * specific engineering outcome. The status field flags paths whose
 * referenced phases are not all fully built yet.
 */
export type Path = {
  /** Stable id — kebab-case. Used in URLs and references. */
  id: string;
  /** URL slug; matches id by default. */
  slug: string;
  /** Display title — "Robotics Software Engineer". */
  title: string;
  /** One short line shown on cards. */
  tagline: string;
  /** Two to three sentences of description. */
  description: string;
  /**
   * What the learner can do at the end of the path. Concrete and
   * action-oriented — "Ship production firmware against an ARM
   * Cortex-M target with HAL abstraction and a real-time scheduler."
   */
  outcome: string;
  /**
   * Archetype label — "Robotics", "Embedded", "Web", "ML", etc. Used
   * for grouping in the directory.
   */
  archetype: PathArchetype;
  /** CSS color variable or hex. Used for the path's accent. */
  color: string;
  /** Ordered list of phases on the path. */
  phases: readonly PathPhaseRef[];
  /**
   * Path build status. Drives the badge shown on cards and
   * controls whether the path is recommended for new learners.
   *
   * "complete" — every referenced phase is built end-to-end.
   * "scaffold" — referenced phases exist but content depth is mixed
   *   (e.g., Phase R/M are standards-heavy rather than code-heavy).
   * "preview" — one or more referenced phases don't exist yet; the
   *   path is a forward-looking promise, not a runnable curriculum.
   */
  status: PathStatus;
};

export const PATH_ARCHETYPES = [
  "Web",
  "Backend",
  "Systems",
  "AI/ML",
  "Robotics",
  "Manufacturing",
  "Embedded",
  "Leadership",
] as const;
export type PathArchetype = (typeof PATH_ARCHETYPES)[number];

export const PATH_STATUSES = ["complete", "scaffold", "preview"] as const;
export type PathStatus = (typeof PATH_STATUSES)[number];
