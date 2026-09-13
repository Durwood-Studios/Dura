import type { AssessmentQuestion, QuestionResult } from "@/types/assessment";

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
  count: number = MASTERY_DEFAULT_COUNT,
  previousQuestionIds: string[] = []
): AssessmentQuestion[] {
  try {
    const moduleQuestions = pool.filter((q) => q.moduleId === moduleId);
    if (moduleQuestions.length === 0) return [];
    const rng = mulberry32(Date.now());
    const previous = new Set(previousQuestionIds);
    const shuffled = [
      ...shuffle(
        moduleQuestions.filter((question) => !previous.has(question.id)),
        rng
      ),
      ...shuffle(
        moduleQuestions.filter((question) => previous.has(question.id)),
        rng
      ),
    ];
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } catch (error) {
    console.error("[assessment] selectMasteryQuestions failed", error);
    return [];
  }
}

/**
 * Module-stratified phase sampling. Each nonempty module gets an item before
 * any receives a second; subsequent rounds balance module representation.
 * Counts below the number of modules are rejected rather than claiming coverage.
 * Callers can inject a cryptographic RNG on the server or a seeded RNG in tests.
 */
export function selectVerificationQuestions(
  phaseId: string,
  pool: AssessmentQuestion[],
  count: number = VERIFICATION_DEFAULT_COUNT,
  rng: () => number = mulberry32(Date.now())
): AssessmentQuestion[] {
  if (!Number.isInteger(count) || count <= 0) return [];
  const groups = new Map<string, AssessmentQuestion[]>();
  for (const question of pool) {
    if (question.phaseId !== phaseId) continue;
    const group = groups.get(question.moduleId) ?? [];
    group.push(question);
    groups.set(question.moduleId, group);
  }
  if (groups.size > count) return [];
  const queues = shuffle(
    [...groups.values()].map((items) => shuffle(items, rng)),
    rng
  );
  const selected: AssessmentQuestion[] = [];
  while (selected.length < count) {
    let added = false;
    for (const queue of queues) {
      const question = queue.shift();
      if (question) {
        selected.push(question);
        added = true;
      }
      if (selected.length === count) break;
    }
    if (!added) break;
  }
  return shuffle(selected, rng);
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
