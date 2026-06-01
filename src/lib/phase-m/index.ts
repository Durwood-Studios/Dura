/**
 * Phase M · Manufacturing — module registry per FM-1.0.
 *
 * The 12-lesson Phase M sequence from the bounded-research session. Each
 * lesson is anchored to its industry standards and the diagnostic catalog
 * misconceptions it surfaces. Source of truth for the phase shape;
 * rendering / progress / FSRS read from PHASE_M.
 */

import type { PhaseMLesson, PhaseMModule } from "./types";

const ISO_9001: PhaseMLesson["standards"][number] = {
  id: "ISO 9001:2015",
  title: "Quality management systems — Requirements",
  paywalled: true,
  approxCostUSD: 170,
};

const AS9100D: PhaseMLesson["standards"][number] = {
  id: "AS9100D",
  title: "Quality Management Systems — Requirements for Aviation, Space, and Defense Organizations",
  paywalled: true,
  approxCostUSD: 200,
};

const IATF_16949: PhaseMLesson["standards"][number] = {
  id: "IATF 16949:2016",
  title:
    "Quality management system requirements for automotive production and relevant service parts",
  paywalled: true,
  approxCostUSD: 130,
};

const IATF_CORE_TOOLS: PhaseMLesson["standards"][number] = {
  id: "IATF Core Tools (APQP/PPAP/FMEA/MSA/SPC)",
  title:
    "Automotive Industry Action Group (AIAG) Core Tools — Advanced Product Quality Planning, Production Part Approval Process, Failure Mode and Effects Analysis, Measurement System Analysis, Statistical Process Control",
  paywalled: true,
  approxCostUSD: 350,
};

const LEAN_TPS: PhaseMLesson["standards"][number] = {
  id: "Lean / TPS",
  title:
    "Toyota Production System / Lean Manufacturing — 7 wastes, 5S, SMED, Kaizen, A3, Jidoka, Heijunka, Kanban",
  paywalled: false,
  approxCostUSD: null,
};

const SIX_SIGMA: PhaseMLesson["standards"][number] = {
  id: "Six Sigma / DMAIC",
  title: "Six Sigma DMAIC framework — Define, Measure, Analyze, Improve, Control",
  paywalled: false,
  approxCostUSD: null,
};

const ASME_Y14_5: PhaseMLesson["standards"][number] = {
  id: "ASME Y14.5-2018",
  title: "Dimensioning and Tolerancing (Geometric Dimensioning and Tolerancing — GD&T)",
  paywalled: true,
  approxCostUSD: 330,
};

const ASME_Y14_41: PhaseMLesson["standards"][number] = {
  id: "ASME Y14.41-2019",
  title: "Digital Product Definition Data Practices (Model-Based Definition — MBD)",
  paywalled: true,
  approxCostUSD: 220,
};

const STEP_AP242: PhaseMLesson["standards"][number] = {
  id: "ISO 10303-242 (STEP AP242)",
  title: "Automotive design — Managed model based 3D engineering",
  paywalled: true,
  approxCostUSD: 250,
};

const IPC_A_610J: PhaseMLesson["standards"][number] = {
  id: "IPC-A-610J (March 2024)",
  title: "Acceptability of Electronic Assemblies — Class 1/2/3 visual workmanship criteria",
  paywalled: true,
  approxCostUSD: 330,
};

const IPC_7711_7721: PhaseMLesson["standards"][number] = {
  id: "IPC-7711/7721 Rev D (2024)",
  title: "Rework, Modification and Repair of Electronic Assemblies",
  paywalled: true,
  approxCostUSD: 280,
};

const ISA_95: PhaseMLesson["standards"][number] = {
  id: "ISA-95 / IEC 62264",
  title: "Enterprise-Control System Integration — five-level automation pyramid; L3↔L4 via B2MML",
  paywalled: true,
  approxCostUSD: 300,
};

const ISA_88: PhaseMLesson["standards"][number] = {
  id: "ISA-88 / IEC 61512",
  title: "Batch Control — physical model, procedural model, recipe model",
  paywalled: true,
  approxCostUSD: 250,
};

const MTCONNECT: PhaseMLesson["standards"][number] = {
  id: "MTConnect",
  title: "Open machine-tool data standard (XML / REST; OPC UA Companion Specification available)",
  paywalled: false,
  approxCostUSD: null,
};

const OPC_UA: PhaseMLesson["standards"][number] = {
  id: "OPC UA / IEC 62541",
  title:
    "Industrial automation interoperability — service-oriented, transport-agnostic, information-model-rich; base parts are free",
  paywalled: false,
  approxCostUSD: null,
};

