import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyReview } from "@/lib/db/flashcards-review";
import { createCard } from "@/lib/fsrs";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  cardPut: vi.fn(),
  logPut: vi.fn(),
  shadow: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ getDB: async () => ({ transaction: mocks.transaction }) }));
vi.mock("@/lib/idb/active-key", () => ({ peekActiveKey: () => null }));
vi.mock("@/lib/storage/shadow-write", () => ({ triggerShadowWrite: mocks.shadow }));

describe("atomic review persistence", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockReturnValue({
      objectStore: (name: string) => ({
        put: name === "flashcards" ? mocks.cardPut : mocks.logPut,
      }),
      done: Promise.resolve(),
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("writes the card and review history in a single transaction", async () => {
    const card = createCard({ id: "review-card", front: "Question", back: "Answer" });
    const updated = await applyReview(card, "good");
    expect(mocks.transaction).toHaveBeenCalledWith(["flashcards", "reviewLogs"], "readwrite");
    expect(mocks.cardPut).toHaveBeenCalledWith(updated);
    expect(mocks.logPut).toHaveBeenCalledWith(
      expect.objectContaining({ cardId: card.id, rating: "good" })
    );
    expect(mocks.shadow).toHaveBeenCalledOnce();
  });

  it("reports failure and never reschedules a fake-success fallback", async () => {
    const card = createCard({ id: "review-card", front: "Question", back: "Answer" });
    mocks.logPut.mockRejectedValueOnce(new Error("quota"));
    await expect(applyReview(card, "good")).rejects.toThrow("could not be saved");
    expect(mocks.cardPut).toHaveBeenCalledOnce();
    expect(mocks.shadow).not.toHaveBeenCalled();
  });
});
