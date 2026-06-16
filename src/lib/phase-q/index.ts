/**
 * Phase Q · Quantitative / HFT Systems — module registry per FM-1.0.
 *
 * Eight code-teaching lessons from modern C++ literacy to a working
 * microsecond-latency order book. Standards-anchored throughout.
 */

import type { PhaseQLesson, PhaseQModule } from "./types";

const LESSONS: readonly PhaseQLesson[] = [
  {
    id: "q-1-modern-cpp-for-hft",
    order: 1,
    title: "Modern C++ for HFT — Move Semantics, Templates, constexpr",
    description:
      "ISO/IEC 14882:2023 (C++23) features that matter for low-latency: move semantics, perfect forwarding, constexpr, concepts, std::span. The deliberate subset HFT teams write in.",
    estimatedMinutes: 120,
    standards: ["ISO/IEC 14882:2023 (C++23)"],
    hasVerifyArtifact: false,
  },
  {
    id: "q-2-ieee-754-numerics",
    order: 2,
    title: "IEEE 754 Numerics — Fast Math, Denormals, Determinism",
    description:
      "IEEE 754-2019 binary64 in operational terms. Why -ffast-math changes results, denormal-flush, fused multiply-add, deterministic-FP for risk systems.",
    estimatedMinutes: 90,
    standards: ["IEEE 754-2019"],
    hasVerifyArtifact: false,
  },
  {
    id: "q-3-cache-aware-programming",
    order: 3,
    title: "Cache-Aware Programming and False Sharing",
    description:
      "x86-64 cache hierarchy, line size (64B), prefetch hints, false sharing between threads. Memory-layout decisions that change latency by 10x.",
    estimatedMinutes: 90,
    standards: ["ISO/IEC 14882:2023 (C++23)"],
    hasVerifyArtifact: false,
  },
  {
    id: "q-4-lock-free-data-structures",
    order: 4,
    title: "Lock-Free Data Structures",
    description:
      "std::atomic, memory ordering (acquire/release/relaxed/seq_cst), SPSC ring buffers, the ABA problem, the C++ memory model.",
    estimatedMinutes: 120,
    standards: ["ISO/IEC 14882:2023 (C++23)"],
    hasVerifyArtifact: false,
  },
  {
    id: "q-5-kernel-bypass-networking",
    order: 5,
    title: "Kernel-Bypass Networking — DPDK and io_uring",
    description:
      "Why the Linux kernel network stack is too slow for HFT, how DPDK polls NIC rings directly, modern alternatives (io_uring, AF_XDP) for less extreme latency budgets.",
    estimatedMinutes: 90,
    standards: ["DPDK Programmer's Guide"],
    hasVerifyArtifact: false,
  },
  {
    id: "q-6-market-data-itch-ouch",
    order: 6,
    title: "Market Data Protocols — ITCH and OUCH",
    description:
      "Nasdaq ITCH (market data) and OUCH (order entry) binary protocols. Message types, sequence numbers, the SoupBinTCP framing layer.",
    estimatedMinutes: 90,
    standards: ["Nasdaq TotalView-ITCH 5.0", "Nasdaq OUCH 5.0"],
    hasVerifyArtifact: false,
  },
  {
    id: "q-7-fix-protocol-order-entry",
    order: 7,
    title: "FIX Protocol — Order Entry",
    description:
      "Financial Information eXchange (FIX 5.0 SP2) protocol — the de facto order-entry standard outside HFT-binary venues. Message types, FIXP transport, FAST encoding.",
    estimatedMinutes: 75,
    standards: ["FIX 5.0 SP2"],
    hasVerifyArtifact: false,
  },
  {
    id: "q-8-capstone-order-book",
    order: 8,
    title: "Capstone — Microsecond-Latency Order Book",
    description:
      "Build a working in-memory order book that consumes ITCH market data, maintains a price-level book, computes mid/spread, and writes events to a lock-free queue. Latency-profiled and hash-anchored.",
    estimatedMinutes: 180,
    standards: ["ISO/IEC 14882:2023 (C++23)"],
    hasVerifyArtifact: true,
  },
] as const;

export const PHASE_Q: PhaseQModule = {
  slug: "q-quant-hft",
  title: "Phase Q: Quantitative / HFT Systems",
  tagline: "Build microsecond-latency C++ for quant trading.",
  description:
    "Eight code-teaching lessons that move you from modern-C++ literacy to a working order book. ISO C++23, IEEE 754-2019, FIX, and the Nasdaq ITCH/OUCH protocol family anchored throughout. Targets x86-64 Linux as the canonical HFT platform.",
  slotsAfterPhase: "5",
  parallelTo: "e-embedded",
  lessons: LESSONS,
};

export function getPhaseQLesson(id: string): PhaseQLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
