/**
 * DURA Dojo Inference Layer
 *
 * Two-tier architecture:
 *
 *   T1 — Ollama (local, phi3.5:mini)
 *        Streams graded evaluation in real-time.
 *        Requires Ollama running at http://localhost:11434.
 *        Zero data leaves the device.
 *
 *   T3 — Fallback (offline / Ollama unavailable)
 *        Rule-based scoring against the existing question bank.
 *        Returns immediately with a deterministic score.
 *        No streaming, no AI.
 *
 * The tier is probed once per session and cached. Health checks happen
 * silently in the background — the learner never waits on a timeout.
 */

export type InferenceTier = "T1" | "T3";

export interface GradeResult {
  /** 1–10 score */
  score: number;
  /** One-sentence gap insight */
  gap: string;
  /** Full AI feedback text */
  feedback: string;
  tier: InferenceTier;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onScore: (score: number) => void;
  onGap: (gap: string) => void;
  onDone: (result: GradeResult) => void;
  onError: (err: Error) => void;
}

const OLLAMA_BASE = "http://localhost:11434";
const MODEL = "phi3.5:mini";
const HEALTH_TIMEOUT_MS = 1500;

/** Probe Ollama availability — resolves true/false, never throws. */
export async function probeOllama(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return false;
    const data = (await res.json()) as { models?: { name: string }[] };
    // Check the model is actually available
    return (data.models ?? []).some((m) => m.name === MODEL || m.name === `${MODEL}:latest`);
  } catch {
    return false;
  }
}

/**
 * Build the grading prompt for a Dojo question.
 */
function buildPrompt(question: string, answer: string): string {
  return `You are a rigorous engineering instructor grading a student's answer.

Question: ${question}

Student's answer: ${answer}

Grade this answer on a scale of 1-10 where:
- 9-10: Complete, precise, demonstrates deep understanding
- 7-8: Correct with minor gaps or imprecision
- 5-6: Partially correct, missing important concepts
- 3-4: Shows some understanding but significant gaps
- 1-2: Incorrect or demonstrates fundamental misunderstanding

Respond in this exact format:
SCORE: [number 1-10]
GAP: [one sentence identifying the most important concept the student missed or could improve]
FEEDBACK: [2-3 sentences of specific, actionable feedback]

Be direct and specific. Do not pad with praise.`;
}

/**
 * Parse score from streaming content as it arrives.
 * Returns null if not yet parseable.
 */
function parseScore(content: string): number | null {
  const match = content.match(/SCORE:\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return Math.max(1, Math.min(10, Math.round(n)));
}

/**
 * Parse gap from completed content.
 */
function parseGap(content: string): string {
  const match = content.match(/GAP:\s*(.+?)(?:\n|FEEDBACK:|$)/);
  return match?.[1]?.trim() ?? "";
}

/**
 * Parse feedback from completed content.
 */
function parseFeedback(content: string): string {
  const idx = content.indexOf("FEEDBACK:");
  if (idx === -1) return content.trim();
  return content.slice(idx + 9).trim();
}

/**
 * Grade via T1 (Ollama streaming).
 * Calls callbacks as tokens arrive; calls onDone with full result.
 */
export async function gradeViaOllama(
  question: string,
  answer: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const prompt = buildPrompt(question, answer);
  let fullContent = "";
  let scoreEmitted = false;

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: true,
        options: { temperature: 0.1, top_p: 0.9, num_predict: 300 },
      }),
    });

    if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line) as { response?: string; done?: boolean };
          if (json.response) {
            fullContent += json.response;
            callbacks.onToken(json.response);

            // Emit score as soon as we can parse it from the stream
            if (!scoreEmitted) {
              const score = parseScore(fullContent);
              if (score !== null) {
                scoreEmitted = true;
                callbacks.onScore(score);
              }
            }
          }
        } catch {
          // Malformed line — skip
        }
      }
    }

    const score = parseScore(fullContent) ?? 5;
    const gap = parseGap(fullContent);
    const feedback = parseFeedback(fullContent);
    callbacks.onGap(gap);
    callbacks.onDone({ score, gap, feedback, tier: "T1" });
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * T3 fallback — rule-based scoring.
 *
 * For MCQ questions from the existing question bank, compares the
 * answer text against the correct option. For open-ended questions,
 * scores based on keyword overlap with the correct answer.
 *
 * Returns immediately (no streaming).
 */
export function gradeViaFallback(
  question: string,
  answer: string,
  correctAnswer?: string
): GradeResult {
  if (!answer.trim()) {
    return {
      score: 1,
      gap: "No answer provided.",
      feedback: "You didn't submit an answer. Try again.",
      tier: "T3",
    };
  }

  // Keyword overlap scoring
  const normalize = (s: string): string[] =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const answerWords = new Set(normalize(answer));

  if (correctAnswer) {
    const correctWords = normalize(correctAnswer);
    if (correctWords.length === 0) {
      return { score: 5, gap: "Answer evaluated.", feedback: "Answer recorded.", tier: "T3" };
    }
    const hits = correctWords.filter((w) => answerWords.has(w)).length;
    const ratio = hits / correctWords.length;
    const score = Math.max(1, Math.min(10, Math.round(ratio * 10)));
    const gap =
      score >= 8
        ? "Strong answer — minor detail may be missing."
        : score >= 5
          ? "You have the core concept but missed some key details."
          : "Review the key concepts for this topic.";
    return {
      score,
      gap,
      feedback: `Your answer covered ${Math.round(ratio * 100)}% of the expected concepts. ${gap}`,
      tier: "T3",
    };
  }

  // No correct answer available — score presence of technical vocabulary
  const techTerms = answerWords.size;
  const score = Math.min(10, Math.max(1, Math.round((techTerms / 5) * 6) + 2));
  return {
    score,
    gap: "Offline grading — connect Ollama for detailed feedback.",
    feedback: `Answer recorded. Offline scoring based on response depth. Start Ollama with 'ollama run ${MODEL}' for AI grading.`,
    tier: "T3",
  };
}
