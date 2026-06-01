/**
 * Bridge between the diagnostic engine and the local FSRS scheduler.
 *
 * When a learner answers a diagnostic question, the engine produces an
 * EvaluationResult carrying an FSRS-compatible ReviewRating. This module
 * persists that rating against an FSRS card derived from the question —
 * either creating the card on first answer or updating an existing one —
 * so the question becomes part of the learner's spaced-repetition deck
 * and surfaces in the daily prescription.
 *
 * Everything stays local: getCard / putCard / logReview operate on the
 * encrypted IndexedDB store via the existing flashcards wrapper. The
 * diagnostic engine is pure; this module is the impure side that ties
 * its output to durable state.
 */

import { getCard, logReview, putCard } from "@/lib/db/flashcards";
import { createCard, schedule } from "@/lib/fsrs";
import { generateId } from "@/lib/utils";
import type { FlashCard } from "@/types/flashcard";
import type { EvaluationResult, MCQQuestion, Question, QuestionId } from "./types";

const CARD_ID_PREFIX = "diag-";

/** Deterministic mapping from a diagnostic question id to the FSRS card id. */
export function cardIdFor(questionId: QuestionId): string {
  return `${CARD_ID_PREFIX}${questionId}`;
}

/** Extracts the Phase tag from a question's tag list. Used as the card's
 *  lessonId so the existing getCardsByLesson() query returns diagnostic
 *  cards alongside lesson flashcards. */
function phaseTagFor(tags: readonly string[] | undefined): string | null {
  if (!tags) return null;
  return tags.find((t) => /^phase-/.test(t)) ?? null;
}

/** Build the back text from the correct answer plus optional explanation.
 *  The explanation appears under the answer on review so the learner sees
 *  the reasoning, not just the right text. */
function buildBack(question: MCQQuestion): string {
  const lines: string[] = [question.correct.text];
  if (question.correct.explanation) {
    lines.push("", question.correct.explanation);
  }
  if (question.workedSolution.steps.length > 0) {
    lines.push("", "Worked solution:");
    question.workedSolution.steps.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`);
    });
  }
  return lines.join("\n");
}

/** Create a fresh FSRS card seeded from a diagnostic question. */
export function materializeCard(question: MCQQuestion): FlashCard {
  return createCard({
    id: cardIdFor(question.id),
    front: question.prompt,
    back: buildBack(question),
    lessonId: phaseTagFor(question.tags),
    termSlug: question.id,
  });
}

/**
 * Persist a diagnostic answer to the local FSRS deck.
 *
 * On first answer: materializes a card, schedules it with the answer's
 * rating, writes the card + review log to IndexedDB.
 * On repeat answer: loads the existing card, schedules from its current
 * FSRS state, writes the update + a new review log.
 *
 * Tolerant of repeat-call races within a session — the resulting FSRS
 * state reflects the most recent answer.
 */
export async function recordDiagnosticAnswer(
  question: Question,
  result: EvaluationResult,
  now: number = Date.now()
): Promise<void> {
  if (question.kind !== "mcq") {
    throw new Error(`recordDiagnosticAnswer: unsupported question kind ${question.kind}`);
  }
  const id = cardIdFor(question.id);
  const existing = await getCard(id);
  const baseCard = existing ?? materializeCard(question);
  const { card: nextCard } = schedule(baseCard, result.rating, now);
  await putCard(nextCard);
  await logReview({
    id: generateId("review"),
    cardId: id,
    rating: result.rating,
    reviewedAt: now,
    elapsedDays: nextCard.elapsedDays,
    scheduledDays: nextCard.scheduledDays,
    state: nextCard.state,
  });
}
