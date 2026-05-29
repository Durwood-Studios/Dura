import { calibrate } from "./calibration";
import { ratingFor } from "./fsrs-bridge";
import type {
  AnswerSubmission,
  Diagnosis,
  EvaluationResult,
  MCQQuestion,
  MisconceptionCatalog,
  Question,
} from "./types";

/**
 * Render the merged choice list (correct + distractors) for an MCQ in a
 * deterministic order. The seed makes the order reproducible per question
 * id, so the same learner re-seeing the question sees the same layout.
 *
 * Without a fixed order the choice index in the submission would be
 * meaningless on re-render.
 */
export function renderChoices(question: MCQQuestion): {
  text: string;
  correct: boolean;
  misconception?: string;
}[] {
  const seeded = hashString(question.id);
  const indices = [...question.distractors.map((_, i) => i), -1]; // -1 represents the correct answer
  const shuffled = deterministicShuffle(indices, seeded);
  return shuffled.map((i) =>
    i === -1
      ? { text: question.correct.text, correct: true }
      : {
          text: question.distractors[i].text,
          correct: false,
          misconception: question.distractors[i].misconception,
        }
  );
}

/**
 * Evaluate a learner's answer against a question. Pure function:
 *   evaluate(q, sub, cat) === evaluate(q, sub, cat)
 *
 * Same input → same output, every time. No I/O, no Date.now(), no Math.random.
 *
 * Outputs an EvaluationResult carrying:
 *   - correctness + the worked solution (always)
 *   - a Diagnosis when the chosen distractor is tagged with a misconception
 *   - a CalibrationReading when confidence was elicited
 *   - an FSRS rating ready for the local scheduler
 */
export function evaluate(
  question: Question,
  submission: AnswerSubmission,
  catalog: MisconceptionCatalog
): EvaluationResult {
  if (question.kind !== submission.kind) {
    throw new Error(
      `Submission kind ${submission.kind} does not match question kind ${question.kind}`
    );
  }

  const choices = renderChoices(question);
  const selected = choices[submission.choiceIndex];
  if (!selected) {
    throw new Error(`Choice index ${submission.choiceIndex} out of range`);
  }

  const correct = selected.correct;
  const diagnosis: Diagnosis | undefined =
    !correct && selected.misconception
      ? buildDiagnosis(selected.misconception, selected.text, catalog)
      : undefined;

  const calibration =
    submission.confidence !== undefined ? calibrate(correct, submission.confidence) : undefined;

  const rating = ratingFor({ correct, confidence: submission.confidence });

  return {
    correct,
    selectedText: selected.text,
    correctText: question.correct.text,
    worked: question.workedSolution,
    diagnosis,
    calibration,
    rating,
  };
}

function buildDiagnosis(
  misconceptionId: string,
  pickedText: string,
  catalog: MisconceptionCatalog
): Diagnosis {
  const misconception = catalog[misconceptionId];
  if (!misconception) {
    throw new Error(`Unknown misconception id: ${misconceptionId}`);
  }
  return {
    misconception,
    explanation: `You picked "${pickedText}" — that maps to ${misconception.name}. ${misconception.description}`,
  };
}

// Deterministic helpers below. Both are pure, both are tested separately.

function hashString(s: string): number {
  // djb2 — small, fast, deterministic. Sufficient as a non-cryptographic seed.
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  // Fisher-Yates with a seeded LCG. Mutating a copy, leaving the input alone.
  const a = [...items];
  let state = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) | 0;
    const j = Math.abs(state) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
