/**
 * Phase H · Hardware Verification — feature-module types per FM-1.0.
 *
 * Eight code-first lessons covering SystemVerilog (IEEE 1800-2023) and
 * UVM (IEEE 1800.2-2020) testbench engineering — the dominant
 * methodology for semiconductor design verification (DV). Standards-
 * anchored: every lesson builds on the IEEE language and methodology
 * specs that rule the discipline.
 */

export type PhaseHLessonId =
  | "h-1-systemverilog-basics"
  | "h-2-uvm-testbench-architecture"
  | "h-3-constrained-random-stimulus"
  | "h-4-functional-coverage"
  | "h-5-uvm-sequences"
  | "h-6-formal-verification-sva"
  | "h-7-low-power-verification-upf"
  | "h-8-capstone-uart-uvm-tb";

export interface PhaseHLesson {
  id: PhaseHLessonId;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  /** Primary standard reference — IEEE 1800, IEEE 1800.2, IEEE 1801, etc. */
  standards: readonly string[];
  /** Simulator targets the lesson works against. */
  simulators: readonly string[];
  hasVerifyArtifact: boolean;
}

export interface PhaseHModule {
  slug: "h-hardware-verification";
  title: "Phase H: Hardware Verification";
  tagline: string;
  description: string;
  slotsAfterPhase: "5";
  parallelTo: "e-embedded";
  lessons: readonly PhaseHLesson[];
}
