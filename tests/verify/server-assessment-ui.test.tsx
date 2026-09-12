import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ServerAssessment } from "@/components/verify/ServerAssessment";
import { saveVerification } from "@/lib/verify/persistence";
vi.mock("@/lib/verify/persistence", () => ({ saveVerification: vi.fn() }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const start = {
  attempt: "challenge",
  expiresAt: Date.now() + 3600000,
  questions: [{ id: "q1", question: "Pick the answer", options: ["A", "B"], isMultiple: false }],
};
const claims = {
  version: 1,
  kind: "dura-server-scored-assessment",
  id: "a".repeat(64),
  phaseId: "0",
  phaseTitle: "Foundations",
  selfReportedName: "Learner",
  correctCount: 1,
  totalQuestions: 1,
  score: 1,
  passingScore: 0.8,
  attemptStartedAt: 1800000000000,
  questionBankDigest: "b".repeat(64),
  assessmentMode: "unproctored-unlimited-practice",
};
it("retains answers after a network failure and offers the signed link even if local persistence fails", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => start })
    .mockRejectedValueOnce(new Error("Offline: reconnect and retry"))
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        passed: true,
        correctCount: 1,
        totalQuestions: 1,
        score: 1,
        claims,
        credential: "signed-credential",
      }),
    });
  vi.stubGlobal("fetch", fetcher);
  vi.mocked(saveVerification).mockRejectedValueOnce(new Error("quota")).mockResolvedValueOnce();
  render(<ServerAssessment />);
  fireEvent.change(screen.getByRole("textbox", { name: "Self-reported name" }), {
    target: { value: "Learner" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Start online assessment" }));
  fireEvent.click(await screen.findByRole("radio", { name: "A" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit for server scoring" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Submit for server scoring" }));
  expect(
    await screen.findByRole("link", { name: "Open signed verification link" })
  ).toHaveAttribute("href", "/verify/issued?credential=signed-credential");
  expect(await screen.findByRole("button", { name: "Try saving again" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Try saving again" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Saved on this device");
  expect(saveVerification).toHaveBeenLastCalledWith(
    expect.objectContaining({ passed: true }),
    expect.objectContaining({ serverCredential: "signed-credential" })
  );
});
it("shows the optional server configuration failure without hiding local learning certificates", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Online issuance is not configured." }),
    })
  );
  render(<ServerAssessment />);
  fireEvent.change(screen.getByRole("textbox", { name: "Self-reported name" }), {
    target: { value: "Learner" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Start online assessment" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("not configured");
  expect(screen.getByRole("link", { name: "Local learning certificates" })).toHaveAttribute(
    "href",
    "/verify"
  );
});
