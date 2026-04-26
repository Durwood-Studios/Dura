import { describe, expect, it } from "vitest";
import {
  XAPIStatementSchema,
  masteryTransitionToXAPI,
  moduleProgressToCanonicalMastery,
  reviewEventToXAPI,
} from "@/lib/xapi/projection";
import type { CanonicalMasteryRecord, CanonicalReviewLogEntry } from "@/lib/learner-record/types";
import type { ModuleProgress } from "@/types/curriculum";

const LEARNER = "11111111-2222-4333-8444-555555555555";
const STMT_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

const baseReview: CanonicalReviewLogEntry = {
  id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  card_id: "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f",
  rating: 3,
  elapsed_days: 0.5,
  scheduled_days: 11.5,
  review: "2026-04-25T00:00:00.000Z",
  state: "Review",
};

const baseMastery: CanonicalMasteryRecord = {
  module_id: "phase-0/intro",
  mastery_score: 0.85,
  unlocked_at: "2026-04-25T00:00:00.000Z",
  last_modified: "2026-04-25T00:00:00.000Z",
};

describe("reviewEventToXAPI", () => {
  it("produces a Zod-valid xAPI Statement", () => {
    const stmt = reviewEventToXAPI(baseReview, LEARNER, STMT_ID);
    expect(() => XAPIStatementSchema.parse(stmt)).not.toThrow();
  });

  it("uses the answered verb", () => {
    const stmt = reviewEventToXAPI(baseReview, LEARNER, STMT_ID);
    expect(stmt.verb.id).toBe("http://adlnet.gov/expapi/verbs/answered");
    expect(stmt.verb.display["en-US"]).toBe("answered");
  });

  it("sets actor.account.name to the learner UUID — never an email or auth id", () => {
    const stmt = reviewEventToXAPI(baseReview, LEARNER, STMT_ID);
    expect(stmt.actor.account.name).toBe(LEARNER);
    expect(stmt.actor.account.name).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(stmt.actor.account.name).not.toContain("@");
  });

  it("maps rating=1 (again) to scaled score 0.0", () => {
    const stmt = reviewEventToXAPI({ ...baseReview, rating: 1 }, LEARNER, STMT_ID);
    expect(stmt.result?.score?.scaled).toBe(0);
    expect(stmt.result?.success).toBe(false);
  });

  it("maps rating=4 (easy) to scaled score 1.0", () => {
    const stmt = reviewEventToXAPI({ ...baseReview, rating: 4 }, LEARNER, STMT_ID);
    expect(stmt.result?.score?.scaled).toBe(1);
    expect(stmt.result?.success).toBe(true);
  });

  it("preserves the canonical timestamp", () => {
    const stmt = reviewEventToXAPI(baseReview, LEARNER, STMT_ID);
    expect(stmt.timestamp).toBe(baseReview.review);
  });

  it("emits FSRS context as xAPI extensions, not as actor metadata", () => {
    const stmt = reviewEventToXAPI(baseReview, LEARNER, STMT_ID);
    expect(stmt.result?.extensions).toMatchObject({
      "https://dura.app/xapi/extensions/fsrs-state": "Review",
      "https://dura.app/xapi/extensions/elapsed-days": 0.5,
      "https://dura.app/xapi/extensions/scheduled-days": 11.5,
      "https://dura.app/xapi/extensions/raw-rating": 3,
    });
  });

  it("rejects a non-uuid learner id at validation time", () => {
    expect(() => reviewEventToXAPI(baseReview, "not-a-uuid", STMT_ID)).toThrow();
  });
});

