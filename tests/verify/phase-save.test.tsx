import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PhaseTest } from "@/components/verify/PhaseTest";
import { saveVerification } from "@/lib/verify/persistence";
import type { AssessmentQuestion } from "@/types/assessment";
vi.mock("@/lib/db/assessments", () => ({ getLatestResult: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/db/certificates", () => ({ getCertificatesByPhase: vi.fn().mockResolvedValue([]) }));
vi.mock("@/lib/verify/persistence", () => ({ saveVerification: vi.fn() }));
vi.mock("@/lib/crypto", () => ({
  generateVerificationHash: vi.fn().mockResolvedValue("a".repeat(64)),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/xp-manager", () => ({ awardXPWithToast: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/components/motion/Confetti", () => ({ Confetti: () => null }));
afterEach(() => vi.restoreAllMocks());
const question: AssessmentQuestion = {
  id: "q",
  phaseId: "0",
  moduleId: "m",
  type: "multiple-choice",
  question: "Choose A",
  options: ["Option A", "Option B"],
  correct: 0,
  explanation: "A",
  difficulty: "easy",
  tags: [],
};
it("keeps an unsaved passing result retryable and publishes completion only after persistence", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(saveVerification).mockRejectedValueOnce(new Error("disk full")).mockResolvedValueOnce();
  render(<PhaseTest phaseId="0" phaseTitle="Basics" questionPool={[question]} />);
  fireEvent.click(await screen.findByRole("button", { name: "Start verification" }));
  fireEvent.click(screen.getByRole("button", { name: /Option A/ }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  fireEvent.click(screen.getByRole("button", { name: "Finish" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
  expect(screen.queryByRole("link", { name: "View certificate" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Try saving again" }));
  expect(await screen.findByRole("link", { name: "View certificate" })).toBeVisible();
  expect(saveVerification).toHaveBeenCalledTimes(2);
});
