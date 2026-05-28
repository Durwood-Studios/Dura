/**
 * Education standards alignment reference.
 * Maps DURA phases and modules to K-12, college, and professional standards.
 *
 * Phases 0-3 (K-12 + intro-college coverage): CSTA, AP CSP, AP CSA, ISTE.
 * Phases 4-9 (professional + advanced practice): module-level SFIA work-role
 * summaries, plus OWASP (security modules), IEEE 7000-series (AI/ethics),
 * and NIST NICE (cybersecurity workforce). ACM CS2023, SWEBOK v4, and SFIA
 * level numbers per lesson live on lesson frontmatter; the module-level
 * fields here surface codes that don't fit per-lesson but apply to the
 * whole module's scope of work.
 */

export interface StandardsAlignment {
  phaseId: string;
  moduleId: string;
  csta: string[];
  apCSP: string[];
  apCSA: string[];
  iste: string[];
  /** Module-level SFIA work-role + level summary, plain-language. */
  sfia?: string;
  /** OWASP Top 10 categories addressed by this module (security-relevant only). */
  owasp?: string[];
  /** IEEE 7000-series ethics standards relevant to this module (AI / ethics only). */
  ieee7000?: string[];
  /** NIST NICE Cybersecurity Workforce work-role codes (cyber/devops only). */
  nice?: string[];
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

  // Phase 4: Backend Engineering → SWEBOK + SFIA L3-4 + OWASP (API security) + NICE (DevOps)
  {
    phaseId: "4",
    moduleId: "4-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3 — Programming / software development",
  },
  {
    phaseId: "4",
    moduleId: "4-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3 — Programming / software development",
    owasp: ["A01:2021 Broken Access Control", "A07:2021 Identification & Auth Failures"],
  },
  {
    phaseId: "4",
    moduleId: "4-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3 — Database design (DBAD)",
  },
  {
    phaseId: "4",
    moduleId: "4-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3 — Systems integration / sustainability",
    nice: ["SP-DEV-001 Software Developer"],
  },
  {
    phaseId: "4",
    moduleId: "4-5",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Release & deployment management (RELM)",
    nice: ["OM-NET-001 Network Operations Specialist"],
  },

  // Phase 5: Systems Engineering → SFIA L4-5 + NICE (network/incident response)
  {
    phaseId: "5",
    moduleId: "5-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4–5 — Solution architecture (ARCH)",
  },
  {
    phaseId: "5",
    moduleId: "5-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Network design (NTDS)",
    nice: ["OM-NET-001 Network Operations Specialist"],
  },
  {
    phaseId: "5",
    moduleId: "5-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Performance management (PDSG)",
  },
  {
    phaseId: "5",
    moduleId: "5-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Service level management (SLMO)",
    nice: ["PR-CIR-001 Cyber Incident Response"],
  },

  // Phase 6: AI/ML Engineering → SFIA MLNG + IEEE 7000-series ethics
  {
    phaseId: "6",
    moduleId: "6-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3 — Machine learning (MLNG)",
  },
  {
    phaseId: "6",
    moduleId: "6-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3–4 — Machine learning (MLNG)",
    ieee7000: ["IEEE 7000-2021 (Ethical System Design)"],
  },
  {
    phaseId: "6",
    moduleId: "6-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Machine learning (MLNG)",
    ieee7000: ["IEEE 7000-2021 (Ethical System Design)", "IEEE 7001-2021 (Transparency)"],
  },
  {
    phaseId: "6",
    moduleId: "6-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Machine learning (MLNG)",
    ieee7000: ["IEEE 7000-2021 (Ethical System Design)"],
  },
  {
    phaseId: "6",
    moduleId: "6-5",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Data engineering (DENG)",
    ieee7000: ["IEEE 7001-2021 (Transparency of Autonomous Systems)"],
  },
  {
    phaseId: "6",
    moduleId: "6-6",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4–5 — Solution architecture (ARCH)",
    ieee7000: ["IEEE 7007-2021 (Ontological standards for ethical AI)"],
  },
  {
    phaseId: "6",
    moduleId: "6-7",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4–5 — Programming / agent engineering (PROG, EMRG)",
    ieee7000: [
      "IEEE 7000-2021 (Model process for addressing ethical concerns during system design)",
      "IEEE 7001-2021 (Transparency of autonomous systems)",
    ],
    owasp: ["LLM01 Prompt Injection", "LLM02 Insecure Output Handling", "LLM08 Excessive Agency"],
  },

  // Phase 7: Advanced Systems → SFIA L5 + NICE (security) + OWASP
  {
    phaseId: "7",
    moduleId: "7-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5 — Programming / specialism (PROG)",
  },
  {
    phaseId: "7",
    moduleId: "7-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5 — Systems development management (DLMG)",
  },
  {
    phaseId: "7",
    moduleId: "7-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4–5 — Information security (SCTY)",
    owasp: ["A02:2021 Cryptographic Failures", "A04:2021 Insecure Design"],
    nice: ["SP-DEV-002 Secure Software Assessor", "OM-CYB-001 Cyber Defense Analyst"],
  },
  {
    phaseId: "7",
    moduleId: "7-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5–6 — Solution architecture (ARCH)",
  },

  // Phase 8: Professional Practice → SFIA L3-4 + SWEBOK + IEEE 7000 ethics
  {
    phaseId: "8",
    moduleId: "8-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Methods & tools (METL)",
  },
  {
    phaseId: "8",
    moduleId: "8-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3–4 — Testing (TEST)",
  },
  {
    phaseId: "8",
    moduleId: "8-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3 — Quality management (QUMG)",
  },
  {
    phaseId: "8",
    moduleId: "8-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 3–4 — Technical writing (TECH)",
  },
  {
    phaseId: "8",
    moduleId: "8-5",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 4 — Professional development (PDSV)",
    ieee7000: ["IEEE 7000-2021 (Ethical System Design)", "IEEE 7010-2020 (Wellbeing Metrics)"],
  },

  // Phase 9: CTO Track → SFIA L5-7 strategy + management work roles
  {
    phaseId: "9",
    moduleId: "9-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5 — People management / mentoring (PEMT)",
  },
  {
    phaseId: "9",
    moduleId: "9-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 6–7 — Enterprise & solution architecture (ARCH)",
  },
  {
    phaseId: "9",
    moduleId: "9-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5–6 — Organisational design (RESC)",
  },
  {
    phaseId: "9",
    moduleId: "9-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5–6 — IT strategy & planning (ITSP)",
  },
  {
    phaseId: "9",
    moduleId: "9-5",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5 — Financial management for IT (FMIT)",
  },
  {
    phaseId: "9",
    moduleId: "9-6",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 5 — IT strategy & planning (ITSP)",
  },
  {
    phaseId: "9",
    moduleId: "9-7",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 6 — IT strategy & planning (ITSP)",
  },
  {
    phaseId: "9",
    moduleId: "9-8",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    sfia: "Level 7 — IT strategy & planning (ITSP)",
  },
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
