import { describe, expect, it } from "vitest";
import { mergeFlashcard, mergeGoal, mergeProgress, mergeReviewLog } from "@/lib/supabase/sync";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { LessonProgress } from "@/types/curriculum";
import type { Goal } from "@/types/goal";

const baseCard: FlashCard = {
  id: "card-1",
  front: "Q",
  back: "A",
  lessonId: "lesson-1",
  termSlug: null,
  createdAt: 1_000_000,
  due: 2_000_000,
  stability: 5,
  difficulty: 3,
  elapsedDays: 1,
  scheduledDays: 10,
  reps: 1,
  lapses: 0,
  state: "review",
  lastReview: 1_500_000,
};

const baseReview = (id: string, reviewedAt: number, cardId = "card-1"): ReviewLog => ({
  id,
  cardId,
  rating: "good",
  reviewedAt,
  elapsedDays: 1,
  scheduledDays: 10,
  state: "review",
});

const baseProgress: LessonProgress = {
  lessonId: "lesson-1",
  phaseId: "phase-0",
  moduleId: "module-1",
  startedAt: 1_000_000,
  completedAt: null,
  scrollPercent: 50,
  timeSpentMs: 60_000,
  quizPassed: false,
  quizScore: null,
  xpEarned: 10,
  synced: 0,
};

