import { ALL_QUESTIONS } from "@/content/questions";
import { toCSV } from "@/lib/exports/csv";

/**
 * Quiz bank JSON export. Full schema, safe to re-import or reference
 * from any external grader. Strips no fields.
 */
export function quizBankJSON(): unknown {
  return {
    exportedAt: new Date().toISOString(),
    count: ALL_QUESTIONS.length,
    questions: ALL_QUESTIONS,
  };
}

/**
 * Quiz bank CSV — one row per question, options flattened into
 * semicolon-separated strings and answers as zero-indexed positions.
 * Useful for teachers who want to print or review the pool in a
 * spreadsheet without parsing JSON.
 */
export function quizBankCSV(): string {
  const rows = ALL_QUESTIONS.map((q) => ({
    id: q.id,
    phaseId: q.phaseId,
    moduleId: q.moduleId,
    type: q.type,
    difficulty: q.difficulty,
    question: q.question.replace(/\n/g, " "),
    options: q.options,
    correct: Array.isArray(q.correct) ? q.correct.join(";") : String(q.correct),
    explanation: q.explanation,
    tags: q.tags,
  }));
  return toCSV(rows, [
    "id",
    "phaseId",
    "moduleId",
    "type",
    "difficulty",
    "question",
    "options",
    "correct",
    "explanation",
    "tags",
  ]);
}
