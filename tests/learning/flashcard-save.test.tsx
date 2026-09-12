import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { TermCard } from "@/components/dictionary/TermCard";
import type { DictionaryTerm } from "@/types/dictionary";

const mocks = vi.hoisted(() => ({ put: vi.fn(), get: vi.fn() }));
vi.mock("@/lib/db/flashcards", () => ({ putCard: mocks.put, getCardByTermSlug: mocks.get }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
const term: DictionaryTerm = {
  slug: "bit",
  term: "Bit",
  aliases: [],
  category: "computing",
  phaseIds: ["0"],
  lessonIds: [],
  definitions: {
    beginner: "A binary digit",
    intermediate: "A binary digit",
    advanced: "A binary digit",
  },
  seeAlso: [],
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.get.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

it("shows a retryable failure instead of claiming an unsaved flashcard is in the deck", async () => {
  mocks.put.mockRejectedValueOnce(new Error("storage quota"));
  render(<TermCard term={term} difficulty="beginner" />);
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not save this card");
  expect(screen.queryByRole("button", { name: "In deck" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "In deck" })).toBeDisabled());
});
