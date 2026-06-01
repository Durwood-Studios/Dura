/**
 * Phase R · Robotics — module registry per FM-1.0.
 *
 * The 8-lesson Phase R sequence from the bounded-research session, with each
 * lesson explicitly tied to its anchoring industry standards and the
 * diagnostic misconceptions it surfaces. This file is the source of truth
 * for the phase shape; rendering / progress / FSRS integration all read
 * from PHASE_R.
 */

import type { PhaseRLesson, PhaseRModule } from "./types";

const ISO_8373: PhaseRLesson["standards"][number] = {
  id: "ISO 8373:2021",
  title: "Robotics — Vocabulary",
  paywalled: true,
  approxCostUSD: 200,
};

const ISO_12100: PhaseRLesson["standards"][number] = {
  id: "ISO 12100:2010",
  title: "Safety of machinery — General principles for design (risk assessment & risk reduction)",
  paywalled: true,
  approxCostUSD: 230,
};

const ISO_10218_1_2025: PhaseRLesson["standards"][number] = {
  id: "ISO 10218-1:2025",
  title: "Robotics — Safety requirements for robot systems in industrial environments (Part 1)",
  paywalled: true,
  approxCostUSD: 300,
};

const ISO_10218_2_2025: PhaseRLesson["standards"][number] = {
  id: "ISO 10218-2:2025",
  title: "Robotics — Safety requirements for robot systems in industrial environments (Part 2)",
  paywalled: true,
  approxCostUSD: 300,
};

const ANSI_RIA_R15_06_2025: PhaseRLesson["standards"][number] = {
  id: "ANSI/A3 R15.06-2025",
  title: "Industrial robots and robot systems — Safety requirements (US national adoption)",
  paywalled: true,
  approxCostUSD: 655,
};

const RIA_TR_R15_806: PhaseRLesson["standards"][number] = {
  id: "RIA TR R15.806-2018",
  title:
    "Industrial Robots and Robot Systems — Safety Requirements — Testing Methods for Power & Force Limited Collaborative Applications",
  paywalled: true,
  approxCostUSD: 200,
};

const ISO_13849: PhaseRLesson["standards"][number] = {
  id: "ISO 13849-1:2023",
  title: "Safety of machinery — Safety-related parts of control systems (Performance Levels)",
  paywalled: true,
  approxCostUSD: 200,
};

const IEC_62061: PhaseRLesson["standards"][number] = {
  id: "IEC 62061:2021",
  title:
    "Safety of machinery — Functional safety of safety-related control systems (Safety Integrity Levels)",
  paywalled: true,
  approxCostUSD: 200,
};

const IEC_61508: PhaseRLesson["standards"][number] = {
  id: "IEC 61508 series",
  title:
    "Functional safety of electrical/electronic/programmable electronic safety-related systems",
  paywalled: true,
  approxCostUSD: 1500,
};

const ROS_INDUSTRIAL: PhaseRLesson["standards"][number] = {
  id: "ROS-Industrial",
  title: "ROS-Industrial public training curriculum (Southwest Research Institute / ARM Institute)",
  paywalled: false,
  approxCostUSD: null,
};

const IEC_62443: PhaseRLesson["standards"][number] = {
  id: "IEC 62443 series",
  title: "Industrial automation and control systems — Security",
  paywalled: true,
  approxCostUSD: 400,
};

