import type { SkillAnswer, SkillScore, DreyfusLevel, PathId } from "@/types/skill-assessment";

const BRACKETS: [string, number[]][] = [
  ["0-1", [0, 1]],
  ["2-3", [2, 3]],
  ["4-5", [4, 5]],
  ["6-7", [6, 7]],
  ["8-9", [8, 9]],
];

/** Score assessment answers by phase bracket. */
export function scoreAssessment(answers: SkillAnswer[]): SkillScore {
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;

  const byBracket: Record<string, { total: number; correct: number }> = {};
  for (const [label, phases] of BRACKETS) {
    const bracketAnswers = answers.filter((a) => phases.includes(a.phaseLevel));
    byBracket[label] = {
      total: bracketAnswers.length,
      correct: bracketAnswers.filter((a) => a.correct).length,
    };
  }

  const pct = total > 0 ? correct / total : 0;
  const dreyfusLevel: DreyfusLevel =
    pct <= 0.2
      ? "novice"
      : pct <= 0.4
        ? "advanced-beginner"
        : pct <= 0.6
          ? "competent"
          : pct <= 0.8
            ? "proficient"
            : "expert";

  return { total, correct, byBracket, dreyfusLevel };
}

function bracketPct(score: SkillScore, bracket: string): number {
  const b = score.byBracket[bracket];
  if (!b || b.total === 0) return 0;
  return b.correct / b.total;
}

/** Recommend a learning path based on assessment score. */
export function recommendPath(score: SkillScore): PathId {
  const p01 = bracketPct(score, "0-1");
  const p23 = bracketPct(score, "2-3");
  const p45 = bracketPct(score, "4-5");
  const p67 = bracketPct(score, "6-7");
  const p89 = bracketPct(score, "8-9");

  // Score < 50% in basics → start from the beginning
  if (p01 < 0.5) return "foundation";

  // Basics ok, web/CS weak → career switch path
  if (p01 >= 0.7 && p23 < 0.5) return "career-switch";

  // Web/CS ok, backend/systems weak → bootcamp grad path
  if (p01 >= 0.7 && p23 >= 0.5 && p45 < 0.5) return "bootcamp-grad";

  // Everything through systems ok, AI/advanced weak → mid to senior
  if (p01 >= 0.7 && p23 >= 0.5 && p45 >= 0.5 && p67 < 0.5) {
    // Special case: strong in AI specifically → AI specialist
    const aiAnswers = score.byBracket["6-7"];
    if (aiAnswers && aiAnswers.total > 0) {
      // Check if they got the AI questions right (phase 6 specifically)
      // Since we can't distinguish phase 6 from 7 in bracket data,
      // use the overall 6-7 score with a lower threshold
      if (bracketPct(score, "6-7") >= 0.33) return "ai-specialist";
    }
    return "mid-to-senior";
  }

  // Strong across the board → CTO track
  if (p01 >= 0.7 && p23 >= 0.7 && p45 >= 0.7 && p67 >= 0.5 && p89 >= 0.5) {
    return "cto-track";
  }

  // Default: recommend the mid-to-senior path for anyone who's solid on basics
  return "mid-to-senior";
}

/** Human-readable label for a Dreyfus level. */
export function dreyfusLabel(level: DreyfusLevel): string {
  switch (level) {
    case "novice":
      return "Novice";
    case "advanced-beginner":
      return "Advanced Beginner";
    case "competent":
      return "Competent";
    case "proficient":
      return "Proficient";
    case "expert":
      return "Expert";
  }
}
