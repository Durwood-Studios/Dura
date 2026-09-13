import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JUDGMENT_CASES, JUDGMENT_RUBRICS, JUDGMENT_SOURCES } from "@/lib/judgment/cases";
import { createAttempt } from "@/lib/judgment/logic";
import { JudgmentCaseClient } from "@/components/judgment/JudgmentCaseClient";
const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/db/judgment", () => ({
  getJudgmentAttempts: mocks.load,
  saveJudgmentAttempt: mocks.save,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
describe("judgment saving", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("retains an editable draft and does not reveal evidence when the commit write fails", async () => {
    const scenario = JUDGMENT_CASES[0];
    const attempt = createAttempt(scenario);
    attempt.initial = {
      optionId: scenario.options[0].id,
      standardIds: [scenario.standards[0].sourceId],
      confidence: 50,
      constraints: "Specific constraints with evidence",
      evidence: "Specific observations and assumptions",
      tradeoffs: "Compare alternatives and specific costs",
      standardReasoning: "Apply the source to this exact constraint",
      validationPlan: "Measure latency and test recovery before release",
      stopRule: "Stop immediately if the safety bound fails",
    };
    mocks.load.mockResolvedValue([attempt]);
    mocks.save.mockRejectedValue(new Error("Storage unavailable"));
    render(
      <JudgmentCaseClient
        scenario={scenario}
        rubrics={JUDGMENT_RUBRICS}
        sources={JUDGMENT_SOURCES}
      />
    );
    const commit = await screen.findByRole("button", {
      name: "Commit initial decision and reveal new evidence",
    });
    fireEvent.click(commit);
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("Storage unavailable")
    );
    expect(
      screen.queryByRole("button", { name: "Commit revision and compare reasoning" })
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Commit initial decision and reveal new evidence" })
    ).toBeEnabled();
  });
  it("does not offer a different case's record in this case history", async () => {
    const scenario = JUDGMENT_CASES[0];
    mocks.load.mockResolvedValue([createAttempt(scenario), createAttempt(JUDGMENT_CASES[1])]);
    render(
      <JudgmentCaseClient
        scenario={scenario}
        rubrics={JUDGMENT_RUBRICS}
        sources={JUDGMENT_SOURCES}
      />
    );
    await screen.findByRole("button", { name: "Commit initial decision and reveal new evidence" });
    expect(screen.queryByText("Saved attempts for this case version")).toBeNull();
  });
});
