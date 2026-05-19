/**
 * Standards body metadata used by the lesson StandardsBadges UI.
 * Codes themselves live on lesson frontmatter (LessonMeta.standards)
 * and on PHASE_STANDARDS for module-level K-12 alignment.
 */

export type StandardsBodyId =
  | "cs2023"
  | "swebok"
  | "sfia"
  | "bloom"
  | "dreyfus"
  | "csta"
  | "apcsp"
  | "apcsa"
  | "iste"
  | "wcag"
  | "owasp"
  | "ieee7000"
  | "nice";

export interface StandardsBody {
  id: StandardsBodyId;
  /** Short label shown on the chip (≤ 8 chars ideal). */
  short: string;
  /** Full name shown in the popover header. */
  full: string;
  /** One-sentence explanation of what the body is and who maintains it. */
  description: string;
  /** Canonical URL for the standard. */
  url: string;
}

export const STANDARDS_BODIES: Record<StandardsBodyId, StandardsBody> = {
  cs2023: {
    id: "cs2023",
    short: "CS2023",
    full: "ACM/IEEE-CS Computer Science Curricula 2023",
    description:
      "The international reference curriculum for undergraduate computer science, maintained jointly by the ACM, IEEE Computer Society, and AAAI. Codes refer to knowledge areas like AR (Architecture), AL (Algorithms), SE (Software Engineering).",
    url: "https://csed.acm.org/",
  },
  swebok: {
    id: "swebok",
    short: "SWEBOK",
    full: "IEEE Software Engineering Body of Knowledge (v4)",
    description:
      "The IEEE Computer Society's consensus document defining the discipline of software engineering. Used as the reference for professional licensure exams worldwide.",
    url: "https://www.computer.org/education/bodies-of-knowledge/software-engineering",
  },
  sfia: {
    id: "sfia",
    short: "SFIA",
    full: "Skills Framework for the Information Age (v9)",
    description:
      "The global common-language skills and competency framework used by employers and governments to describe IT roles. Levels run 1 (follow) through 7 (set strategy).",
    url: "https://sfia-online.org/",
  },
  bloom: {
    id: "bloom",
    short: "Bloom",
    full: "Bloom's Taxonomy (Revised)",
    description:
      "A six-level hierarchy of cognitive learning objectives — Remember, Understand, Apply, Analyze, Evaluate, Create — used by educators worldwide to design and assess instruction.",
    url: "https://www.celt.iastate.edu/instructional-strategies/effective-teaching-practices/revised-blooms-taxonomy/",
  },
  dreyfus: {
    id: "dreyfus",
    short: "Dreyfus",
    full: "Dreyfus Model of Skill Acquisition",
    description:
      "A five-stage model of how learners move from rule-following novices to intuitive experts: Novice, Advanced Beginner, Competent, Proficient, Expert.",
    url: "https://en.wikipedia.org/wiki/Dreyfus_model_of_skill_acquisition",
  },
  csta: {
    id: "csta",
    short: "CSTA",
    full: "CSTA K-12 Computer Science Standards (2017, updated 2024)",
    description:
      "The Computer Science Teachers Association's K-12 standards adopted by US states. Codes are Level-Domain-Number, e.g. 2-AP-10 (Level 2 / Algorithms & Programming / standard 10).",
    url: "https://csteachers.org/k12standards/",
  },
  apcsp: {
    id: "apcsp",
    short: "AP CSP",
    full: "AP Computer Science Principles (College Board)",
    description:
      "College Board's introductory AP course organised around seven Big Ideas. Codes prefixed CSP- map to those Big Ideas (1 Creative Development, 2 Data, 3 Algorithms, 4 Programming, 5 Systems, 6 Internet, 7 Impact).",
    url: "https://apcentral.collegeboard.org/courses/ap-computer-science-principles",
  },
  apcsa: {
    id: "apcsa",
    short: "AP CSA",
    full: "AP Computer Science A (College Board)",
    description:
      "College Board's Java-based AP course mapped to ten units, from primitive types through recursion. DURA's Phase 1–3 cover most of the AP CSA syllabus.",
    url: "https://apcentral.collegeboard.org/courses/ap-computer-science-a",
  },
  iste: {
    id: "iste",
    short: "ISTE",
    full: "ISTE Standards for Students",
    description:
      "International Society for Technology in Education's standards for what students should know and do with technology, adopted by schools globally.",
    url: "https://iste.org/standards/students",
  },
  wcag: {
    id: "wcag",
    short: "WCAG",
    full: "Web Content Accessibility Guidelines 2.2 (W3C)",
    description:
      "The W3C's accessibility guidelines for web content, organised around four principles (Perceivable, Operable, Understandable, Robust) and three conformance levels (A, AA, AAA). Cited as the legal standard for accessibility in most jurisdictions.",
    url: "https://www.w3.org/TR/WCAG22/",
  },
  owasp: {
    id: "owasp",
    short: "OWASP",
    full: "OWASP Top 10 / Application Security Verification Standard",
    description:
      "The Open Worldwide Application Security Project's consensus list of the most critical security risks to web applications, and the matching verification standard. The de facto reference for secure software development.",
    url: "https://owasp.org/Top10/",
  },
  ieee7000: {
    id: "ieee7000",
    short: "IEEE 7000",
    full: "IEEE 7000-series Standards on Ethics in Autonomous and Intelligent Systems",
    description:
      "A family of IEEE standards on ethical design of intelligent systems — value-based design, transparency of autonomous systems, algorithmic bias, data privacy, child and student data governance.",
    url: "https://standards.ieee.org/industry-connections/ec/autonomous-systems/",
  },
  nice: {
    id: "nice",
    short: "NICE",
    full: "NIST NICE Workforce Framework for Cybersecurity",
    description:
      "The US National Initiative for Cybersecurity Education's reference taxonomy of cybersecurity work roles, tasks, and knowledge/skill statements. Used by employers and educators to describe security roles.",
    url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center",
  },
};

