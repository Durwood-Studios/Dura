import { selectVerificationQuestions } from "@/lib/assessment";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getQuestionsByPhase } from "@/content/questions";
import { getPhase } from "@/content/phases";
import {
  START_ASSESSMENT_SCHEMA,
  SUBMIT_ASSESSMENT_SCHEMA,
  CREDENTIAL_SCHEMA,
} from "@/lib/verify/assessment-contract";
import type {
  AssessmentStart,
  AssessmentSubmission,
  IssuedCredential,
} from "@/lib/verify/assessment-contract";
import type { AssessmentQuestion } from "@/types/assessment";

export const ASSESSMENT_SESSION_COOKIE = "dura-assessment-session";
const ATTEMPT_DURATION_MS = 60 * 60 * 1000;
const ATTEMPT_PURPOSE = "dura.assessment.attempt.v1";
const CREDENTIAL_PURPOSE = "dura.assessment.credential.v1";
const ATTEMPT_SCHEMA = z
  .object({
    version: z.literal(1),
    id: z.string().regex(/^[a-f0-9]{32}$/),
    phaseId: START_ASSESSMENT_SCHEMA.shape.phaseId,
    selfReportedName: START_ASSESSMENT_SCHEMA.shape.displayName,
    sessionDigest: z.string().regex(/^[a-f0-9]{64}$/),
    startedAt: z.number().int().nonnegative(),
    expiresAt: z.number().int().positive(),
    questionIds: z.array(z.string()).min(1).max(30),
    bankDigest: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

/** Human-readable request failure with an explicit HTTP status. */
export class AssessmentRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

function signingKey(): string {
  const key = process.env.VERIFICATION_HMAC_SECRET;
  if (!key || key.length < 32)
    throw new AssessmentRequestError(
      "Online assessment issuance is not configured. Local assessments remain available.",
      503
    );
  return key;
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
function sign(payload: unknown, purpose: string): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", signingKey())
    .update(`${purpose}.${encoded}`)
    .digest("base64url");
  return `${encoded}.${signature}`;
}
function verify(token: string, purpose: string): unknown {
  const key = signingKey();
  if (token.length > 8192 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token))
    throw new AssessmentRequestError("This signed record is malformed.", 400);
  const [encoded, signature] = token.split(".");
  const expected = createHmac("sha256", key).update(`${purpose}.${encoded}`).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected))
    throw new AssessmentRequestError("This signed record could not be verified.", 400);
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as unknown;
  } catch {
    throw new AssessmentRequestError("This signed record is malformed.", 400);
  }
}
function bankDigest(questions: AssessmentQuestion[]): string {
  return digest(
    JSON.stringify(
      questions.map((q): unknown => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct: q.correct,
        type: q.type,
      }))
    )
  );
}

/** Create an opaque browser binding; it never identifies a person or account. */
export function createAssessmentSession(): string {
  return randomBytes(32).toString("hex");
}

/** Start a bounded attempt from server-selected questions, exposing no answer key. */
export function startServerAssessment(
  input: unknown,
  session: string,
  now: number = Date.now()
): AssessmentStart {
  signingKey();
  const parsed = START_ASSESSMENT_SCHEMA.safeParse(input);
  if (!parsed.success)
    throw new AssessmentRequestError("Choose a phase and enter a name of 1–80 characters.", 400);
  const pool = getQuestionsByPhase(parsed.data.phaseId);
  if (!pool.length || new Set(pool.map((q): string => q.id)).size !== pool.length)
    throw new AssessmentRequestError("This phase's question bank is unavailable.", 503);
  const questions = selectVerificationQuestions(
    parsed.data.phaseId,
    pool,
    30,
    (): number => randomInt(0x100000000) / 0x100000000
  );
  if (!questions.length)
    throw new AssessmentRequestError("This phase's coverage blueprint is unavailable.", 503);
  const expiresAt = now + ATTEMPT_DURATION_MS;
  return {
    attempt: sign(
      {
        version: 1,
        id: randomBytes(16).toString("hex"),
        phaseId: parsed.data.phaseId,
        selfReportedName: parsed.data.displayName,
        sessionDigest: digest(session),
        startedAt: now,
        expiresAt,
        questionIds: questions.map((q): string => q.id),
        bankDigest: bankDigest(questions),
      },
      ATTEMPT_PURPOSE
    ),
    expiresAt,
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      isMultiple: q.type === "multiple-select",
    })),
  };
}

