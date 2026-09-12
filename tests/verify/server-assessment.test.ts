import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  startServerAssessment,
  submitServerAssessment,
  verifyIssuedCredential,
  ASSESSMENT_SESSION_COOKIE,
} from "@/lib/verify/assessment-server";
import { POST as startRoute } from "@/app/api/verify/assessment/start/route";
import { POST as submitRoute } from "@/app/api/verify/assessment/submit/route";
import { getQuestionsByPhase } from "@/content/questions";

const SESSION = "a".repeat(64);
const NOW = 1800000000000;
function passingAnswers(
  attempt: ReturnType<typeof startServerAssessment>
): { questionId: string; selected: number[] }[] {
  const pool = getQuestionsByPhase("0");
  return attempt.questions.map((q) => {
    const expected = pool.find((entry) => entry.id === q.id)!;
    return {
      questionId: q.id,
      selected: Array.isArray(expected.correct) ? expected.correct : [expected.correct],
    };
  });
}
function mutatePayload(token: string, patch: Record<string, unknown>): string {
  const [payload, signature] = token.split(".");
  return `${Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url").toString()), ...patch })).toString("base64url")}.${signature}`;
}
beforeEach(() => {
  vi.stubEnv("VERIFICATION_HMAC_SECRET", "local-test-only-key".repeat(4));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("server-scored credential authority", () => {
  it("selects questions without shipping answers and signs all passing claims", () => {
    const attempt = startServerAssessment(
      { phaseId: "0", displayName: "  Learner  " },
      SESSION,
      NOW
    );
    expect(attempt.questions.length).toBe(30);
    expect(attempt.questions[0]).not.toHaveProperty("correct");
    const payload = JSON.parse(Buffer.from(attempt.attempt.split(".")[0], "base64url").toString());
    expect(payload).not.toHaveProperty("answers");
    expect(payload).not.toHaveProperty("correct");
    const body = { attempt: attempt.attempt, answers: passingAnswers(attempt) };
    const result = submitServerAssessment(body, SESSION, NOW + 1000);
    expect(result).toMatchObject({ passed: true, score: 1, correctCount: 30 });
    const claims = verifyIssuedCredential(result.credential!);
    expect(claims).toMatchObject({
      selfReportedName: "Learner",
      score: 1,
      assessmentMode: "unproctored-unlimited-practice",
      attemptStartedAt: NOW,
    });
    expect(submitServerAssessment(body, SESSION, NOW + 2000).credential).toBe(result.credential);
    expect(() =>
      verifyIssuedCredential(
        mutatePayload(result.credential!, { selfReportedName: "Someone else" })
      )
    ).toThrow("could not be verified");
    expect(() =>
      verifyIssuedCredential(mutatePayload(result.credential!, { phaseTitle: "Different claim" }))
    ).toThrow("could not be verified");
    expect(() => verifyIssuedCredential(attempt.attempt)).toThrow("could not be verified");
  });
  it("rejects tampered attempts, wrong browser binding, expired challenges and arbitrary scores", () => {
    const attempt = startServerAssessment({ phaseId: "0", displayName: "Learner" }, SESSION, NOW);
    const body = { attempt: attempt.attempt, answers: passingAnswers(attempt) };
    expect(() => submitServerAssessment(body, "b".repeat(64), NOW + 100)).toThrow(
      "different browser"
    );
    expect(() => submitServerAssessment(body, SESSION, NOW + 3600001)).toThrow("expired");
    expect(() => submitServerAssessment({ ...body, score: 1 }, SESSION, NOW + 100)).toThrow(
      "malformed"
    );
    expect(() =>
      submitServerAssessment(
        { ...body, attempt: mutatePayload(body.attempt, { selfReportedName: "Forged" }) },
        SESSION,
        NOW + 100
      )
    ).toThrow("could not be verified");
  });
  it("does not issue a credential for an empty answer set, duplicate question IDs or duplicate choices", () => {
    const attempt = startServerAssessment({ phaseId: "0", displayName: "Learner" }, SESSION, NOW);
    const answers = attempt.questions.map((q) => ({ questionId: q.id, selected: [] }));
    expect(
      submitServerAssessment({ attempt: attempt.attempt, answers }, SESSION, NOW + 100)
    ).toEqual({ passed: false, correctCount: 0, totalQuestions: 30, score: 0 });
    const valid = passingAnswers(attempt);
    expect(() =>
      submitServerAssessment(
        { attempt: attempt.attempt, answers: [valid[0], ...valid.slice(0, -1)] },
        SESSION,
        NOW + 100
      )
    ).toThrow("one answer");
    expect(() =>
      submitServerAssessment(
        {
          attempt: attempt.attempt,
          answers: [{ ...valid[0], selected: [0, 0] }, ...valid.slice(1)],
        },
        SESSION,
        NOW + 100
      )
    ).toThrow("invalid");
  });
  it("cannot issue credentials when the server signing authority is unconfigured", () => {
    vi.stubEnv("VERIFICATION_HMAC_SECRET", "");
    expect(() =>
      startServerAssessment({ phaseId: "0", displayName: "Learner" }, SESSION, NOW)
    ).toThrow("not configured");
  });
  it("binds route submission to an HttpOnly same-site cookie and never caches responses", async () => {
    const response = await startRoute(
      new NextRequest("https://dura.test/api/verify/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", origin: "https://dura.test" },
        body: JSON.stringify({ phaseId: "0", displayName: "Learner" }),
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const cookie = response.cookies.get(ASSESSMENT_SESSION_COOKIE)!;
    expect(cookie).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/verify/assessment",
    });
    const attempt = await response.json();
    const body = { attempt: attempt.attempt, answers: passingAnswers(attempt) };
    const missing = await submitRoute(
      new NextRequest("https://dura.test/api/verify/assessment/submit", {
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    expect(missing.status).toBe(403);
    const completed = await submitRoute(
      new NextRequest("https://dura.test/api/verify/assessment/submit", {
        method: "POST",
        headers: { cookie: `${ASSESSMENT_SESSION_COOKIE}=${cookie.value}` },
        body: JSON.stringify(body),
      })
    );
    expect(completed.status).toBe(200);
    expect((await completed.json()).passed).toBe(true);
  });
  it("rejects foreign origins and oversized chunked bodies before parsing", async () => {
    const foreign = await startRoute(
      new NextRequest("https://dura.test/api/verify/assessment/start", {
        method: "POST",
        headers: { origin: "https://attacker.test" },
        body: "{}",
      })
    );
    expect(foreign.status).toBe(403);
    const oversized = await startRoute(
      new NextRequest("https://dura.test/api/verify/assessment/start", {
        method: "POST",
        body: JSON.stringify({ displayName: "x".repeat(2000), phaseId: "0" }),
      })
    );
    expect(oversized.status).toBe(413);
  });
});
