import type { AssessmentQuestion, QuestionResult, QuestionDifficulty } from "@/types/assessment";

const COOLDOWN_DEFAULT_MS = 24 * 60 * 60 * 1000;
const MASTERY_DEFAULT_COUNT = 12;
const VERIFICATION_DEFAULT_COUNT = 30;

/** Mulberry32 PRNG seeded by an integer — deterministic, fast, no deps. */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function arraysEqualUnordered(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function asArray(value: number | number[]): number[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Select questions for a module-level mastery gate.
 * Pulls from the module's pool, shuffles deterministically by current
 * timestamp so two consecutive attempts get different orderings.
 */
export function selectMasteryQuestions(
  moduleId: string,
  pool: AssessmentQuestion[],
  count: number = MASTERY_DEFAULT_COUNT
): AssessmentQuestion[] {
  try {
    const moduleQuestions = pool.filter((q) => q.moduleId === moduleId);
    if (moduleQuestions.length === 0) return [];
    const rng = mulberry32(Date.now());
    const shuffled = shuffle(moduleQuestions, rng);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } catch (error) {
    console.error("[assessment] selectMasteryQuestions failed", error);
    return [];
  }
}

/**
 * Select questions for a phase verification test.
 * Draws from every module in the phase, weighted toward medium/hard.
 */
export function selectVerificationQuestions(
  phaseId: string,
  pool: AssessmentQuestion[],
  count: number = VERIFICATION_DEFAULT_COUNT
): AssessmentQuestion[] {
  try {
    const phaseQuestions = pool.filter((q) => q.phaseId === phaseId);
    if (phaseQuestions.length === 0) return [];

    // Group by difficulty for weighted selection.
    const buckets: Record<QuestionDifficulty, AssessmentQuestion[]> = {
      easy: [],
      medium: [],
      hard: [],
    };
    for (const q of phaseQuestions) buckets[q.difficulty].push(q);

    const rng = mulberry32(Date.now());
    // Target mix: 30% easy, 50% medium, 20% hard.
    const targets = {
      easy: Math.round(count * 0.3),
      medium: Math.round(count * 0.5),
      hard: count - Math.round(count * 0.3) - Math.round(count * 0.5),
    };

    const picked: AssessmentQuestion[] = [];
    for (const difficulty of ["easy", "medium", "hard"] as QuestionDifficulty[]) {
      const shuffled = shuffle(buckets[difficulty], rng);
      picked.push(...shuffled.slice(0, targets[difficulty]));
    }

    // Pad with anything remaining if buckets were too small.
    if (picked.length < count) {
      const used = new Set(picked.map((p) => p.id));
      const remaining = shuffle(
        phaseQuestions.filter((q) => !used.has(q.id)),
        rng
      );
      picked.push(...remaining.slice(0, count - picked.length));
    }

    return shuffle(picked, rng).slice(0, Math.min(count, picked.length));
  } catch (error) {
    console.error("[assessment] selectVerificationQuestions failed", error);
    return [];
  }
}

/**
 * Score a completed assessment.
 * Multi-select questions award partial credit (correct selections / total correct,
 * minus a penalty for wrong selections).
 */
export function scoreAssessment(
  questions: AssessmentQuestion[],
  answers: Map<string, number | number[] | null>
): { score: number; correctCount: number; results: QuestionResult[] } {
  try {
    const results: QuestionResult[] = [];
    let totalCredit = 0;
    let correctCount = 0;

    for (const question of questions) {
      const answer = answers.get(question.id) ?? null;
      let credit = 0;

      if (answer === null) {
        results.push({
          questionId: question.id,
          selectedAnswer: null,
          correct: false,
          timeSpentMs: 0,
        });
        continue;
      }

      if (question.type === "multiple-select") {
        const correctSet = new Set(asArray(question.correct));
        const answerSet = new Set(asArray(answer));
        const matched = [...answerSet].filter((a) => correctSet.has(a)).length;
        const wrong = [...answerSet].filter((a) => !correctSet.has(a)).length;
        const partial = Math.max(0, matched / correctSet.size - wrong / correctSet.size);
        credit = partial;
      } else {
        const correctArr = asArray(question.correct);
        const answerArr = asArray(answer);
        credit = arraysEqualUnordered(correctArr, answerArr) ? 1 : 0;
      }

      totalCredit += credit;
      const fullCorrect = credit >= 0.999;
      if (fullCorrect) correctCount++;

      results.push({
        questionId: question.id,
        selectedAnswer: answer,
        correct: fullCorrect,
        timeSpentMs: 0,
      });
    }

    const score = questions.length === 0 ? 0 : totalCredit / questions.length;
    return { score, correctCount, results };
  } catch (error) {
    console.error("[assessment] scoreAssessment failed", error);
    return { score: 0, correctCount: 0, results: [] };
  }
}

/**
 * Determine whether an assessment can be retaken yet.
 * 24-hour cooldown after a failed attempt by default.
 */
export function canRetakeAssessment(
  lastAttemptAt: number | null,
  cooldownMs: number = COOLDOWN_DEFAULT_MS
): { canRetake: boolean; retryAt: number | null } {
  if (lastAttemptAt === null) return { canRetake: true, retryAt: null };
  const retryAt = lastAttemptAt + cooldownMs;
  return { canRetake: Date.now() >= retryAt, retryAt };
}

export const ASSESSMENT_PASSING_SCORE = 0.8;