/** Grade only the signed server question set, then sign every displayed credential claim. */
export function submitServerAssessment(
  input: unknown,
  session: string,
  now: number = Date.now()
): AssessmentSubmission {
  const parsed = SUBMIT_ASSESSMENT_SCHEMA.safeParse(input);
  if (!parsed.success)
    throw new AssessmentRequestError("The submitted answers are malformed.", 400);
  const checked = ATTEMPT_SCHEMA.safeParse(verify(parsed.data.attempt, ATTEMPT_PURPOSE));
  if (!checked.success)
    throw new AssessmentRequestError("This assessment attempt is malformed.", 400);
  const attempt = checked.data;
  if (attempt.sessionDigest !== digest(session))
    throw new AssessmentRequestError(
      "This attempt belongs to a different browser session. Start a new assessment.",
      403
    );
  if (
    now > attempt.expiresAt ||
    now < attempt.startedAt ||
    attempt.expiresAt - attempt.startedAt !== ATTEMPT_DURATION_MS
  )
    throw new AssessmentRequestError("This attempt has expired. Start a new assessment.", 410);
  const pool = getQuestionsByPhase(attempt.phaseId);
  const questions = attempt.questionIds.map((id): AssessmentQuestion | undefined =>
    pool.find((q) => q.id === id)
  );
  if (questions.some((q) => !q))
    throw new AssessmentRequestError("The question bank changed. Start a new assessment.", 409);
  const resolved = questions.filter((q): q is AssessmentQuestion => q !== undefined);
  if (bankDigest(resolved) !== attempt.bankDigest)
    throw new AssessmentRequestError("The question bank changed. Start a new assessment.", 409);
  const answers = parsed.data.answers;
  if (
    answers.length !== resolved.length ||
    new Set(answers.map((a) => a.questionId)).size !== resolved.length
  )
    throw new AssessmentRequestError("Submit one answer entry for each question.", 400);
  let correctCount = 0;
  const canonicalAnswers: { questionId: string; selected: number[] }[] = [];
  for (const q of resolved) {
    const answer = answers.find((a) => a.questionId === q.id);
    if (
      !answer ||
      new Set(answer.selected).size !== answer.selected.length ||
      answer.selected.some((i) => i >= q.options.length) ||
      (q.type !== "multiple-select" && answer.selected.length > 1)
    )
      throw new AssessmentRequestError("One or more answer selections are invalid.", 400);
    const selected = [...answer.selected].sort((a, b) => a - b);
    const expected = (Array.isArray(q.correct) ? [...q.correct] : [q.correct]).sort(
      (a, b) => a - b
    );
    if (selected.length === expected.length && selected.every((v, i) => v === expected[i]))
      correctCount++;
    canonicalAnswers.push({ questionId: q.id, selected });
  }
  const totalQuestions = resolved.length;
  const score = correctCount / totalQuestions;
  const passed = score >= 0.8;
  if (!passed) return { passed, correctCount, totalQuestions, score };
  const claims: Omit<IssuedCredential, "id"> = {
    version: 1,
    kind: "dura-server-scored-assessment",
    phaseId: attempt.phaseId,
    phaseTitle: getPhase(attempt.phaseId)?.title ?? `Phase ${attempt.phaseId}`,
    selfReportedName: attempt.selfReportedName,
    correctCount,
    totalQuestions,
    score,
    passingScore: 0.8,
    attemptStartedAt: attempt.startedAt,
    questionBankDigest: attempt.bankDigest,
    assessmentMode: "unproctored-unlimited-practice",
  };
  const credential: IssuedCredential = {
    ...claims,
    id: digest(`${attempt.id}.${JSON.stringify({ claims, canonicalAnswers })}`),
  };
  return {
    passed,
    correctCount,
    totalQuestions,
    score,
    credential: sign(credential, CREDENTIAL_PURPOSE),
    claims: credential,
  };
}

/** Verify immutable credential claims without trusting local storage or registry rows. */
export function verifyIssuedCredential(token: string): IssuedCredential {
  const result = CREDENTIAL_SCHEMA.safeParse(verify(token, CREDENTIAL_PURPOSE));
  if (
    !result.success ||
    result.data.correctCount > result.data.totalQuestions ||
    result.data.score !== result.data.correctCount / result.data.totalQuestions
  )
    throw new AssessmentRequestError("This credential contains invalid claims.", 400);
  return result.data;
}
