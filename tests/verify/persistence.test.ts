import { afterEach, expect, it, vi } from "vitest";
import { saveVerification } from "@/lib/verify/persistence";
import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { AssessmentResult, Certificate } from "@/types/assessment";
vi.mock("@/lib/db", () => ({ getDB: vi.fn() }));
vi.mock("@/lib/storage/shadow-write", () => ({ triggerShadowWrite: vi.fn() }));
afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});
const result: AssessmentResult = {
  id: "result",
  type: "phase-verification",
  targetId: "0",
  score: 1,
  totalQuestions: 1,
  correctCount: 1,
  passed: true,
  startedAt: 0,
  completedAt: 1,
  timeSpentMs: 1,
  questionResults: [],
};
const certificate: Certificate = {
  id: "cert",
  phaseId: "0",
  userId: null,
  displayName: "Learner",
  phaseTitle: "Basics",
  score: 1,
  totalQuestions: 1,
  completedAt: 1,
  verificationHash: "a".repeat(64),
  standards: [],
};
it("writes result and certificate in a single transaction before shadow backup", async () => {
  const put = vi.fn().mockResolvedValue(undefined);
  const transaction = vi.fn(() => ({ objectStore: () => ({ put }), done: Promise.resolve() }));
  vi.mocked(getDB).mockResolvedValue({ transaction } as unknown as Awaited<
    ReturnType<typeof getDB>
  >);
  await saveVerification(result, certificate);
  expect(transaction).toHaveBeenCalledWith(["assessment-results", "certificates"], "readwrite");
  expect(put).toHaveBeenCalledWith(result);
  expect(put).toHaveBeenCalledWith(certificate);
  expect(triggerShadowWrite).toHaveBeenCalledOnce();
});
it("propagates failed transaction completion instead of celebrating a save", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const transaction = vi.fn(() => ({
    objectStore: () => ({ put: vi.fn().mockResolvedValue(undefined) }),
    done: Promise.reject(new Error("quota")),
  }));
  vi.mocked(getDB).mockResolvedValue({ transaction } as unknown as Awaited<
    ReturnType<typeof getDB>
  >);
  await expect(saveVerification(result, certificate)).rejects.toThrow("could not be saved");
  expect(triggerShadowWrite).not.toHaveBeenCalled();
});
