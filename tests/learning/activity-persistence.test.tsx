import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Quiz } from "@/components/lesson/Quiz";
import { useProgressStore } from "@/stores/progress";
import { getOwnerGeneration, selectStorageOwner } from "@/lib/storage/owner";
import { putLessonProgress } from "@/lib/db/progress";
import type { LessonProgress } from "@/types/curriculum";
vi.mock("@/lib/db/progress", () => ({
  putLessonProgress: vi.fn(async (): Promise<void> => {}),
  getLessonProgress: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn(async (): Promise<void> => {}) }));
vi.mock("@/lib/xp-manager", () => ({ awardXPWithToast: vi.fn(async (): Promise<number> => 0) }));
const props = {
  activityId: "quiz:test",
  activityLessonId: "1/1-1/01",
  question: "Which choice is correct?",
  options: ["First", "Second"],
  answer: 0,
};
function progress(): LessonProgress {
  return {
    lessonId: props.activityLessonId,
    phaseId: "1",
    moduleId: "1-1",
    startedAt: 1,
    completedAt: null,
    scrollPercent: 0,
    timeSpentMs: 0,
    quizPassed: false,
    quizScore: null,
    xpEarned: 0,
    synced: 0,
  };
}
beforeEach((): void => {
  localStorage.clear();
  selectStorageOwner(null);
  useProgressStore.setState({ current: null, currentOwnerGeneration: getOwnerGeneration() });
  vi.mocked(putLessonProgress).mockReset().mockResolvedValue();
});
afterEach((): void => {
  cleanup();
  vi.restoreAllMocks();
});
it("retains early quiz answers and waits for the authored lesson before finishing", async (): Promise<void> => {
  render(<Quiz {...props} />);
  fireEvent.click(screen.getByRole("button", { name: /^First$/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Submit$/ }));
  expect(screen.getByRole("button", { name: "Waiting for lesson to load…" })).toBeDisabled();
  expect(putLessonProgress).not.toHaveBeenCalled();
  act(() => {
    useProgressStore.setState({ current: progress() });
  });
  fireEvent.click(screen.getByRole("button", { name: /^Finish$/ }));
  await waitFor(() =>
    expect(
      useProgressStore.getState().current?.activityEvidence?.[props.activityId]?.completedAt
    ).toEqual(expect.any(Number))
  );
  expect(useProgressStore.getState().current?.quizScore).toBe(1);
});
it("shows a persistence failure alongside the quiz result and retries without losing answers", async (): Promise<void> => {
  vi.spyOn(console, "error").mockImplementation((): void => {});
  let fail = true;
  vi.mocked(putLessonProgress).mockImplementation(async (record): Promise<void> => {
    if (record.activityEvidence && fail) {
      fail = false;
      throw new Error("quota");
    }
  });
  useProgressStore.setState({ current: progress() });
  render(<Quiz {...props} />);
  fireEvent.click(screen.getByRole("button", { name: /^First$/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Submit$/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Finish$/ }));
  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toHaveTextContent("could not be saved");
  fireEvent.click(screen.getByRole("button", { name: "Retry saving quiz" }));
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  expect(useProgressStore.getState().current?.activityEvidence?.[props.activityId]?.score).toBe(1);
});

it("an unscoped example quiz cannot credit the previously opened lesson", async (): Promise<void> => {
  useProgressStore.setState({ current: progress(), quizPassed: false, quizScore: null });
  render(<Quiz question="Example only" options={["First", "Second"]} answer={0} />);
  fireEvent.click(screen.getByRole("button", { name: /^First$/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Submit$/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Finish$/ }));
  await act(async (): Promise<void> => {});
  expect(putLessonProgress).not.toHaveBeenCalled();
  expect(useProgressStore.getState().quizPassed).toBe(false);
  expect(useProgressStore.getState().current?.quizScore).toBeNull();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
