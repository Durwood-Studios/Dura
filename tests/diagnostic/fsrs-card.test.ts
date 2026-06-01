import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FlashCard } from "@/types/flashcard";

vi.mock("@/lib/db/flashcards", () => ({
  getCard: vi.fn(),
  putCard: vi.fn(),
  logReview: vi.fn(),
}));

vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    generateId: vi.fn((prefix: string) => `${prefix}_test123`),
  };
});

import { cardIdFor, materializeCard, recordDiagnosticAnswer } from "@/lib/diagnostic/fsrs-card";
import { getCard, logReview, putCard } from "@/lib/db/flashcards";
import { IEEE_754_DECIMAL, POSIX_SIGNAL_SAFETY } from "@/lib/diagnostic/examples";
import type { EvaluationResult } from "@/lib/diagnostic/types";

const SETTLED_RESULT: EvaluationResult = {
  correct: true,
  selectedText: "false",
  correctText: "false",
  worked: { steps: ["IEEE 754 binary64 cannot represent 0.1 or 0.2 exactly."] },
  rating: "good",
};

const WRONG_RESULT: EvaluationResult = {
  correct: false,
  selectedText: "true",
  correctText: "false",
  worked: { steps: ["IEEE 754 binary64 cannot represent 0.1 or 0.2 exactly."] },
  rating: "again",
};

beforeEach(() => {
  vi.mocked(getCard).mockReset();
  vi.mocked(putCard).mockReset();
  vi.mocked(logReview).mockReset();
});

describe("cardIdFor", () => {
  it("is deterministic and namespaced with the diag- prefix", () => {
    expect(cardIdFor("phase-1-ieee754-decimal-sum-01")).toBe("diag-phase-1-ieee754-decimal-sum-01");
  });
});

describe("materializeCard", () => {
  it("seeds a new FlashCard with the question prompt as front", () => {
    const card = materializeCard(IEEE_754_DECIMAL);
    expect(card.id).toBe("diag-phase-1-ieee754-decimal-sum-01");
    expect(card.front).toBe(IEEE_754_DECIMAL.prompt);
    expect(card.state).toBe("new");
    expect(card.reps).toBe(0);
  });

  it("includes the correct answer, explanation, and worked solution on the back", () => {
    const card = materializeCard(IEEE_754_DECIMAL);
    expect(card.back).toContain("false");
    expect(card.back).toContain("0.30000000000000004"); // from the explanation
    expect(card.back).toContain("Worked solution:");
    expect(card.back).toContain("1."); // first numbered step
  });

  it("pulls the Phase tag into lessonId for cross-deck filtering", () => {
    expect(materializeCard(IEEE_754_DECIMAL).lessonId).toBe("phase-1");
    expect(materializeCard(POSIX_SIGNAL_SAFETY).lessonId).toBe("phase-1");
  });

  it("uses the question id as the term slug", () => {
    expect(materializeCard(IEEE_754_DECIMAL).termSlug).toBe(IEEE_754_DECIMAL.id);
  });
});

describe("recordDiagnosticAnswer", () => {
  it("creates a new card on first answer and schedules with the result's rating", async () => {
    vi.mocked(getCard).mockResolvedValueOnce(undefined);

    await recordDiagnosticAnswer(IEEE_754_DECIMAL, SETTLED_RESULT, 1_700_000_000_000);

    expect(getCard).toHaveBeenCalledWith("diag-phase-1-ieee754-decimal-sum-01");
    expect(putCard).toHaveBeenCalledOnce();
    expect(logReview).toHaveBeenCalledOnce();

    const persistedCard = vi.mocked(putCard).mock.calls[0][0];
    expect(persistedCard.id).toBe("diag-phase-1-ieee754-decimal-sum-01");
    expect(persistedCard.reps).toBe(1);
    expect(persistedCard.lastReview).toBe(1_700_000_000_000);
    // First-answer rating "good" puts the card in "learning" state.
    expect(persistedCard.state).toBe("learning");
  });

  it("transitions to 'relearning' when the answer is wrong (rating: again)", async () => {
    vi.mocked(getCard).mockResolvedValueOnce(undefined);

    await recordDiagnosticAnswer(IEEE_754_DECIMAL, WRONG_RESULT, 1_700_000_000_000);

    const persistedCard = vi.mocked(putCard).mock.calls[0][0];
    expect(persistedCard.state).toBe("relearning");
    expect(persistedCard.lapses).toBe(1);
  });

  it("updates the existing card on repeat answer rather than recreating", async () => {
    const existing: FlashCard = {
      ...materializeCard(IEEE_754_DECIMAL),
      reps: 3,
      lapses: 0,
      state: "review",
      stability: 4.5,
      difficulty: 5,
      lastReview: 1_699_000_000_000,
      due: 1_699_500_000_000,
    };
    vi.mocked(getCard).mockResolvedValueOnce(existing);

    await recordDiagnosticAnswer(IEEE_754_DECIMAL, SETTLED_RESULT, 1_700_000_000_000);

    const persistedCard = vi.mocked(putCard).mock.calls[0][0];
    expect(persistedCard.id).toBe("diag-phase-1-ieee754-decimal-sum-01");
    expect(persistedCard.reps).toBe(4); // incremented from 3
    expect(persistedCard.lastReview).toBe(1_700_000_000_000);
  });

  it("logs a review record with the rating and reviewedAt", async () => {
    vi.mocked(getCard).mockResolvedValueOnce(undefined);

    await recordDiagnosticAnswer(IEEE_754_DECIMAL, SETTLED_RESULT, 1_700_000_000_000);

    const reviewLog = vi.mocked(logReview).mock.calls[0][0];
    expect(reviewLog.cardId).toBe("diag-phase-1-ieee754-decimal-sum-01");
    expect(reviewLog.rating).toBe("good");
    expect(reviewLog.reviewedAt).toBe(1_700_000_000_000);
  });
});
