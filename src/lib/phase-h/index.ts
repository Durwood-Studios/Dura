/**
 * Phase H · Hardware Verification — module registry per FM-1.0.
 *
 * Eight code-teaching lessons that move a learner from "I've heard of
 * SystemVerilog" to "I can stand up a UVM testbench for a real IP
 * block." Anchored to IEEE 1800-2023 (SystemVerilog), IEEE 1800.2-2020
 * (UVM), IEEE 1850-2010 (PSL), and IEEE 1801 (UPF).
 */

import type { PhaseHLesson, PhaseHModule } from "./types";

const LESSONS: readonly PhaseHLesson[] = [
  {
    id: "h-1-systemverilog-basics",
    order: 1,
    title: "SystemVerilog Basics for Verification",
    description:
      "IEEE 1800-2023 in operational terms. Data types beyond Verilog, interfaces, modports, classes, the synthesis-vs-verification subset distinction.",
    estimatedMinutes: 90,
    standards: ["IEEE 1800-2023 (SystemVerilog)"],
    simulators: ["verilator", "questa", "vcs", "xcelium"],
    hasVerifyArtifact: false,
  },
  {
    id: "h-2-uvm-testbench-architecture",
    order: 2,
    title: "UVM Testbench Architecture",
    description:
      "Driver, Monitor, Sequencer, Agent, Scoreboard, Env, Test. IEEE 1800.2-2020 testbench structure. Why each piece exists and what it owns.",
    estimatedMinutes: 120,
    standards: ["IEEE 1800.2-2020 (UVM)"],
    simulators: ["questa", "vcs", "xcelium"],
    hasVerifyArtifact: false,
  },
  {
    id: "h-3-constrained-random-stimulus",
    order: 3,
    title: "Constrained-Random Stimulus",
    description:
      "Randomization, constraint blocks, randc, soft constraints, in-order vs out-of-order solving. The most productive verification methodology in modern semiconductor work.",
    estimatedMinutes: 90,
    standards: ["IEEE 1800-2023 (SystemVerilog)"],
    simulators: ["questa", "vcs", "xcelium"],
    hasVerifyArtifact: false,
  },
  {
    id: "h-4-functional-coverage",
    order: 4,
    title: "Functional Coverage — Coverpoints, Bins, Cross",
    description:
      "Covergroups, coverpoints, bins, cross coverage. The coverage-closure model: random stimulus + coverage tells you when you've verified enough.",
    estimatedMinutes: 90,
    standards: ["IEEE 1800-2023 (SystemVerilog)"],
    simulators: ["questa", "vcs", "xcelium"],
    hasVerifyArtifact: false,
  },
  {
    id: "h-5-uvm-sequences",
    order: 5,
    title: "UVM Sequences and Virtual Sequences",
    description:
      "Sequence library, sequence items, layered sequences, virtual sequences coordinating multiple agents. The reusability-and-composability story for stimulus.",
    estimatedMinutes: 90,
    standards: ["IEEE 1800.2-2020 (UVM)"],
    simulators: ["questa", "vcs", "xcelium"],
    hasVerifyArtifact: false,
  },
  {
    id: "h-6-formal-verification-sva",
    order: 6,
    title: "Formal Verification — SVA Assertions and Property Checking",
    description:
      "SystemVerilog Assertions (SVA) syntax, formal-vs-simulation, when formal beats simulation, when it doesn't. Anchored to IEEE 1800-2023 SVA section.",
    estimatedMinutes: 90,
    standards: ["IEEE 1800-2023 (SystemVerilog)"],
    simulators: ["jaspergold", "questa-formal", "vc-formal"],
    hasVerifyArtifact: false,
  },
  {
    id: "h-7-low-power-verification-upf",
    order: 7,
    title: "Low-Power Verification with UPF",
    description:
      "IEEE 1801 Unified Power Format. Power domains, isolation cells, retention, power-aware simulation. The DV layer over the power-intent specification.",
    estimatedMinutes: 75,
    standards: ["IEEE 1801-2018 (UPF)"],
    simulators: ["questa-power", "vcs-power", "xcelium-power"],
    hasVerifyArtifact: false,
  },
  {
    id: "h-8-capstone-uart-uvm-tb",
    order: 8,
    title: "Capstone — UVM Testbench for a UART IP Block",
    description:
      "End-to-end UVM testbench: SV interface, driver, monitor, scoreboard, sequence library, coverage model, plus one SVA assertion. Targets free Verilator or any commercial sim. Hash-anchored via /verify.",
    estimatedMinutes: 180,
    standards: ["IEEE 1800.2-2020 (UVM)"],
    simulators: ["verilator", "questa", "vcs", "xcelium"],
    hasVerifyArtifact: true,
  },
] as const;

export const PHASE_H: PhaseHModule = {
  slug: "h-hardware-verification",
  title: "Phase H: Hardware Verification",
  tagline: "Stand up a UVM testbench for any IP block.",
  description:
    "Eight code-teaching lessons that move you from SystemVerilog literacy to a complete UVM testbench. IEEE 1800-2023 + IEEE 1800.2-2020 anchored throughout. Verilator works for the early lessons; commercial simulators (Questa, VCS, Xcelium) for the full UVM flow.",
  slotsAfterPhase: "5",
  parallelTo: "e-embedded",
  lessons: LESSONS,
};

export function getPhaseHLesson(id: string): PhaseHLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
