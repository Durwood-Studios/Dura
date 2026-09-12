/**
 * Education standards alignment reference.
 * Maps DURA phases and modules to K-12, college, and professional standards.
 *
 * Phases 0-3 contain recorded CSTA/ISTE references. Unverified historical
 * AP CSP/CSA mappings are retained separately and withheld from current claims.
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
  /** Pending mappings are withheld from learner-facing standards claims. */
  alignmentStatus?: "pending-review" | "lesson-metadata-only";
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
  /**
   * Industry / professional standards this module covers.
   * Format: "<body>:<code>" or "<body>:<code>:<title>" for readability.
   * Examples: "IEC:61508", "ISO:10218-1:2025", "MISRA-C:2023", "ISA:95"
   */
  professionalStandards?: string[];
}

// CSTA Standard Codes Reference:
// Level 1 (K-5): 1A-CS-01 through 1B-IC-21
// Level 2 (6-8): 2-CS-01 through 2-IC-23
// Level 3A (9-10): 3A-CS-01 through 3A-IC-30
// Level 3B (11-12): 3B-CS-01 through 3B-IC-28

// Unverified legacy AP labels are retained below for migration evidence only.
// The old CSP seven-part taxonomy is not the current five Big Ideas; CSA
// switched from ten units to four effective fall 2025. Neither is a current claim.
// See standards/pedagogy/CORE-MAPPING-REVIEW.md for sources and scope.

const RECORDED_PHASE_STANDARDS: StandardsAlignment[] = [
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

  // ── Phase 10: Embedded / Firmware ────────────────
  {
    phaseId: "10",
    moduleId: "10-1",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-2",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-3",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-4",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-5",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-6",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-7",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["MISRA-C:2023"],
  },
  {
    phaseId: "10",
    moduleId: "10-8",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },

  // ── Phase 11: Hardware Verification ───────────────
  {
    phaseId: "11",
    moduleId: "11-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:1800-2023:SystemVerilog"],
  },
  {
    phaseId: "11",
    moduleId: "11-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:1800.2-2020:UVM"],
  },
  {
    phaseId: "11",
    moduleId: "11-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:1800-2023:SystemVerilog constrained randomization"],
  },
  {
    phaseId: "11",
    moduleId: "11-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: [
      "IEEE:1800-2023:Functional coverage",
      "IEEE:1800.2-2020:UVM coverage collectors",
    ],
  },
  {
    phaseId: "11",
    moduleId: "11-5",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:1800.2-2020:UVM sequences"],
  },
  {
    phaseId: "11",
    moduleId: "11-6",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:1800-2023:SystemVerilog assertions"],
  },

  // ── Phase 12: Quantitative / HFT Systems ─────────
  {
    phaseId: "12",
    moduleId: "12-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ISO:IEC 14882:2024:C++23"],
  },
  {
    phaseId: "12",
    moduleId: "12-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:754-2019:Floating-point arithmetic"],
  },
  {
    phaseId: "12",
    moduleId: "12-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ISO:IEC 14882:2024:C++ object layout and alignment"],
  },
  {
    phaseId: "12",
    moduleId: "12-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ISO:IEC 14882:2024:C++ atomics and memory ordering"],
  },
  {
    phaseId: "12",
    moduleId: "12-5",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "12",
    moduleId: "12-6",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["NASDAQ:TotalView-ITCH 5.0", "NASDAQ:OUCH"],
  },
  {
    phaseId: "12",
    moduleId: "12-7",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["FIX:5.0 SP2:Order entry and session handling"],
  },
  {
    phaseId: "12",
    moduleId: "12-8",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ISO:IEC 14882:2024:C++ order-book implementation"],
  },

  // ── Phase 13: Robotics Software Engineering ──────
  {
    phaseId: "13",
    moduleId: "13-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: [
      "ISO:8373:2021:Robotics vocabulary",
      "ISO:9283:1998:Robot performance tests",
    ],
  },
  {
    phaseId: "13",
    moduleId: "13-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ISO:12100:2010:Machinery risk assessment and reduction"],
  },
  {
    phaseId: "13",
    moduleId: "13-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: [
      "ISO:13849-1:2023:Safety-related controls",
      "IEC:62061:2021:Machinery functional safety",
    ],
  },
  {
    phaseId: "13",
    moduleId: "13-4",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: [
      "ISO:10218-1:2025:Industrial robot safety",
      "ISO:10218-2:2025:Robot application safety",
    ],
  },
  {
    phaseId: "13",
    moduleId: "13-5",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["RIA:TR R15.806-2018:Power and force measurement methods"],
  },
  {
    phaseId: "13",
    moduleId: "13-6",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "13",
    moduleId: "13-7",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEC:62443:Industrial control cybersecurity"],
  },
  {
    phaseId: "13",
    moduleId: "13-8",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["A3:R15.06-2025:Industrial robot application risk package"],
  },

  // ── Phase 14: Manufacturing Systems Engineering ──
  {
    phaseId: "14",
    moduleId: "14-1",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ISO:9001:2015:Quality management systems"],
  },
  {
    phaseId: "14",
    moduleId: "14-2",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: [
      "SAE:AS9100D:Aerospace quality management",
      "IATF:16949:2016:Automotive quality management",
    ],
  },
  {
    phaseId: "14",
    moduleId: "14-3",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["AIAG:APQP, PPAP, FMEA, MSA and SPC:Automotive quality core tools"],
  },
  {
    phaseId: "14",
    moduleId: "14-4",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "14",
    moduleId: "14-5",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "14",
    moduleId: "14-6",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ASME:Y14.5-2018:Dimensioning and tolerancing"],
  },
  {
    phaseId: "14",
    moduleId: "14-7",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ASME:Y14.41-2026:Digital product definition"],
  },
  {
    phaseId: "14",
    moduleId: "14-8",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IPC:A-610J:Electronic assembly acceptance"],
  },
  {
    phaseId: "14",
    moduleId: "14-9",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IPC:7711/7721D:Electronic assembly rework and repair"],
  },
  {
    phaseId: "14",
    moduleId: "14-10",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["ISA:95:Enterprise-control integration", "ISA:88:Batch control"],
  },
  {
    phaseId: "14",
    moduleId: "14-11",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: [
      "MTConnect:Manufacturing data model",
      "OPC:UA:Industrial information exchange",
    ],
  },
  {
    phaseId: "14",
    moduleId: "14-12",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEC:62443:Industrial control cybersecurity"],
  },
  // Added modules have lesson-level claims; broader mappings require review.
  {
    phaseId: "0",
    moduleId: "0-5",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "1",
    moduleId: "1-7",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "2",
    moduleId: "2-6",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "2",
    moduleId: "2-7",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "3",
    moduleId: "3-6",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "4",
    moduleId: "4-6",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "5",
    moduleId: "5-5",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "6",
    moduleId: "6-8",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "6",
    moduleId: "6-9",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "7",
    moduleId: "7-5",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "8",
    moduleId: "8-6",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "8",
    moduleId: "8-7",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "9",
    moduleId: "9-9",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "9",
    moduleId: "9-10",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-9",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "10",
    moduleId: "10-10",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "11",
    moduleId: "11-7",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:1801-2018:Unified Power Format"],
  },
  {
    phaseId: "11",
    moduleId: "11-8",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
    professionalStandards: ["IEEE:1800.2-2020:UVM testbench"],
  },
  {
    phaseId: "11",
    moduleId: "11-9",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "11",
    moduleId: "11-10",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "12",
    moduleId: "12-9",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "13",
    moduleId: "13-9",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "14",
    moduleId: "14-13",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
  {
    phaseId: "14",
    moduleId: "14-14",
    alignmentStatus: "lesson-metadata-only",
    csta: [],
    apCSP: [],
    apCSA: [],
    iste: [],
  },
];

