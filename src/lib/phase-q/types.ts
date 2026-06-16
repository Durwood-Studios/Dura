/**
 * Phase Q · Quantitative / HFT Systems — feature-module types per FM-1.0.
 *
 * Eight code-first lessons for low-latency C++ systems work targeting
 * quant finance and HFT environments. Standards-anchored: ISO/IEC
 * 14882:2023 (C++23), IEEE 754-2019 (floating point), FIX Protocol,
 * and the Nasdaq ITCH / OUCH market-data protocol family.
 */

export type PhaseQLessonId =
  | "q-1-modern-cpp-for-hft"
  | "q-2-ieee-754-numerics"
  | "q-3-cache-aware-programming"
  | "q-4-lock-free-data-structures"
  | "q-5-kernel-bypass-networking"
  | "q-6-market-data-itch-ouch"
  | "q-7-fix-protocol-order-entry"
  | "q-8-capstone-order-book";

export interface PhaseQLesson {
  id: PhaseQLessonId;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  standards: readonly string[];
  hasVerifyArtifact: boolean;
}

export interface PhaseQModule {
  slug: "q-quant-hft";
  title: "Phase Q: Quantitative / HFT Systems";
  tagline: string;
  description: string;
  slotsAfterPhase: "5";
  parallelTo: "e-embedded";
  lessons: readonly PhaseQLesson[];
}
