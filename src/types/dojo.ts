/**
 * Dojo session types — stored in IDB `dojo-sessions` store (DB v6).
 */

export interface DojoSession {
  /** Unique session ID */
  id: string;
  /** Unix ms timestamp session started */
  startedAt: number;
  /** Unix ms timestamp session ended */
  completedAt: number;
  /** Inference tier used */
  tier: "T1" | "T3";
  /** Phase filter — undefined means mixed */
  phaseFilter?: string;
  /** Per-question results */
  results: DojoSessionResult[];
  /** Average score 1–10 */
  avgScore: number;
}

export interface DojoSessionResult {
  questionId: string;
  questionText: string;
  answer: string;
  score: number;
  gap: string;
  feedback: string;
  timeMs: number;
}
