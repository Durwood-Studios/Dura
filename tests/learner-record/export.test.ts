import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateMarkdownSummary, type SummaryInput } from "@/lib/learner-record/summary";
import { getLocalLearnerId, resetLocalLearnerId } from "@/lib/learner-record/identity";

const baseInput: SummaryInput = {
  exportedAt: "2026-04-25T00:00:00.000Z",
  learnerId: "11111111-2222-4333-8444-555555555555",
  cards: [
    {
      id: "card-1",
      front: "Q1",
      back: "A1",
      lessonId: "l1",
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
    },
    {
      id: "card-2",
      front: "Q2",
      back: "A2",
      lessonId: "l1",
      termSlug: null,
      createdAt: 1_000_000,
      due: 2_000_000,
      stability: 5,
      difficulty: 3,
      elapsedDays: 1,
      scheduledDays: 10,
      reps: 0,
      lapses: 0,
      state: "new",
      lastReview: null,
    },
  ],
  reviewLog: [
    {
      id: "r1",
      cardId: "card-1",
      rating: "good",
      reviewedAt: 1_500_000,
      elapsedDays: 1,
      scheduledDays: 10,
      state: "review",
    },
    {
      id: "r2",
      cardId: "card-1",
      rating: "again",
      reviewedAt: 1_400_000,
      elapsedDays: 1,
      scheduledDays: 1,
      state: "learning",
    },
  ],
  progress: [
    {
      lessonId: "l1",
      phaseId: "p0",
      moduleId: "m1",
      startedAt: 1_000_000,
      completedAt: 1_500_000,
      scrollPercent: 100,
      timeSpentMs: 540_000,
      quizPassed: true,
      quizScore: 0.9,
      xpEarned: 100,
      synced: 1,
    },
    {
      lessonId: "l2",
      phaseId: "p0",
      moduleId: "m1",
      startedAt: 1_500_000,
      completedAt: null,
      scrollPercent: 30,
      timeSpentMs: 60_000,
      quizPassed: false,
      quizScore: null,
      xpEarned: 0,
      synced: 1,
    },
  ],
  moduleProgress: [
    {
      moduleId: "m1",
      phaseId: "p0",
      completedLessons: 1,
      totalLessons: 5,
      masteryGatePassed: false,
      unlockedAt: 1_000_000,
    },
    {
      moduleId: "m2",
      phaseId: "p0",
      completedLessons: 5,
      totalLessons: 5,
      masteryGatePassed: true,
      unlockedAt: 2_000_000,
    },
  ],
};

describe("generateMarkdownSummary", () => {
  it("renders headline counts derived from inputs", () => {
    const md = generateMarkdownSummary(baseInput);
    expect(md).toContain("Lessons completed: **1** of 2 started");
    expect(md).toContain("Total study time: **0.2 hours**");
    expect(md).toContain("XP earned: **100**");
    expect(md).toContain("Modules with mastery gate passed: **1** of 2");
  });

  it("renders card state breakdown", () => {
    const md = generateMarkdownSummary(baseInput);
    expect(md).toContain("Total cards: **2**");
    expect(md).toContain("Review: 1");
    expect(md).toContain("New: 1");
  });

  it("renders review-rating distribution as percentages", () => {
    const md = generateMarkdownSummary(baseInput);
    expect(md).toContain("Total reviews: **2**");
    expect(md).toContain("Again: 1 (50.0%)");
    expect(md).toContain("Good: 1 (50.0%)");
    expect(md).toContain("Hard: 0 (0.0%)");
    expect(md).toContain("Easy: 0 (0.0%)");
  });

  it("includes the learner id and a privacy note", () => {
    const md = generateMarkdownSummary(baseInput);
    expect(md).toContain("`11111111-2222-4333-8444-555555555555`");
    expect(md).toContain("not linked to your name or email");
    expect(md).toContain("GDPR Article 20");
  });

  it("handles empty inputs without dividing by zero", () => {
    const empty: SummaryInput = {
      exportedAt: "2026-04-25T00:00:00.000Z",
      learnerId: baseInput.learnerId,
      cards: [],
      reviewLog: [],
      progress: [],
      moduleProgress: [],
    };
    expect(() => generateMarkdownSummary(empty)).not.toThrow();
    const md = generateMarkdownSummary(empty);
    expect(md).toContain("Total cards: **0**");
    expect(md).toContain("Total reviews: **0**");
    expect(md).toContain("Again: 0 (0.0%)");
  });
});

describe("getLocalLearnerId", () => {
  beforeEach(() => {
    resetLocalLearnerId();
  });
  afterEach(() => {
    resetLocalLearnerId();
  });

  it("mints a UUID on first call and persists it", () => {
    const a = getLocalLearnerId();
    const b = getLocalLearnerId();
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("returns an existing valid UUID from localStorage instead of minting a new one", () => {
    const known = "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f";
    window.localStorage.setItem("dura:learner-id", known);
    expect(getLocalLearnerId()).toBe(known);
  });

  it("re-mints when the stored value is malformed", () => {
    window.localStorage.setItem("dura:learner-id", "not-a-uuid");
    const id = getLocalLearnerId();
    expect(id).not.toBe("not-a-uuid");
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("resetLocalLearnerId() forces a new id on the next call", () => {
    const first = getLocalLearnerId();
    resetLocalLearnerId();
    const second = getLocalLearnerId();
    expect(second).not.toBe(first);
  });
});
