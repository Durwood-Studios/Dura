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
  sfia?: string;
  bloom?: string;
  dreyfus?: string;
  csta?: string[];
  apcsp?: string[];
  apcsa?: string[];
  iste?: string[];
}): StandardsBadge[] {
  const badges: StandardsBadge[] = [];
  const push = (id: StandardsBodyId, codes: string[] | undefined): void => {
    const cleaned = (codes ?? []).filter((c): c is string => Boolean(c && c.trim()));
    if (cleaned.length === 0) return;
    badges.push({ body: STANDARDS_BODIES[id], codes: cleaned });
  };
  push("cs2023", input.cs2023);
  push("swebok", input.swebok);
  if (input.sfia) push("sfia", [input.sfia]);
  if (input.bloom) push("bloom", [capitalize(input.bloom)]);
  if (input.dreyfus) push("dreyfus", [formatDreyfus(input.dreyfus)]);
  push("csta", input.csta);
  push("apcsp", input.apcsp);
  push("apcsa", input.apcsa);
  push("iste", input.iste);
  return badges;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function formatDreyfus(s: string): string {
  return s.split("-").map(capitalize).join(" ");
}
