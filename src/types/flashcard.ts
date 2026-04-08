export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  lessonId: string | null;
  termSlug: string | null;
  createdAt: number;
  // FSRS-5 state
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review" | "relearning";
  lastReview: number | null;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  rating: ReviewRating;
  reviewedAt: number;
  elapsedDays: number;
  scheduledDays: number;
  state: FlashCard["state"];
}