const IEC_IEEE_60802: PhaseMLesson["standards"][number] = {
  id: "IEC/IEEE 60802",
  title:
    "Time-Sensitive Networking (TSN) Profile for Industrial Automation — joint IEC + IEEE 802.1 standard",
  paywalled: true,
  approxCostUSD: 200,
};

const IEC_62443: PhaseMLesson["standards"][number] = {
  id: "IEC 62443 series",
  title:
    "Industrial automation and control systems — Security; zones / conduits / Security Levels SL1-SL4",
  paywalled: true,
  approxCostUSD: 400,
};

const RAMI_4_0: PhaseMLesson["standards"][number] = {
  id: "RAMI 4.0 (DIN SPEC 91345)",
  title:
    "Reference Architectural Model Industry 4.0 — 3-axis cube (hierarchy, lifecycle, architecture layers)",
  paywalled: false,
  approxCostUSD: null,
};

const IIRA: PhaseMLesson["standards"][number] = {
  id: "IIRA v1.10 (Industry IoT Consortium)",
  title:
    "Industrial Internet Reference Architecture — viewpoints-based (business, usage, functional, implementation)",
  paywalled: false,
  approxCostUSD: null,
};

const LESSONS: readonly PhaseMLesson[] = [
  {
    id: "m-1-iso-9001-baseline",
    order: 1,
    title: "ISO 9001 Baseline",
    description:
      "The universal Quality Management System standard. ISO 9001:2015's seven QM principles (customer focus, leadership, engagement, process approach, improvement, evidence-based decisions, relationships) underlie every supplier audit. ISO 9001 certifies the company's ISMS process — not individual products.",
    estimatedMinutes: 45,
    standards: [ISO_9001],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
  {
    id: "m-2-as9100-iatf-supersets",
    order: 2,
    title: "Industry Supersets: AS9100 + IATF 16949",
    description:
      "Aerospace (AS9100D) and automotive (IATF 16949) extend ISO 9001 with sector-specific requirements: AS9100 adds configuration management, counterfeit-parts control, risk management at every level; IATF 16949 adds the Core Tools (APQP, PPAP, FMEA, MSA, SPC).",
    estimatedMinutes: 50,
    standards: [AS9100D, IATF_16949, ISO_9001],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
  {
    id: "m-3-iatf-core-tools",
    order: 3,
    title: "IATF Core Tools",
    description:
      "Five Core Tools required for IATF 16949 certification audits: APQP (Advanced Product Quality Planning), PPAP (Production Part Approval Process), FMEA (Failure Mode and Effects Analysis), MSA (Measurement System Analysis), SPC (Statistical Process Control). Miscounting them in an audit is a finding.",
    estimatedMinutes: 90,
    standards: [IATF_CORE_TOOLS, IATF_16949],
    misconceptions: ["iatf-core-tools-count"],
    hasVerifyArtifact: true,
  },
  {
    id: "m-4-lean-tps",
    order: 4,
    title: "Lean / Toyota Production System",
    description:
      "Two pillars: Just-In-Time + Jidoka. PDCA underneath. Practitioner tools: 5S, Andon, SMED, Kaizen, A3, Heijunka, Kanban. A single-lesson tools sampler is weak — a PDCA-anchored A3 lesson plus a 5S-or-SMED hands-on is the minimum that produces fluency.",
    estimatedMinutes: 75,
    standards: [LEAN_TPS],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
  {
    id: "m-5-six-sigma-dmaic",
    order: 5,
    title: "Six Sigma DMAIC",
    description:
      "Define-Measure-Analyze-Improve-Control. Sequential phases with gate reviews; skipping ahead produces 'Improve' interventions that solve the wrong problem because Measure never validated the metric.",
    estimatedMinutes: 90,
    standards: [SIX_SIGMA],
    misconceptions: ["dmaic-as-iterative"],
    hasVerifyArtifact: true,
  },
  {
    id: "m-6-asme-y14-5-gdt",
    order: 6,
    title: "ASME Y14.5 GD&T + Tolerance Stack-Up",
    description:
      "Geometric Dimensioning and Tolerancing as a MODEL — datum reference frames, Rule #1 (envelope principle), MMC/LMC modifiers, virtual conditions. Tolerance stack-up under GD&T is different math than +/- tolerancing. Stack-up output is a hash-anchorable /verify artifact.",
    estimatedMinutes: 120,
    standards: [ASME_Y14_5],
    misconceptions: ["gdt-as-tolerance-notation"],
    hasVerifyArtifact: true,
  },
  {
    id: "m-7-asme-y14-41-mbd",
    order: 7,
    title: "ASME Y14.41 Model-Based Definition",
    description:
      "Annotated 3D CAD model as the authoritative product-definition document (vs 2D drawings). Leverages STEP (ISO 10303-242) for interop. The Y14.5 → Y14.41 arc is the drawing-based → model-based GD&T transition modern manufacturing engineers must own.",
    estimatedMinutes: 60,
    standards: [ASME_Y14_41, STEP_AP242, ASME_Y14_5],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
  {
    id: "m-8-ipc-a-610-classes",
    order: 8,
    title: "IPC-A-610J Acceptability + Class Framework",
    description:
      "Visual workmanship criteria for PCBAs across three classes: Class 1 (consumer), Class 2 (commercial/industrial — most common), Class 3 (high-reliability — aerospace/medical/defense). The three-class framework recurs across IPC standards.",
    estimatedMinutes: 60,
    standards: [IPC_A_610J],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
  {
    id: "m-9-ipc-7711-rework",
    order: 9,
    title: "IPC-7711/7721 Rework",
    description:
      "Procedural standard for rework, modification, and repair of electronic assemblies. Inherits IPC-A-610's three-class framework. A-610 = 'is this acceptable?'; 7711/7721 = 'how do I make it acceptable?' Taught back-to-back.",
    estimatedMinutes: 60,
    standards: [IPC_7711_7721, IPC_A_610J],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
  {
    id: "m-10-isa-95-isa-88",
    order: 10,
    title: "ISA-95 Pyramid + ISA-88 Batch",
    description:
      "ISA-95 / IEC 62264 five-level pyramid (L0 process → L1 sensing/PLC → L2 SCADA → L3 MES → L4 ERP) is the canonical mental model for factory IT. The model is a CONTROL HIERARCHY with information-flow obligations, not a network diagram. ISA-88 adds batch-process structure (physical, procedural, recipe models).",
    estimatedMinutes: 75,
    standards: [ISA_95, ISA_88],
    misconceptions: ["isa95-as-network-diagram", "oee-as-fixed-formula"],
    hasVerifyArtifact: false,
  },
  {
    id: "m-11-mtconnect-opcua-tsn",
    order: 11,
    title: "MTConnect + OPC UA + IEC/IEEE 60802 TSN",
    description:
      "Open data plane for industrial automation. MTConnect (XML, royalty-free) for machine-tool data. OPC UA for broader interop. The official OPC UA Companion Specification for MTConnect is the modern integration path. IEC/IEEE 60802 is the joint TSN profile for industrial automation — corrects the IEEE 2050 misattribution in older curricula.",
    estimatedMinutes: 90,
    standards: [MTCONNECT, OPC_UA, IEC_IEEE_60802],
    misconceptions: ["mtconnect-opcua-rivals"],
    hasVerifyArtifact: true,
  },
  {
    id: "m-12-iec-62443-rami-iira",
    order: 12,
    title: "IEC 62443 + RAMI 4.0 + IIRA",
    description:
      "OT cybersecurity via IEC 62443's zones, conduits, and Security Levels (SL1-SL4). Plus architectural literacy: RAMI 4.0 (German Industry 4.0) and IIRA (US Industrial Internet Consortium). Engineers need both vocabularies to be legible to EU and US supply chains.",
    estimatedMinutes: 75,
    standards: [IEC_62443, RAMI_4_0, IIRA],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
] as const;

export const PHASE_M: PhaseMModule = {
  slug: "m-manufacturing",
  title: "Phase M: Manufacturing",
  tagline: "Build a manufacturing engineer hiring managers actually test.",
  description:
    "Twelve lessons anchored to ISO 9001, AS9100, IATF 16949 + Core Tools, ASME Y14.5/Y14.41 GD&T + MBD, ISA-95/88, MTConnect + OPC UA + TSN, IEC 62443, and the Lean / Six Sigma operational philosophy. Five hash-anchorable /verify artifacts: PPAP package, DMAIC project, GD&T tolerance stack-up, OEE computation against ISO 22400, MTConnect→OPC UA bridge sandbox.",
  prereqsThroughPhase: "5",
  parallelTo: "r-robotics",
  lessons: LESSONS,
};

export function getPhaseMLesson(id: string): PhaseMLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function phaseMStandardsCostUSD(): number {
  const ids = new Set<string>();
  let total = 0;
  for (const lesson of LESSONS) {
    for (const standard of lesson.standards) {
      if (standard.paywalled && standard.approxCostUSD !== null && !ids.has(standard.id)) {
        ids.add(standard.id);
        total += standard.approxCostUSD;
      }
    }
  }
  return total;
}
