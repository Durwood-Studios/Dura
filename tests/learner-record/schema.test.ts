import { describe, expect, it } from "vitest";
import {
  CanonicalCardSchema,
  CanonicalLearnerRecordSchema,
  CanonicalMasteryRecordSchema,
  CanonicalReviewLogEntrySchema,
  StoredFlashCardSchema,
  StoredReviewLogSchema,
  fromCanonicalCard,
  fromCanonicalReviewLog,
  toCanonicalCard,
  toCanonicalId,
  toCanonicalReviewLog,
  type StoredFlashCard,
  type StoredReviewLog,
} from "@/lib/learner-record/types";

const sampleStoredCard: StoredFlashCard = {
  id: "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f",
  front: "What is FSRS?",
  back: "Free Spaced Repetition Scheduler",
  lessonId: "lesson-001",
  termSlug: null,
  createdAt: 1_714_000_000_000,
  due: 1_715_000_000_000,
  stability: 12.5,
  difficulty: 4.2,
  elapsedDays: 0.5,
  scheduledDays: 11.5,
  reps: 3,
  lapses: 0,
  state: "review",
  lastReview: 1_713_990_000_000,
};

const sampleStoredReview: StoredReviewLog = {
  id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  cardId: sampleStoredCard.id,
  rating: "good",
  reviewedAt: 1_713_990_000_000,
  elapsedDays: 0.5,
  scheduledDays: 11.5,
  state: "review",
};

describe("LFLRS canonical schema validation", () => {
  it("accepts a valid canonical card", () => {
    expect(() =>
      CanonicalCardSchema.parse({
        id: "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f",
        stability: 12.5,
        difficulty: 4.2,
        due: "2024-05-06T13:33:20.000Z",
        reps: 3,
        lapses: 0,
        state: "Review",
        last_modified: "2024-04-25T00:00:00.000Z",
      })
    ).not.toThrow();
  });

  it("rejects a non-uuid id", () => {
    const result = CanonicalCardSchema.safeParse({
      id: "not-a-uuid",
      stability: 1,
      difficulty: 5,
      due: "2024-05-06T13:33:20.000Z",
      reps: 0,
      lapses: 0,
      state: "New",
      last_modified: "2024-04-25T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a lowercase FSRS state on the canonical shape", () => {
    const result = CanonicalCardSchema.safeParse({
      id: "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f",
      stability: 1,
      difficulty: 5,
      due: "2024-05-06T13:33:20.000Z",
      reps: 0,
      lapses: 0,
      state: "review",
      last_modified: "2024-04-25T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating outside 1..4 on a canonical review entry", () => {
    const result = CanonicalReviewLogEntrySchema.safeParse({
      id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      card_id: "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f",
      rating: 5,
      elapsed_days: 0.5,
      scheduled_days: 11.5,
      review: "2024-04-25T00:00:00.000Z",
      state: "Review",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mastery_score outside 0..1", () => {
    const result = CanonicalMasteryRecordSchema.safeParse({
      module_id: "phase-0/intro",
      mastery_score: 1.5,
      unlocked_at: null,
      last_modified: "2024-04-25T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("validates a complete canonical learner record", () => {
    const record = {
      schema_version: "lflrs-1.0" as const,
      learner_id: "11111111-2222-4333-8444-555555555555",
      exported_at: "2024-04-25T00:00:00.000Z",
      cards: [
        toCanonicalCard(
          sampleStoredCard,
          sampleStoredCard.lastReview ?? sampleStoredCard.createdAt
        ),
      ],
      review_log: [toCanonicalReviewLog(sampleStoredReview)],
      mastery_records: [
        {
          module_id: "phase-0/intro",
          mastery_score: 0.8,
          unlocked_at: "2024-04-25T00:00:00.000Z",
          last_modified: "2024-04-25T00:00:00.000Z",
        },
      ],
    };
    expect(() => CanonicalLearnerRecordSchema.parse(record)).not.toThrow();
  });
});

describe("Stored ⇄ Canonical projection", () => {
  it("projects a stored card to canonical with TitleCase state and ISO dates", () => {
    const canonical = toCanonicalCard(
      sampleStoredCard,
      sampleStoredCard.lastReview ?? sampleStoredCard.createdAt
    );
    expect(canonical.state).toBe("Review");
    expect(canonical.due).toBe(new Date(sampleStoredCard.due).toISOString());
    expect(canonical.id).toBe(sampleStoredCard.id);
  });

  it("projects a stored review with integer rating", () => {
    const canonical = toCanonicalReviewLog(sampleStoredReview);
    expect(canonical.rating).toBe(3);
    expect(canonical.state).toBe("Review");
    expect(canonical.review).toBe(new Date(sampleStoredReview.reviewedAt).toISOString());
  });

  it("round-trips a card through canonical and back, preserving FSRS-managed fields", () => {
    const canonical = toCanonicalCard(
      sampleStoredCard,
      sampleStoredCard.lastReview ?? sampleStoredCard.createdAt
    );
    const restored = fromCanonicalCard(canonical, {
      front: sampleStoredCard.front,
      back: sampleStoredCard.back,
      lessonId: sampleStoredCard.lessonId,
      termSlug: sampleStoredCard.termSlug,
      createdAt: sampleStoredCard.createdAt,
      elapsedDays: sampleStoredCard.elapsedDays,
      scheduledDays: sampleStoredCard.scheduledDays,
      lastReview: sampleStoredCard.lastReview,
    });
    expect(restored.id).toBe(sampleStoredCard.id);
    expect(restored.state).toBe(sampleStoredCard.state);
    expect(restored.due).toBe(sampleStoredCard.due);
    expect(restored.stability).toBe(sampleStoredCard.stability);
    expect(restored.difficulty).toBe(sampleStoredCard.difficulty);
    expect(restored.reps).toBe(sampleStoredCard.reps);
    expect(restored.lapses).toBe(sampleStoredCard.lapses);
  });

  it("round-trips a review log entry through canonical and back", () => {
    const canonical = toCanonicalReviewLog(sampleStoredReview);
    const restored = fromCanonicalReviewLog(canonical);
    expect(restored).toEqual(sampleStoredReview);
  });

  it("synthesizes a stable UUID for non-UUID stored ids", () => {
    const a = toCanonicalId("phase-0/intro/lesson-1");
    const b = toCanonicalId("phase-0/intro/lesson-1");
    const c = toCanonicalId("phase-0/intro/lesson-2");
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("preserves an existing UUID stored id without rewriting", () => {
    const original = "9F8A4AB2-7D8E-4E7A-9B1C-1A2B3C4D5E6F";
    expect(toCanonicalId(original)).toBe(original.toLowerCase());
  });
});

describe("Stored shape validation against current type definitions", () => {
  it("StoredFlashCardSchema accepts the live IDB card shape", () => {
    expect(() => StoredFlashCardSchema.parse(sampleStoredCard)).not.toThrow();
  });

  it("StoredReviewLogSchema accepts the live IDB review shape", () => {
    expect(() => StoredReviewLogSchema.parse(sampleStoredReview)).not.toThrow();
  });

  it("rejects a stored card missing FSRS-required fields", () => {
    const broken = { ...sampleStoredCard } as Partial<StoredFlashCard>;
    delete broken.stability;
    expect(StoredFlashCardSchema.safeParse(broken).success).toBe(false);
  });
});
