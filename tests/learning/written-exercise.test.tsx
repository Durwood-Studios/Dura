import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WrittenExercise } from "@/components/lesson/WrittenExercise";
import { useProgressStore } from "@/stores/progress";
import { getOwnerGeneration, selectStorageOwner } from "@/lib/storage/owner";
import { putLessonProgress } from "@/lib/db/progress";
import type { LessonProgress } from "@/types/curriculum";
vi.mock("@/lib/db/progress", () => ({
  putLessonProgress: vi.fn(async (): Promise<void> => {}),
  getLessonProgress: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn(async (): Promise<void> => {}) }));
const props = {
  activityId: "written:test",
  activityLessonId: "1/1-1/01",
  instructions: "Compare a cached result with a fresh result.",
  rubric: ["Name the freshness bound."],
  modelAnswer: "Use a short TTL when stale data is tolerable.",
};
function progress(response?: string): LessonProgress {
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
    activityEvidence:
      response === undefined
        ? {}
        : {
            [props.activityId]: {
              kind: "self-reviewed",
              updatedAt: 1,
              completedAt: null,
              response,
            },
          },
  };
}
beforeEach((): void => {
  localStorage.clear();
  selectStorageOwner(null);
  useProgressStore.setState({ current: progress(), currentOwnerGeneration: getOwnerGeneration() });
  vi.mocked(putLessonProgress).mockReset().mockResolvedValue();
});
afterEach((): void => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
it("persists through canonical lesson evidence and never reads or rewrites unowned plaintext legacy drafts", async (): Promise<void> => {
  const legacy = `dura:written:${encodeURIComponent(`Practice and review|${props.instructions}`)}`;
  localStorage.setItem(legacy, "Another learner's old response");
  const view = render(<WrittenExercise {...props} />);
  expect(screen.getByRole("textbox")).toHaveValue("");
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "A 30-second TTL bounds staleness." },
  });
  await waitFor(() => expect(putLessonProgress).toHaveBeenCalled());
  await waitFor(() => expect(screen.queryByText("Saving your response…")).not.toBeInTheDocument());
  expect(localStorage.getItem(legacy)).toBe("Another learner's old response");
  view.unmount();
  render(<WrittenExercise {...props} />);
  expect(screen.getByRole("textbox")).toHaveValue("A 30-second TTL bounds staleness.");
});
it("clears component drafts and hides stale same-lesson evidence after an owner change", async (): Promise<void> => {
  selectStorageOwner("A");
  useProgressStore.setState({
    current: progress("Private A"),
    currentOwnerGeneration: getOwnerGeneration(),
  });
  const view = render(<WrittenExercise {...props} />);
  expect(screen.getByRole("textbox")).toHaveValue("Private A");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Unsaved A" } });
  await act(async (): Promise<void> => {
    selectStorageOwner("B");
    view.rerender(<WrittenExercise {...props} />);
  });
  expect(screen.getByRole("textbox")).toHaveValue("");
  act(() => {
    useProgressStore.setState({
      current: progress("Private B"),
      currentOwnerGeneration: getOwnerGeneration(),
    });
  });
  expect(screen.getByRole("textbox")).toHaveValue("Private B");
});
it("retains a failed draft over optimistic rollback and allows an explicit retry", async (): Promise<void> => {
  vi.spyOn(console, "error").mockImplementation((): void => {});
  vi.mocked(putLessonProgress).mockRejectedValueOnce(new Error("quota"));
  useProgressStore.setState({ current: progress("Old saved response") });
  render(<WrittenExercise {...props} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "New unsaved response" } });
  await screen.findByRole("alert");
  expect(screen.getByRole("textbox")).toHaveValue("New unsaved response");
  expect(useProgressStore.getState().current?.activityEvidence?.[props.activityId]?.response).toBe(
    "Old saved response"
  );
  fireEvent.click(screen.getByRole("button", { name: "Retry saving" }));
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  expect(useProgressStore.getState().current?.activityEvidence?.[props.activityId]?.response).toBe(
    "New unsaved response"
  );
});
it("keeps early typing ahead of late hydration and saves it when the lesson becomes ready", async (): Promise<void> => {
  useProgressStore.setState({ current: null });
  render(<WrittenExercise {...props} />);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Typed before lesson hydration" },
  });
  expect(putLessonProgress).not.toHaveBeenCalled();
  act(() => {
    useProgressStore.setState({ current: progress("Older stored response") });
  });
  expect(screen.getByRole("textbox")).toHaveValue("Typed before lesson hydration");
  await waitFor(() => expect(putLessonProgress).toHaveBeenCalled());
  expect(useProgressStore.getState().current?.activityEvidence?.[props.activityId]?.response).toBe(
    "Typed before lesson hydration"
  );
});
it("examples without authored activity IDs remain ephemeral and say so", (): void => {
  render(
    <WrittenExercise
      instructions="Explain a tradeoff"
      rubric={["State a criterion"]}
      modelAnswer="Compare two choices"
    />
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Temporary example response" },
  });
  expect(screen.getByRole("textbox")).toHaveValue("Temporary example response");
  expect(screen.getByText(/no saved lesson context/)).toBeVisible();
  expect(putLessonProgress).not.toHaveBeenCalled();
  expect(
    [...Array(localStorage.length)].some((_, index) =>
      localStorage.key(index)?.startsWith("dura:written:")
    )
  ).toBe(false);
});

function isRefreshProtected(): boolean {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}
it("protects pending and failed responses until the newest response is acknowledged", async (): Promise<void> => {
  vi.spyOn(console, "error").mockImplementation((): void => {});
  let finishFirst: () => void = (): void => {};
  vi.mocked(putLessonProgress)
    .mockImplementationOnce(
      (): Promise<void> =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        })
    )
    .mockRejectedValueOnce(new Error("quota"));
  const view = render(<WrittenExercise {...props} />);
  expect(isRefreshProtected()).toBe(false);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "First draft" } });
  expect(isRefreshProtected()).toBe(true);
  await waitFor(() => expect(putLessonProgress).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Newest draft" } });
  await act(async (): Promise<void> => {
    finishFirst();
  });
  await screen.findByRole("alert");
  expect(isRefreshProtected()).toBe(true);
  expect(screen.getByRole("textbox")).toHaveValue("Newest draft");
  fireEvent.click(screen.getByRole("button", { name: "Retry saving" }));
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  expect(isRefreshProtected()).toBe(false);
  view.unmount();
  expect(isRefreshProtected()).toBe(false);
});
it("protects early drafts before hydration and removes its listener on unmount", (): void => {
  useProgressStore.setState({ current: null });
  const view = render(<WrittenExercise {...props} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Still loading draft" } });
  expect(isRefreshProtected()).toBe(true);
  view.unmount();
  expect(isRefreshProtected()).toBe(false);
});