/** Historical, unverified AP labels retained for review; never learner-facing claims. */
export const HISTORICAL_AP_MAPPINGS = RECORDED_PHASE_STANDARDS.filter(
  (alignment: StandardsAlignment): boolean =>
    alignment.apCSP.length > 0 || alignment.apCSA.length > 0
).map(
  (
    alignment: StandardsAlignment
  ): Pick<StandardsAlignment, "phaseId" | "moduleId" | "apCSP" | "apCSA"> => ({
    phaseId: alignment.phaseId,
    moduleId: alignment.moduleId,
    apCSP: alignment.apCSP,
    apCSA: alignment.apCSA,
  })
);

/** Current claims exclude unverified legacy AP mappings until a current-framework review. */
export const PHASE_STANDARDS: StandardsAlignment[] = RECORDED_PHASE_STANDARDS.map(
  (alignment: StandardsAlignment): StandardsAlignment => ({ ...alignment, apCSP: [], apCSA: [] })
);

/** Look up the standards alignment for a specific module. */
export function getStandardsForModule(
  phaseId: string,
  moduleId: string
): StandardsAlignment | undefined {
  return PHASE_STANDARDS.find(
    (s) =>
      s.phaseId === phaseId && s.moduleId === moduleId && s.alignmentStatus !== "pending-review"
  );
}

/** Find all modules that cover a given AP CSP or AP CSA topic. */
export function getModulesByAPTopic(topic: string): StandardsAlignment[] {
  return PHASE_STANDARDS.filter(
    (s) =>
      s.alignmentStatus !== "pending-review" && (s.apCSP.includes(topic) || s.apCSA.includes(topic))
  );
}

/** Find all modules that cover a given CSTA standard code. */
export function getModulesByCSTAStandard(code: string): StandardsAlignment[] {
  return PHASE_STANDARDS.filter(
    (s) => s.alignmentStatus !== "pending-review" && s.csta.includes(code)
  );
}
