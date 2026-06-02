/**
 * Phase E · Embedded / Firmware — module registry per FM-1.0.
 *
 * Eight code-teaching lessons that move a learner from "I know C" to
 * "I can ship production firmware against an ARM Cortex-M target."
 * Lessons 1-5 are C-only; lesson 6 is Rust on Cortex-M; lesson 7 is
 * MISRA-C:2023 in a code-teaching mode (what the rules look like in
 * the source); lesson 8 is a capstone application.
 *
 * Phase E is the first code-heavy discipline phase. Compared to
 * Phase R / Phase M (standards-literacy biased), every Phase E
 * lesson has the learner writing or reading real code against a
 * concrete target.
 */

import type { PhaseELesson, PhaseEModule } from "./types";

const LESSONS: readonly PhaseELesson[] = [
  {
    id: "e-1-c-toolchain-arm-cortex-m",
    order: 1,
    title: "C Toolchain for ARM Cortex-M",
    description:
      "GCC arm-none-eabi, linker scripts, startup code, and the build flow that produces a bin or hex you can flash. Demystifies the steps every embedded project assumes you can do without thinking about them.",
    estimatedMinutes: 90,
    target: "qemu-cortex-m",
    standards: [],
    languages: ["c"],
    hasVerifyArtifact: false,
  },
  {
    id: "e-2-bare-metal-c",
    order: 2,
    title: "Bare-Metal C — Registers, Peripherals, the Boot Sequence",
    description:
      "Memory-mapped I/O, volatile, the vector table, and the journey from reset vector to main(). The first time most engineers truly understand what 'bare metal' means.",
    estimatedMinutes: 90,
    target: "stm32f4-discovery",
    standards: [],
    languages: ["c"],
    hasVerifyArtifact: false,
  },
  {
    id: "e-3-interrupts-and-dma",
    order: 3,
    title: "Interrupts and DMA",
    description:
      "ISRs without the pitfalls (volatile, atomicity, priority, latency budgets) plus DMA-driven peripheral transfers. The hardware-software contract at the interrupt boundary.",
    estimatedMinutes: 90,
    target: "stm32f4-discovery",
    standards: [],
    languages: ["c"],
    hasVerifyArtifact: false,
  },
  {
    id: "e-4-rtos-fundamentals",
    order: 4,
    title: "RTOS Fundamentals — Tasks, Queues, Priority Inversion",
    description:
      "FreeRTOS / Zephyr as the canonical references. Tasks, schedulers, queues, mutexes, semaphores, and the priority-inversion failure mode that bit the Mars Pathfinder.",
    estimatedMinutes: 120,
    target: "any-cortex-m",
    standards: [],
    languages: ["c"],
    hasVerifyArtifact: false,
  },
  {
    id: "e-5-drivers",
    order: 5,
    title: "Drivers — UART, SPI, I2C, ADC",
    description:
      "The four buses every embedded engineer writes code against. Polled, interrupt-driven, and DMA-driven implementations side-by-side, with the choice criteria documented.",
    estimatedMinutes: 120,
    target: "stm32f4-discovery",
    standards: [],
    languages: ["c"],
    hasVerifyArtifact: false,
  },
  {
    id: "e-6-rust-cortex-m",
    order: 6,
    title: "Rust on Cortex-M — embedded-hal + RTIC",
    description:
      "Rust's embedded-hal trait ecosystem and RTIC's task model. The memory-safety argument made concrete by porting one of the earlier lessons' C driver to Rust.",
    estimatedMinutes: 120,
    target: "stm32f4-discovery",
    standards: [],
    languages: ["rust"],
    hasVerifyArtifact: false,
  },
  {
    id: "e-7-misra-c-2023",
    order: 7,
    title: "MISRA-C:2023 — When Style Is a Safety Requirement",
    description:
      "Not a rules-list reader. The MISRA-C rules in action — why specific rules exist, what bugs they prevent, and how the deviation-policy mechanism handles the few cases where they can't be followed. Practical, not bureaucratic.",
    estimatedMinutes: 75,
    target: "stm32f4-discovery",
    standards: ["MISRA-C:2023"],
    languages: ["c"],
    hasVerifyArtifact: false,
  },
  {
    id: "e-8-capstone",
    order: 8,
    title: "Capstone — A Real-Time Sensor Pipeline",
    description:
      "Build a real-time sensor-acquisition pipeline on STM32F4: ADC + DMA + RTOS task + UART telemetry. End-to-end firmware that compiles, flashes, and runs. Hash-anchored via /verify with source + binary + scope diagram.",
    estimatedMinutes: 180,
    target: "stm32f4-discovery",
    standards: [],
    languages: ["c"],
    hasVerifyArtifact: true,
  },
] as const;

export const PHASE_E: PhaseEModule = {
  slug: "e-embedded",
  title: "Phase E: Embedded / Firmware",
  tagline: "Ship production firmware against ARM Cortex-M.",
  description:
    "Eight code-teaching lessons that move you from C-literacy to a working real-time sensor pipeline on STM32. C and Rust on bare metal, RTOS fundamentals, drivers for the four canonical buses, MISRA-C:2023 in practice, and a capstone that exercises all of it. Code-first — standards appear only where they're load-bearing.",
  slotsAfterPhase: "5",
  parallelTo: "r-robotics",
  lessons: LESSONS,
};

/** Lookup helper for the path router. */
export function getPhaseELesson(id: string): PhaseELesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
