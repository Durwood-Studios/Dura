/**
 * Phase R · Robotics — feature-module types per FM-1.0.
 *
 * Phase R is the named-ask robotics curriculum from the 2026-06-01 bounded-
 * research session. Eight lessons anchored to ISO 10218:2025 (which absorbed
 * ISO/TS 15066 in January 2025) + the surrounding functional-safety,
 * collaborative-robotics, and ROS-Industrial standards. Each lesson maps to
 * a diagnostic misconception in src/lib/diagnostic/misconceptions.ts so the
 * FSRS review queue surfaces the right card when a learner stumbles.
 */

export type PhaseRLessonId =
  | "r-0-iso-8373-vocabulary"
  | "r-1-iso-12100-risk"
  | "r-2-functional-safety"
  | "r-3-collaborative-modes"
  | "r-4-pfl-testing"
  | "r-5-ros-industrial"
  | "r-6-cybersecurity"
  | "r-7-capstone";

export interface StandardAnchor {
  /** Standard identifier as cited in industry — e.g. "ISO 10218-1:2025". */
  id: string;
  /** Short human-readable title. */
  title: string;
  /** Whether DURA's organization needs an owned copy for content fidelity. */
  paywalled: boolean;
  /** Cost in USD (approximate) when paywalled — null otherwise. */
  approxCostUSD: number | null;
}

export interface PhaseRLesson {
  id: PhaseRLessonId;
  /** 1-indexed order in the phase. */
  order: number;
  title: string;
  /** Tagline shown in lesson lists. */
  description: string;
  estimatedMinutes: number;
  /** Standards this lesson anchors to. The first entry is the primary anchor. */
  standards: readonly StandardAnchor[];
  /** Diagnostic misconception IDs (matching src/lib/diagnostic/misconceptions.ts)
   *  that this lesson surfaces or remediates. */
  misconceptions: readonly string[];
  /** Whether this lesson produces a /verify hash-anchorable artifact. */
  hasVerifyArtifact: boolean;
}

export interface PhaseRModule {
  slug: "r-robotics";
  title: "Phase R: Robotics";
  tagline: string;
  description: string;
  /** Slot position relative to existing Phase 0-9. Phase R sits between Phase
   *  5 (systems engineering — RTOS/embedded foundations) and Phase 8
   *  (cryptography — the 2025 IEC 62443 hook for robot cybersecurity). */
  slotsAfterPhase: "5";
  slotsBeforePhase: "8";
  lessons: readonly PhaseRLesson[];
}
