/**
 * Education standards alignment reference.
 * Maps DURA phases and modules to K-12, college, and professional standards.
 *
 * Standards covered:
 * - CSTA K-12 CS Standards (2017, updated 2024)
 * - AP Computer Science Principles (CSP) — College Board
 * - AP Computer Science A (CSA) — College Board
 * - ACM CS2023 (already in lesson frontmatter)
 * - SWEBOK v4 (already in lesson frontmatter)
 * - SFIA 9 (already in lesson frontmatter)
 * - ISTE Standards for Students
 */

export interface StandardsAlignment {
  phaseId: string;
  moduleId: string;
  csta: string[];
  apCSP: string[];
  apCSA: string[];
  iste: string[];
}

// CSTA Standard Codes Reference:
// Level 1 (K-5): 1A-CS-01 through 1B-IC-21
// Level 2 (6-8): 2-CS-01 through 2-IC-23
// Level 3A (9-10): 3A-CS-01 through 3A-IC-30
// Level 3B (11-12): 3B-CS-01 through 3B-IC-28

// AP CSP Big Ideas: 1-Creative Development, 2-Data, 3-Algorithms, 4-Programming, 5-Systems, 6-Internet, 7-Impact
// AP CSA Units: 1-Primitive Types, 2-Using Objects, 3-Boolean, 4-Iteration, 5-Writing Classes, 6-Array, 7-ArrayList, 8-2D Array, 9-Inheritance, 10-Recursion