const LESSONS: readonly PhaseRLesson[] = [
  {
    id: "r-1-iso-8373-vocabulary",
    order: 1,
    title: "ISO 8373 Vocabulary",
    description:
      "The canonical robotics glossary. Without this lesson every downstream module drifts on terms like manipulator, end-effector, pose, workspace, and collaborative operation.",
    estimatedMinutes: 25,
    standards: [ISO_8373],
    misconceptions: [],
    hasVerifyArtifact: false,
  },
  {
    id: "r-2-iso-12100-risk",
    order: 2,
    title: "ISO 12100 Risk Assessment",
    description:
      "The four-step risk-assessment process every machinery-safety standard inherits. Determination of limits, hazard identification, risk estimation, risk evaluation — folk-counts that add 'risk reduction' or 'residual review' as steps are wrong.",
    estimatedMinutes: 45,
    standards: [ISO_12100],
    misconceptions: ["risk-assessment-step-count"],
    hasVerifyArtifact: false,
  },
  {
    id: "r-3-functional-safety",
    order: 3,
    title: "Functional Safety: PL ↔ SIL",
    description:
      "IEC 61508 as parent. ISO 13849's Performance Levels (a–e) and IEC 62061's Safety Integrity Levels (1–3) derive from it but use different architectural choices. PL ↔ SIL is probabilistic and approximate, not a lookup table.",
    estimatedMinutes: 60,
    standards: [IEC_61508, ISO_13849, IEC_62061],
    misconceptions: ["pl-sil-conflation"],
    hasVerifyArtifact: false,
  },
  {
    id: "r-4-collaborative-modes",
    order: 4,
    title: "The Four Collaborative Modes",
    description:
      "ISO 10218-1:2025 absorbed ISO/TS 15066 in January 2025. The four modes — Safety-rated Monitored Stop, Hand Guiding, Speed and Separation Monitoring, Power and Force Limiting — have distinct sensor, control-system, and risk-assessment implications.",
    estimatedMinutes: 50,
    standards: [ISO_10218_1_2025, ANSI_RIA_R15_06_2025],
    misconceptions: ["collaborative-modes-conflation"],
    hasVerifyArtifact: false,
  },
  {
    id: "r-5-pfl-testing",
    order: 5,
    title: "PFL Testing: RIA TR R15.806",
    description:
      "Application-level safety validation for power-and-force-limiting cobots. PFL-certified robot ≠ PFL-validated application — contact forces must be measured against the body-region limits using the documented test methodology.",
    estimatedMinutes: 60,
    standards: [RIA_TR_R15_806, ISO_10218_1_2025],
    misconceptions: ["cobot-safe-out-of-box"],
    hasVerifyArtifact: true,
  },
  {
    id: "r-6-ros-industrial",
    order: 6,
    title: "ROS 2 + ROS-Industrial",
    description:
      "Hands-on against URsim (the free Universal Robots simulator) following the ROS-Industrial public curriculum. No vendor-issued ROS 2 certification exists — frame portfolio milestones against Open Robotics Skill Certification Courses + Apex.Grace for safety-certified production.",
    estimatedMinutes: 90,
    standards: [ROS_INDUSTRIAL],
    misconceptions: ["ros2-vendor-cert"],
    hasVerifyArtifact: true,
  },
  {
    id: "r-7-cybersecurity",
    order: 7,
    title: "Robot Cybersecurity: 10218 × 62443",
    description:
      "ISO 10218-1:2025 added cybersecurity requirements that reference IEC 62443 for the OT-security baseline and add robot-specific overlay: secure boot, signed firmware updates, network segmentation for the safety controller, teach-pendant authentication.",
    estimatedMinutes: 50,
    standards: [ISO_10218_1_2025, IEC_62443],
    misconceptions: ["iec62443-vs-iso10218-cyber"],
    hasVerifyArtifact: false,
  },
  {
    id: "r-8-capstone",
    order: 8,
    title: "Capstone: R15.06-2025 Risk-Assessment Package",
    description:
      "Produce a complete R15.06-2025 risk-assessment package for a simulated cell: 10218-2 hazard identification, 13849 safety-function design, 15066 force/pressure budget against Annex A body-region limits. Hash-anchored via /verify.",
    estimatedMinutes: 180,
    standards: [ANSI_RIA_R15_06_2025, ISO_10218_2_2025, ISO_13849],
    misconceptions: ["risk-assessment-step-count", "cobot-safe-out-of-box", "pl-sil-conflation"],
    hasVerifyArtifact: true,
  },
] as const;

export const PHASE_R: PhaseRModule = {
  slug: "r-robotics",
  title: "Phase R: Robotics",
  tagline: "Build robots that pass real safety reviews.",
  description:
    "Eight lessons anchored to the 2025 unified ISO 10218 family + the functional-safety triad + ROS-Industrial. Capstone hash-anchors a complete R15.06-2025 risk-assessment package as a /verify artifact a hiring manager can audit.",
  slotsAfterPhase: "5",
  slotsBeforePhase: "8",
  lessons: LESSONS,
};

/** Lookup helper for the path router. */
export function getPhaseRLesson(id: string): PhaseRLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** Total owned-copy standards cost for the phase. Used by the standards-watch
 *  dashboard + the curriculum-budget audit. */
export function phaseRStandardsCostUSD(): number {
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
