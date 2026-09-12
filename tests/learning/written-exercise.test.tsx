import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WrittenExercise } from "@/components/lesson/WrittenExercise";

vi.mock("@/lib/storage/reset-coordination", () => ({ assertCurrentStorageGeneration: vi.fn() }));
afterEach((): void => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

it("keeps the learner draft across remounts without claiming an automated grade", (): void => {
  const props = {
    instructions: "Compare a cached result with a fresh result.",
    rubric: ["Name the freshness bound."],
    modelAnswer: "Use a short TTL when stale data is tolerable.",
  };
  const view = render(<WrittenExercise {...props} />);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "A 30-second TTL bounds staleness." },
  });
  view.unmount();
  render(<WrittenExercise {...props} />);
  expect(screen.getByRole("textbox")).toHaveValue("A 30-second TTL bounds staleness.");
  expect(screen.getByText(/does not award an automated score/)).toBeVisible();
  expect(screen.getByRole("checkbox", { name: "Name the freshness bound." })).toBeVisible();
});

it("preserves the visible draft and reports storage failure", (): void => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation((): never => {
    throw new Error("quota");
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <WrittenExercise
      instructions="Describe rollback evidence."
      rubric={["Include a trigger."]}
      modelAnswer="Roll back on a sustained error increase."
    />
  );
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Use error-rate alerts." } });
  expect(screen.getByRole("textbox")).toHaveValue("Use error-rate alerts.");
  expect(screen.getByRole("alert")).toHaveTextContent("could not be saved");
});