export const PHASE_STANDARDS: StandardsAlignment[] = [
  // Phase 0: Digital Literacy → CSTA Level 2 + AP CSP Big Ideas 5,6
  {
    phaseId: "0",
    moduleId: "0-1",
    csta: ["2-CS-01", "2-CS-02", "2-CS-03"],
    apCSP: ["CSP-5.1", "CSP-5.2"],
    apCSA: [],
    iste: ["1.1", "1.2"],
  },
  {
    phaseId: "0",
    moduleId: "0-2",
    csta: ["2-NI-04", "2-NI-05", "2-NI-06"],
    apCSP: ["CSP-6.1", "CSP-6.2", "CSP-6.3"],
    apCSA: [],
    iste: ["1.2"],
  },
  {
    phaseId: "0",
    moduleId: "0-3",
    csta: ["2-CS-01", "2-CS-02"],
    apCSP: ["CSP-5.1"],
    apCSA: [],
    iste: ["1.1"],
  },
  {
    phaseId: "0",
    moduleId: "0-4",
    csta: ["2-IC-20", "2-IC-21", "2-IC-23"],
    apCSP: ["CSP-7.1", "CSP-7.2"],
    apCSA: [],
    iste: ["1.2"],
  },

  // Phase 1: Programming Fundamentals → CSTA Level 2/3A + AP CSP 3,4 + AP CSA 1-5
  {
    phaseId: "1",
    moduleId: "1-1",
    csta: ["2-AP-10", "2-AP-11", "3A-AP-14"],
    apCSP: ["CSP-4.1", "CSP-2.1"],
    apCSA: ["CSA-Unit1", "CSA-Unit2"],
    iste: ["1.5"],
  },
  {
    phaseId: "1",
    moduleId: "1-2",
    csta: ["2-AP-12", "3A-AP-15"],
    apCSP: ["CSP-3.1", "CSP-4.1"],
    apCSA: ["CSA-Unit3", "CSA-Unit4"],
    iste: ["1.5"],
  },
  {
    phaseId: "1",
    moduleId: "1-3",
    csta: ["2-AP-13", "2-AP-14", "3A-AP-17"],
    apCSP: ["CSP-3.1", "CSP-4.1"],
    apCSA: ["CSA-Unit5"],
    iste: ["1.5"],
  },
  {
    phaseId: "1",
    moduleId: "1-4",
    csta: ["2-DA-07", "2-DA-08", "3A-DA-09"],
    apCSP: ["CSP-2.1", "CSP-2.2"],
    apCSA: ["CSA-Unit6", "CSA-Unit7", "CSA-Unit8"],
    iste: ["1.5"],
  },
  {
    phaseId: "1",
    moduleId: "1-5",
    csta: ["2-AP-17", "3A-AP-21"],
    apCSP: ["CSP-4.1"],
    apCSA: [],
    iste: ["1.5", "1.6"],
  },
  {
    phaseId: "1",
    moduleId: "1-6",
    csta: ["2-AP-15", "2-AP-18", "2-AP-19", "3A-AP-22", "3A-AP-23"],
    apCSP: ["CSP-1.1", "CSP-1.2", "CSP-1.3"],
    apCSA: [],
    iste: ["1.5", "1.6"],
  },

  // Phase 2: Web Development → CSTA 3A/3B + AP CSP 1,4
  {
    phaseId: "2",
    moduleId: "2-1",
    csta: ["3A-AP-14", "3A-IC-24"],
    apCSP: ["CSP-1.1"],
    apCSA: [],
    iste: ["1.6"],
  },
  {
    phaseId: "2",
    moduleId: "2-2",
    csta: ["3A-AP-14"],
    apCSP: ["CSP-1.1"],
    apCSA: [],
    iste: ["1.6"],
  },
  {
    phaseId: "2",
    moduleId: "2-3",
    csta: ["3A-AP-15", "3A-AP-16", "3A-AP-18"],
    apCSP: ["CSP-4.1"],
    apCSA: [],
    iste: ["1.5", "1.6"],
  },
  {
    phaseId: "2",
    moduleId: "2-4",
    csta: ["3B-AP-14", "3B-AP-15", "3B-AP-16"],
    apCSP: ["CSP-1.2", "CSP-4.1"],
    apCSA: [],
    iste: ["1.5"],
  },
  {
    phaseId: "2",
    moduleId: "2-5",
    csta: ["3B-AP-16", "3B-AP-21"],
    apCSP: ["CSP-1.2", "CSP-1.3"],
    apCSA: [],
    iste: ["1.5", "1.6"],
  },

  // Phase 3: CS Fundamentals → CSTA 3A/3B + AP CSA 6-10
  {
    phaseId: "3",
    moduleId: "3-1",
    csta: ["3A-AP-13", "3B-AP-11"],
    apCSP: ["CSP-3.1"],
    apCSA: [],
    iste: ["1.5"],
  },
  {
    phaseId: "3",
    moduleId: "3-2",
    csta: ["3A-DA-09", "3A-DA-10", "3B-AP-12"],
    apCSP: ["CSP-2.2", "CSP-3.1"],
    apCSA: ["CSA-Unit6", "CSA-Unit8"],
    iste: ["1.5"],
  },
  {
    phaseId: "3",
    moduleId: "3-3",
    csta: ["3B-AP-12", "3B-AP-13"],
    apCSP: ["CSP-3.1"],
    apCSA: ["CSA-Unit7"],
    iste: ["1.5"],
  },
  {
    phaseId: "3",
    moduleId: "3-4",
    csta: ["3B-AP-12", "3B-AP-13"],
    apCSP: ["CSP-3.1"],
    apCSA: ["CSA-Unit10"],
    iste: ["1.5"],
  },
  {
    phaseId: "3",
    moduleId: "3-5",
    csta: ["3B-AP-11", "3B-AP-12", "3B-AP-13"],
    apCSP: ["CSP-3.1"],
    apCSA: ["CSA-Unit10"],
    iste: ["1.5"],
  },

  // Phases 4-9: Beyond AP scope — professional standards only (CS2023, SWEBOK, SFIA already mapped)
];

/** Look up the standards alignment for a specific module. */
export function getStandardsForModule(
  phaseId: string,
  moduleId: string
): StandardsAlignment | undefined {
  return PHASE_STANDARDS.find((s) => s.phaseId === phaseId && s.moduleId === moduleId);
}

/** Find all modules that cover a given AP CSP or AP CSA topic. */
export function getModulesByAPTopic(topic: string): StandardsAlignment[] {
  return PHASE_STANDARDS.filter((s) => s.apCSP.includes(topic) || s.apCSA.includes(topic));
}

/** Find all modules that cover a given CSTA standard code. */
export function getModulesByCSTAStandard(code: string): StandardsAlignment[] {
  return PHASE_STANDARDS.filter((s) => s.csta.includes(code));
}