export interface StandardsBadge {
  body: StandardsBody;
  /** Codes from this body that apply to the current lesson/module. */
  codes: string[];
}

/** Build the ordered badge list for a lesson, omitting bodies with no codes. */
export function buildBadges(input: {
  cs2023?: string[];
  swebok?: string[];
  /** Lesson-level SFIA string, e.g. "Level 2". */
  sfia?: string;
  /** Module-level SFIA work-role summary, merged with lesson sfia. */
  sfiaModule?: string;
  bloom?: string;
  dreyfus?: string;
  csta?: string[];
  apcsp?: string[];
  apcsa?: string[];
  iste?: string[];
  /** Module-level OWASP Top 10 categories (security modules). */
  owasp?: string[];
  /** Module-level IEEE 7000-series ethics standards (AI / ethics modules). */
  ieee7000?: string[];
  /** Module-level NIST NICE workforce codes (cyber / devops modules). */
  nice?: string[];
}): StandardsBadge[] {
  const badges: StandardsBadge[] = [];
  const push = (id: StandardsBodyId, codes: string[] | undefined): void => {
    const cleaned = dedupe((codes ?? []).filter((c): c is string => Boolean(c && c.trim())));
    if (cleaned.length === 0) return;
    badges.push({ body: STANDARDS_BODIES[id], codes: cleaned });
  };
  push("cs2023", input.cs2023);
  push("swebok", input.swebok);
  const sfiaCodes = [input.sfia, input.sfiaModule].filter((s): s is string => Boolean(s));
  if (sfiaCodes.length > 0) push("sfia", sfiaCodes);
  if (input.bloom) push("bloom", [capitalize(input.bloom)]);
  if (input.dreyfus) push("dreyfus", [formatDreyfus(input.dreyfus)]);
  push("csta", input.csta);
  push("apcsp", input.apcsp);
  push("apcsa", input.apcsa);
  push("iste", input.iste);
  push("owasp", input.owasp);
  push("ieee7000", input.ieee7000);
  push("nice", input.nice);
  return badges;
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function formatDreyfus(s: string): string {
  return s.split("-").map(capitalize).join(" ");
}

/**
 * Knowledge-area decoders for codes that follow a predictable structure.
 * Used to enrich raw codes (e.g. "AR-1") with the human-readable area
 * name ("Architecture & Organization") so the chip popover and the
 * /standards page surface meaning, not just identifiers.
 *
 * Only authoritative, stable mappings live here. Codes whose interpretation
 * has changed across framework versions (e.g. AP CSP Big Ideas reframed
 * in 2020) are intentionally NOT decoded — the raw code wins over a
 * possibly-stale label.
 */

const CS2023_AREAS: Record<string, string> = {
  AI: "Artificial Intelligence",
  AL: "Algorithms & Complexity",
  AR: "Architecture & Organization",
  DM: "Data Management",
  FPL: "Foundations of Programming Languages",
  GIT: "Graphics & Interactive Techniques",
  HCI: "Human-Computer Interaction",
  MSF: "Mathematical & Statistical Foundations",
  NC: "Networking & Communication",
  OS: "Operating Systems",
  PDC: "Parallel & Distributed Computing",
  PD: "Platform-Based Development",
  SE: "Software Engineering",
  SEC: "Security",
  SF: "Systems Fundamentals",
  SDF: "Software Development Fundamentals",
  SP: "Society, Ethics & Professionalism",
};

const CSTA_LEVELS: Record<string, string> = {
  "1A": "Level 1A (K-2)",
  "1B": "Level 1B (3-5)",
  "2": "Level 2 (6-8)",
  "3A": "Level 3A (9-10)",
  "3B": "Level 3B (11-12)",
};

const CSTA_DOMAINS: Record<string, string> = {
  CS: "Computing Systems",
  NI: "Networks & the Internet",
  DA: "Data & Analysis",
  AP: "Algorithms & Programming",
  IC: "Impacts of Computing",
};

const ISTE_STUDENT: Record<string, string> = {
  "1.1": "Empowered Learner",
  "1.2": "Digital Citizen",
  "1.3": "Knowledge Constructor",
  "1.4": "Innovative Designer",
  "1.5": "Computational Thinker",
  "1.6": "Creative Communicator",
  "1.7": "Global Collaborator",
};

const APCSA_UNITS: Record<string, string> = {
  "CSA-Unit1": "Primitive Types",
  "CSA-Unit2": "Using Objects",
  "CSA-Unit3": "Boolean Expressions & If Statements",
  "CSA-Unit4": "Iteration",
  "CSA-Unit5": "Writing Classes",
  "CSA-Unit6": "Array",
  "CSA-Unit7": "ArrayList",
  "CSA-Unit8": "2D Array",
  "CSA-Unit9": "Inheritance",
  "CSA-Unit10": "Recursion",
};

/**
 * Decode a standards code into a human-readable label when the body has a
 * stable structural mapping. Returns the raw code unchanged when no
 * decoder applies — readability is opportunistic, never invented.
 */
export function decodeCode(bodyId: StandardsBodyId, code: string): string {
  const trimmed = code.trim();
  switch (bodyId) {
    case "cs2023": {
      // CS2023 codes look like "AR-1", "SE-3", "MSF-1.1"
      const match = trimmed.match(/^([A-Z]+)(?:[-.].+)?$/);
      const area = match?.[1] ? CS2023_AREAS[match[1]] : undefined;
      return area ? `${trimmed} — ${area}` : trimmed;
    }
    case "csta": {
      // CSTA codes: Level-Domain-Number, e.g. "2-AP-10" or "3B-DA-09"
      const match = trimmed.match(/^(1A|1B|2|3A|3B)-([A-Z]{2})-\d+$/);
      if (!match) return trimmed;
      const level = CSTA_LEVELS[match[1]];
      const domain = CSTA_DOMAINS[match[2]];
      if (!level || !domain) return trimmed;
      return `${trimmed} — ${level}, ${domain}`;
    }
    case "iste": {
      const label = ISTE_STUDENT[trimmed];
      return label ? `${trimmed} — ${label}` : trimmed;
    }
    case "apcsa": {
      const label = APCSA_UNITS[trimmed];
      return label ? `${trimmed} — ${label}` : trimmed;
    }
    default:
      return trimmed;
  }
}
