import { create } from "zustand";
import { getDueCards, getAllCards } from "@/lib/db/flashcards";
import { applyReview } from "@/lib/db/flashcards-review";
import { awardXPWithToast } from "@/lib/xp-manager";
import { extendStreak } from "@/lib/streak-manager";
import { XP_AWARDS } from "@/lib/xp";
import { track } from "@/lib/analytics";
import type { FlashCard, ReviewRating } from "@/types/flashcard";

export interface SessionStats {
  correct: number;
  wrong: number;
}

interface ReviewState {
  queue: FlashCard[];
  index: number;
  startedAt: number | null;
  flippedAt: number | null;
  dueCount: number;
  sessionStats: SessionStats;
  sessionComplete: boolean;
  loading: boolean;
  nextDue: number | null;
  earnedXP: number;
  isSaving: boolean;
  error: string | null;

  loadQueue: () => Promise<void>;
  flip: () => void;
  rate: (rating: ReviewRating) => Promise<void>;
  reset: () => void;
}

let queueGeneration = 0;

const RATING_VALUE: Record<ReviewRating, number> = { again: 1, hard: 2, good: 3, easy: 4 };

function findNextDue(cards: FlashCard[], now: number): number | null {
  let next: number | null = null;
  for (const card of cards) {
    if (card.due > now && (next === null || card.due < next)) next = card.due;
  }
  return next;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  queue: [],
  index: 0,
  startedAt: null,
  flippedAt: null,
  dueCount: 0,
  sessionStats: { correct: 0, wrong: 0 },
  sessionComplete: false,
  loading: false,
  nextDue: null,
  earnedXP: 0,
  isSaving: false,
  error: null,

  loadQueue: async () => {
    const generation = ++queueGeneration;
    set({ loading: true, error: null, isSaving: false, earnedXP: 0 });
    const due = await getDueCards();
    let nextDue: number | null = null;
    if (due.length === 0) {
      const all = await getAllCards();
      nextDue = findNextDue(all, Date.now());
    }
    if (generation !== queueGeneration) return;
    set({
      queue: due,
      index: 0,
      startedAt: due.length > 0 ? Date.now() : null,
      flippedAt: null,
      dueCount: due.length,
      sessionStats: { correct: 0, wrong: 0 },
      sessionComplete: due.length === 0,
      loading: false,
      nextDue,
    });
  },

  flip: () => {
    if (get().flippedAt !== null) return;
    set({ flippedAt: Date.now() });
  },

  rate: async (rating: ReviewRating): Promise<void> => {
    const generation = queueGeneration;
    const state = get();
    const card = state.queue[state.index];
    if (!card || state.isSaving || state.flippedAt === null) return;
    set({ isSaving: true, error: null });
    try {
      const responseTimeMs = state.flippedAt ? Date.now() - state.flippedAt : 0;
      await applyReview(card, rating);
      if (generation !== queueGeneration) return;
      // Per-card-per-day XP — one awardXP line per card per calendar day.
      const day = new Date().toISOString().slice(0, 10);
      const earned = await awardXPWithToast("flashcard", XP_AWARDS.flashcard, `${card.id}_${day}`);
      if (generation !== queueGeneration) return;
      set({ earnedXP: get().earnedXP + earned });

      const isCorrect = RATING_VALUE[rating] >= 3;
      const sessionStats: SessionStats = {
        correct: state.sessionStats.correct + (isCorrect ? 1 : 0),
        wrong: state.sessionStats.wrong + (isCorrect ? 0 : 1),
      };

      void track("flashcard_rated", { cardId: card.id, rating, responseTimeMs });

      const nextIndex = state.index + 1;
      const done = nextIndex >= state.queue.length;

      if (done) {
        const total = state.queue.length;
        const accuracy = total > 0 ? sessionStats.correct / total : 0;
        void track("flashcard_session_completed", {
          cardsReviewed: total,
          accuracy,
        });
        void extendStreak();
        set({
          index: nextIndex,
          flippedAt: null,
          sessionStats,
          sessionComplete: true,
        });
      } else {
        set({
          index: nextIndex,
          flippedAt: null,
          sessionStats,
        });
      }
    } catch (error) {
      console.error("[review] Rating failed", error);
      if (generation === queueGeneration)
        set({ error: "Your review could not be saved. Please try again." });
    } finally {
      if (generation === queueGeneration) set({ isSaving: false });
    }
  },

  reset: (): void => {
    queueGeneration++;
    set({
      queue: [],
      index: 0,
      startedAt: null,
      flippedAt: null,
      dueCount: 0,
      sessionStats: { correct: 0, wrong: 0 },
      sessionComplete: false,
      loading: false,
      nextDue: null,
      earnedXP: 0,
      isSaving: false,
      error: null,
    });
  },
}));