describe("masteryTransitionToXAPI", () => {
  it("produces a Zod-valid xAPI Statement", () => {
    const stmt = masteryTransitionToXAPI(baseMastery, LEARNER, STMT_ID);
    expect(() => XAPIStatementSchema.parse(stmt)).not.toThrow();
  });

  it("uses passed when mastery_score is 1.0", () => {
    const stmt = masteryTransitionToXAPI({ ...baseMastery, mastery_score: 1 }, LEARNER, STMT_ID);
    expect(stmt.verb.id).toBe("http://adlnet.gov/expapi/verbs/passed");
  });

  it("uses completed when mastery_score is below 1.0", () => {
    const stmt = masteryTransitionToXAPI({ ...baseMastery, mastery_score: 0.5 }, LEARNER, STMT_ID);
    expect(stmt.verb.id).toBe("http://adlnet.gov/expapi/verbs/completed");
  });

  it("flags success once mastery_score crosses the 0.8 pass threshold", () => {
    const ok = masteryTransitionToXAPI({ ...baseMastery, mastery_score: 0.85 }, LEARNER, STMT_ID);
    const notOk = masteryTransitionToXAPI({ ...baseMastery, mastery_score: 0.6 }, LEARNER, STMT_ID);
    expect(ok.result?.success).toBe(true);
    expect(notOk.result?.success).toBe(false);
  });

  it("falls back to last_modified for the timestamp when unlocked_at is null", () => {
    const notUnlocked: CanonicalMasteryRecord = {
      ...baseMastery,
      unlocked_at: null,
      last_modified: "2026-01-01T00:00:00.000Z",
    };
    const stmt = masteryTransitionToXAPI(notUnlocked, LEARNER, STMT_ID);
    expect(stmt.timestamp).toBe("2026-01-01T00:00:00.000Z");
    expect(stmt.result?.completion).toBe(false);
  });

  it("URL-encodes module ids that contain slashes", () => {
    const stmt = masteryTransitionToXAPI(baseMastery, LEARNER, STMT_ID);
    expect(stmt.object.id).toBe("https://dura.app/modules/phase-0%2Fintro");
  });

  it("uses an LRS-portable activity type for modules", () => {
    const stmt = masteryTransitionToXAPI(baseMastery, LEARNER, STMT_ID);
    expect(stmt.object.definition.type).toBe("http://adlnet.gov/expapi/activities/module");
  });
});

describe("moduleProgressToCanonicalMastery (DURA → LFLRS adapter)", () => {
  const baseModuleProgress: ModuleProgress = {
    moduleId: "phase-1/loops",
    phaseId: "phase-1",
    completedLessons: 3,
    totalLessons: 10,
    masteryGatePassed: false,
    unlockedAt: 1_700_000_000_000,
  };

  it("derives mastery_score from completed/total lessons when gate is unpassed", () => {
    const record = moduleProgressToCanonicalMastery(baseModuleProgress, Date.now());
    expect(record.mastery_score).toBe(0.3);
  });

  it("pins mastery_score to 1.0 when masteryGatePassed is true", () => {
    const record = moduleProgressToCanonicalMastery(
      { ...baseModuleProgress, masteryGatePassed: true, completedLessons: 5 },
      Date.now()
    );
    expect(record.mastery_score).toBe(1);
  });

  it("clamps mastery_score to 1.0 even when completedLessons exceeds totalLessons", () => {
    const record = moduleProgressToCanonicalMastery(
      { ...baseModuleProgress, completedLessons: 20, totalLessons: 10 },
      Date.now()
    );
    expect(record.mastery_score).toBe(1);
  });

  it("returns mastery_score 0 when totalLessons is 0", () => {
    const record = moduleProgressToCanonicalMastery(
      { ...baseModuleProgress, completedLessons: 0, totalLessons: 0 },
      Date.now()
    );
    expect(record.mastery_score).toBe(0);
  });

  it("emits an ISO unlocked_at when the module has been unlocked", () => {
    const record = moduleProgressToCanonicalMastery(baseModuleProgress, Date.now());
    expect(record.unlocked_at).toBe(new Date(1_700_000_000_000).toISOString());
  });

  it("emits null unlocked_at when unlockedAt is 0 (unset)", () => {
    const record = moduleProgressToCanonicalMastery(
      { ...baseModuleProgress, unlockedAt: 0 },
      Date.now()
    );
    expect(record.unlocked_at).toBeNull();
  });

  it("output validates against the canonical mastery record schema", async () => {
    const { CanonicalMasteryRecordSchema } = await import("@/lib/learner-record/types");
    const record = moduleProgressToCanonicalMastery(baseModuleProgress, Date.now());
    expect(() => CanonicalMasteryRecordSchema.parse(record)).not.toThrow();
  });
});
