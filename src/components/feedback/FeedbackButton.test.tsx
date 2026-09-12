import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { saveFeedback } from "@/lib/feedback/delivery";
vi.mock("@/lib/feedback/delivery", () => ({ saveFeedback: vi.fn() }));
afterEach(() => vi.restoreAllMocks());
it("announces a local save without claiming delivery and supports Escape", async () => {
  vi.mocked(saveFeedback).mockResolvedValue();
  render(<FeedbackButton />);
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Feedback message" }), {
    target: { value: "More guided practice" },
  });
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Send feedback" })
  );
  expect(await screen.findByRole("status")).toHaveTextContent("Saved on this device");
  expect(screen.queryByText("Sent!")).toBeNull();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("preserves the message and exposes a retry after storage fails", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(saveFeedback).mockRejectedValue(new Error("disk full"));
  render(<FeedbackButton />);
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "My report" } });
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Send feedback" })
  );
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("could not be saved"));
  expect(screen.getByRole("textbox")).toHaveValue("My report");
  expect(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Send feedback" })
  ).toBeEnabled();
});