describe("LFLRS-R6 — sync idempotency contract", () => {
  describe("mergeFlashcard (whole-record LWW by lastReview, equivalent to per-field LWW under FSRS atomicity)", () => {
    it("never overwrites a newer local card with an older remote one", () => {
      const newerLocal: FlashCard = { ...baseCard, lastReview: 2_000_000, stability: 10 };
      const olderRemote: FlashCard = { ...baseCard, lastReview: 1_000_000, stability: 5 };
      const merged = mergeFlashcard(newerLocal, olderRemote);
      expect(merged.stability).toBe(10);
      expect(merged.lastReview).toBe(2_000_000);
    });

    it("takes the remote when the remote review is strictly newer", () => {
      const olderLocal: FlashCard = { ...baseCard, lastReview: 1_000_000, stability: 5 };
      const newerRemote: FlashCard = { ...baseCard, lastReview: 2_000_000, stability: 10 };
      const merged = mergeFlashcard(olderLocal, newerRemote);
      expect(merged.stability).toBe(10);
    });

    it("is idempotent: merge(merge(local, remote), remote) === merge(local, remote)", () => {
      const local: FlashCard = { ...baseCard, lastReview: 1_000_000, stability: 5 };
      const remote: FlashCard = { ...baseCard, lastReview: 2_000_000, stability: 10 };
      const once = mergeFlashcard(local, remote);
      const twice = mergeFlashcard(once, remote);
      const thrice = mergeFlashcard(twice, remote);
      expect(once).toEqual(twice);
      expect(twice).toEqual(thrice);
    });

    it("treats equal lastReview as a no-op (preserves local) — required for idempotency", () => {
      const local: FlashCard = { ...baseCard, lastReview: 1_500_000, stability: 5 };
      const remoteSameTs: FlashCard = { ...baseCard, lastReview: 1_500_000, stability: 99 };
      expect(mergeFlashcard(local, remoteSameTs)).toBe(local);
    });
  });

  describe("mergeReviewLog (G-Set union by id, never replaces existing entries)", () => {
    it("appends novel remote entries, preserves local order", () => {
      const local = [baseReview("a", 1_000), baseReview("b", 2_000)];
      const remote = [baseReview("b", 2_000), baseReview("c", 3_000)];
      const merged = mergeReviewLog(local, remote);
      expect(merged.map((e) => e.id)).toEqual(["a", "b", "c"]);
    });

    it("never duplicates an entry that already exists locally", () => {
      const local = [baseReview("a", 1_000)];
      const remote = [baseReview("a", 1_000), baseReview("a", 1_000), baseReview("a", 1_000)];
      const merged = mergeReviewLog(local, remote);
      expect(merged.length).toBe(1);
    });

    it("never replaces a local entry's content with a remote entry of the same id", () => {
      const local = [{ ...baseReview("a", 1_000), rating: "good" as const }];
      const remote = [{ ...baseReview("a", 1_000), rating: "easy" as const }];
      const merged = mergeReviewLog(local, remote);
      expect(merged[0].rating).toBe("good");
    });

    it("returns the same array reference when no novel entries — short-circuit for cache friendliness", () => {
      const local = [baseReview("a", 1_000)];
      const remote = [baseReview("a", 1_000)];
      expect(mergeReviewLog(local, remote)).toBe(local);
    });

    it("is idempotent: applying the same remote N times yields the same result", () => {
      const local = [baseReview("a", 1_000)];
      const remote = [baseReview("a", 1_000), baseReview("b", 2_000)];
      const once = mergeReviewLog(local, remote);
      const twice = mergeReviewLog(once, remote);
      const thrice = mergeReviewLog(twice, remote);
      expect(once.map((e) => e.id)).toEqual(["a", "b"]);
      expect(twice.map((e) => e.id)).toEqual(once.map((e) => e.id));
      expect(thrice.map((e) => e.id)).toEqual(once.map((e) => e.id));
    });
  });

  describe("mergeProgress (per-field monotonic merge over OR/max)", () => {
    it("takes max of monotonic fields", () => {
      const local: LessonProgress = {
        ...baseProgress,
        scrollPercent: 70,
        timeSpentMs: 120_000,
        xpEarned: 20,
      };
      const remote: LessonProgress = {
        ...baseProgress,
        scrollPercent: 90,
        timeSpentMs: 60_000,
        xpEarned: 15,
      };
      const merged = mergeProgress(local, remote);
      expect(merged.scrollPercent).toBe(90);
      expect(merged.timeSpentMs).toBe(120_000);
      expect(merged.xpEarned).toBe(20);
    });

    it("ORs completion bools — once completed anywhere, completed everywhere", () => {
      const local: LessonProgress = { ...baseProgress, quizPassed: false };
      const remote: LessonProgress = { ...baseProgress, quizPassed: true };
      expect(mergeProgress(local, remote).quizPassed).toBe(true);
      expect(mergeProgress(remote, local).quizPassed).toBe(true);
    });

    it("is idempotent under three repeated applications", () => {
      const local: LessonProgress = { ...baseProgress, scrollPercent: 50 };
      const remote: LessonProgress = { ...baseProgress, scrollPercent: 80, quizPassed: true };
      const once = mergeProgress(local, remote);
      const twice = mergeProgress(once, remote);
      const thrice = mergeProgress(twice, remote);
      expect(once).toEqual(twice);
      expect(twice).toEqual(thrice);
    });
  });

  describe("mergeGoal (monotonic-current + sticky-achievedAt)", () => {
    const baseGoal: Goal = {
      id: "goal-1",
      type: "daily",
      unit: "lessons",
      target: 10,
      current: 0,
      startedAt: 1_000_000,
      achievedAt: null,
      deadline: null,
      label: "Finish 10 lessons today",
    };

    it("preserves achievedAt once it is set on either side", () => {
      const local: Goal = { ...baseGoal, achievedAt: 2_000_000 };
      const remote: Goal = { ...baseGoal, achievedAt: null };
      expect(mergeGoal(local, remote).achievedAt).toBe(2_000_000);
      expect(mergeGoal(remote, local).achievedAt).toBe(2_000_000);
    });

    it("takes the higher current progress", () => {
      const local: Goal = { ...baseGoal, current: 7 };
      const remote: Goal = { ...baseGoal, current: 4 };
      expect(mergeGoal(local, remote).current).toBe(7);
    });

    it("is idempotent under three repeated applications", () => {
      const local: Goal = { ...baseGoal, current: 3 };
      const remote: Goal = { ...baseGoal, current: 8, achievedAt: 2_000_000 };
      const once = mergeGoal(local, remote);
      const twice = mergeGoal(once, remote);
      const thrice = mergeGoal(twice, remote);
      expect(once).toEqual(twice);
      expect(twice).toEqual(thrice);
    });
  });

  describe("end-to-end idempotency simulation (in-memory store)", () => {
    type StoreState = {
      cards: Map<string, FlashCard>;
      reviewLog: ReviewLog[];
      progress: Map<string, LessonProgress>;
    };

    function applyRemote(store: StoreState, remote: StoreState): StoreState {
      const cards = new Map(store.cards);
      for (const [id, remoteCard] of remote.cards) {
        const local = cards.get(id);
        cards.set(id, local ? mergeFlashcard(local, remoteCard) : remoteCard);
      }
      const reviewLog = mergeReviewLog(store.reviewLog, remote.reviewLog);
      const progress = new Map(store.progress);
      for (const [id, remoteProg] of remote.progress) {
        const local = progress.get(id);
        progress.set(id, local ? mergeProgress(local, remoteProg) : remoteProg);
      }
      return { cards, reviewLog, progress };
    }

    function hash(state: StoreState): string {
      const cards = [...state.cards.values()]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((c) => `${c.id}:${c.lastReview}:${c.stability}:${c.state}`);
      const log = [...state.reviewLog].sort((a, b) => a.id.localeCompare(b.id)).map((e) => e.id);
      const prog = [...state.progress.values()]
        .sort((a, b) => a.lessonId.localeCompare(b.lessonId))
        .map((p) => `${p.lessonId}:${p.scrollPercent}:${p.timeSpentMs}:${p.quizPassed}`);
      return JSON.stringify({ cards, log, prog });
    }

    it("produces the same store hash after applying the same remote 3 times", () => {
      const remote: StoreState = {
        cards: new Map([["card-1", { ...baseCard, lastReview: 2_000_000, stability: 10 }]]),
        reviewLog: [baseReview("r1", 1_000), baseReview("r2", 2_000)],
        progress: new Map([["lesson-1", { ...baseProgress, scrollPercent: 80, quizPassed: true }]]),
      };
      const local: StoreState = {
        cards: new Map([["card-1", { ...baseCard, lastReview: 1_000_000, stability: 5 }]]),
        reviewLog: [baseReview("r1", 1_000)],
        progress: new Map([["lesson-1", { ...baseProgress, scrollPercent: 30 }]]),
      };
      const once = applyRemote(local, remote);
      const twice = applyRemote(once, remote);
      const thrice = applyRemote(twice, remote);
      expect(hash(once)).toBe(hash(twice));
      expect(hash(twice)).toBe(hash(thrice));
    });
  });
});
