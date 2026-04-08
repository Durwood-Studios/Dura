import { create } from "zustand";
import type { FlashCard, ReviewRating } from "@/types/flashcard";

interface ReviewState {
  queue: FlashCard[];
  index: number;
  ratings: { cardId: string; rating: ReviewRating }[];
  startedAt: number | null;

  loadQueue: (cards: FlashCard[]) => void;
  rate: (rating: ReviewRating) => void;
  next: () => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  queue: [],
  index: 0,
  ratings: [],
  startedAt: null,

  loadQueue: (cards) => set({ queue: cards, index: 0, ratings: [], startedAt: Date.now() }),

  rate: (rating) => {
    const card = get().queue[get().index];
    if (!card) return;
    set({ ratings: [...get().ratings, { cardId: card.id, rating }] });
  },

  next: () => set({ index: get().index + 1 }),

  reset: () => set({ queue: [], index: 0, ratings: [], startedAt: null }),
}));
