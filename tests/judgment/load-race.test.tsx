import { expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { JudgmentCaseClient } from "@/components/judgment/JudgmentCaseClient";
import { JUDGMENT_CASES, JUDGMENT_RUBRICS, JUDGMENT_SOURCES } from "@/lib/judgment/cases";
import { createAttempt } from "@/lib/judgment/logic";
const mock = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn(async (): Promise<void> => {}) }));
vi.mock("@/lib/db/judgment", () => ({
  getJudgmentAttempts: mock.get,
  saveJudgmentAttempt: mock.save,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
it("equivalent refreshed case props do not replace an unsaved draft with the last persisted version", async () => {
  const scenario = JUDGMENT_CASES[0];
  mock.get.mockResolvedValue([createAttempt(scenario)]);
  const { rerender } = render(
    <JudgmentCaseClient scenario={scenario} rubrics={JUDGMENT_RUBRICS} sources={JUDGMENT_SOURCES} />
  );
  await screen.findByRole("button", { name: "Commit initial decision and reveal new evidence" });
  const field = screen.getAllByRole("textbox")[0];
  fireEvent.change(field, {
    target: { value: "Unsaved reasoning must survive a same-case server refresh." },
  });
  expect(field).toHaveValue("Unsaved reasoning must survive a same-case server refresh.");
  await act(async (): Promise<void> => {
    rerender(
      <JudgmentCaseClient
        scenario={{ ...scenario }}
        rubrics={JUDGMENT_RUBRICS}
        sources={JUDGMENT_SOURCES}
      />
    );
  });
  expect(screen.getAllByRole("textbox")[0]).toHaveValue(
    "Unsaved reasoning must survive a same-case server refresh."
  );
});
