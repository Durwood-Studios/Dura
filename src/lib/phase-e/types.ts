/**
 * Phase E · Embedded / Firmware — feature-module types per FM-1.0.
 *
 * Phase E is DURA's code-teaching answer to the embedded / firmware
 * engineering archetype. Unlike Phase R + Phase M (which skew toward
 * standards literacy), Phase E lessons are code-first: each lesson
 * teaches you to write something that runs on hardware (or
 * simulator), with standards mentioned only where they're operationally
 * load-bearing (MISRA-C, DO-178C, IEC 62304 software class).
 *
 * Anchored to ARM Cortex-M as the dominant embedded target in 2026.
 * Rust on Cortex-M (embedded-hal, RTIC) lands alongside C as the
 * modern memory-safe option.
 */

export type PhaseELessonId =
  | "e-1-c-toolchain-arm-cortex-m"
  | "e-2-bare-metal-c"
  | "e-3-interrupts-and-dma"
  | "e-4-rtos-fundamentals"
  | "e-5-drivers"
  | "e-6-rust-cortex-m"
  | "e-7-misra-c-2023"
  | "e-8-capstone";

export interface PhaseELesson {
  id: PhaseELessonId;
  /** 1-indexed order in the phase. */
  order: number;
  title: string;
  /** Tagline shown in lesson lists. */
  description: string;
  estimatedMinutes: number;
  /**
   * The hardware (or simulator) target this lesson teaches code
   * against. Concrete target = code-teaching tilt.
   */
  target: PhaseETarget;
  /**
   * Standards referenced — kept minimal and only where load-bearing
   * (MISRA-C in lesson 7, DO-178C / IEC 62304 in capstone framing).
   * Phase E is explicitly NOT a standards-credential phase.
   */
  standards: readonly string[];
  /**
   * The languages the lesson teaches in. Most lessons are C, some
   * are Rust, some are both side-by-side.
   */
  languages: readonly PhaseELanguage[];
  /** Whether this lesson produces a /verify hash-anchorable artifact (typically the capstone). */
  hasVerifyArtifact: boolean;
}

export type PhaseETarget =
  | "qemu-cortex-m"
  | "stm32f4-discovery"
  | "nrf52840-dk"
  | "rp2040"
  | "any-cortex-m";

export type PhaseELanguage = "c" | "rust";

export interface PhaseEModule {
  slug: "e-embedded";
  title: "Phase E: Embedded / Firmware";
  tagline: string;
  description: string;
  /**
   * Phase E sits after Phase 5 (systems engineering — OS internals
   * + networking foundations) and parallels Phase R / Phase M as
   * a discipline phase.
   */
  slotsAfterPhase: "5";
  parallelTo: "r-robotics";
  lessons: readonly PhaseELesson[];
}
