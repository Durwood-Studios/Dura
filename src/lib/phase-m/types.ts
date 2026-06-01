/**
 * Phase M · Manufacturing — feature-module types per FM-1.0.
 *
 * Phase M is the named-ask manufacturing curriculum from the 2026-06-01
 * bounded-research session. Twelve lessons anchored to ISO 9001 + the
 * aerospace / automotive supersets + the IATF Core Tools + ASME Y14.5 GD&T
 * + ASME Y14.41 MBD + ISA-95 / ISA-88 + MTConnect / OPC UA + IEC 62443 +
 * Lean / Six Sigma + RAMI 4.0 / IIRA. Each lesson maps to a diagnostic
 * misconception in src/lib/diagnostic/misconceptions.ts.
 */

export type PhaseMLessonId =
  | "m-1-iso-9001-baseline"
  | "m-2-as9100-iatf-supersets"
  | "m-3-iatf-core-tools"
  | "m-4-lean-tps"
  | "m-5-six-sigma-dmaic"
  | "m-6-asme-y14-5-gdt"
  | "m-7-asme-y14-41-mbd"
  | "m-8-ipc-a-610-classes"
  | "m-9-ipc-7711-rework"
  | "m-10-isa-95-isa-88"
  | "m-11-mtconnect-opcua-tsn"
  | "m-12-iec-62443-rami-iira";

export interface StandardAnchor {
  /** Standard identifier as cited in industry — e.g. "ISO 9001:2015". */
  id: string;
  title: string;
  /** Whether DURA's organization needs an owned copy for content fidelity. */
  paywalled: boolean;
  /** Cost in USD (approximate) when paywalled — null otherwise. */
  approxCostUSD: number | null;
}

export interface PhaseMLesson {
  id: PhaseMLessonId;
  /** 1-indexed order in the phase. */
  order: number;
  title: string;
  /** Tagline shown in lesson lists. */
  description: string;
  estimatedMinutes: number;
  /** Anchoring standards. First entry is the primary anchor. */
  standards: readonly StandardAnchor[];
  /** Diagnostic misconception IDs this lesson surfaces or remediates. */
  misconceptions: readonly string[];
  /** Whether this lesson produces a /verify hash-anchorable artifact. */
  hasVerifyArtifact: boolean;
}

export interface PhaseMModule {
  slug: "m-manufacturing";
  title: "Phase M: Manufacturing";
  tagline: string;
  description: string;
  /** Phase M is viable for non-CS-degreed learners; prereqs through Phase 5
   *  only (systems thinking + stats + networking + security fundamentals). */
  prereqsThroughPhase: "5";
  /** Phase M sits parallel to Phase R; both are post-Phase-5 specializations. */
  parallelTo: "r-robotics";
  lessons: readonly PhaseMLesson[];
}
