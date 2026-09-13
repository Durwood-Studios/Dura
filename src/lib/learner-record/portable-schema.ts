import { DiscoveryActivitiesSchema } from "@/lib/discovery/registry";
import { JUDGMENT_ATTEMPT_SCHEMA } from "@/lib/judgment/schema";
import { DAILY_TIME_SCHEMA } from "@/lib/daily-study-time";
import { z } from "zod";
import { ACTIVITY_EVIDENCE_MAP_SCHEMA } from "@/lib/activity-evidence";
import { StoredFlashCardSchema, StoredReviewLogSchema } from "@/lib/learner-record/types";

const id = z.string().min(1).max(500);
const text = z.string().max(1_000_000);
const number = z.number().finite();
const time = number.nonnegative();
const count = time.int();
const nullableTime = time.nullable();
/** Validated plaintext progress used at the portability boundary. */
export const PORTABLE_PROGRESS_SCHEMA = z.object({
  lessonId: id,
  phaseId: id,
  moduleId: id,
  startedAt: time,
  completedAt: nullableTime,
  scrollPercent: number.min(0).max(100),
  timeSpentMs: time,
  quizPassed: z.boolean(),
  quizScore: number.min(0).max(1).nullable(),
  xpEarned: time,
  synced: z.union([z.literal(0), z.literal(1)]),
  activityEvidence: ACTIVITY_EVIDENCE_MAP_SCHEMA.optional(),
  dailyTimeMs: DAILY_TIME_SCHEMA.optional(),
});
const questionResult = z.object({
  questionId: id,
  selectedAnswer: z.union([count, z.array(count), z.null()]),
  correct: z.boolean(),
  timeSpentMs: time,
});
const assessment = z.object({
  id,
  type: z.enum(["mastery-gate", "phase-verification", "skill-assessment"]),
  targetId: id,
  score: number,
  totalQuestions: count,
  correctCount: count,
  passed: z.boolean(),
  startedAt: time,
  completedAt: time,
  timeSpentMs: time,
  questionResults: z.array(questionResult),
});
const preferences = z.object({
  id: z.literal("user"),
  theme: z.enum(["light", "dark", "system"]),
  studyMode: z.enum(["standard", "bite", "focus", "review", "sprint", "challenge"]),
  fontSize: z.enum(["sm", "md", "lg", "xl"]),
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
  dyslexiaFont: z.boolean(),
  soundEnabled: z.boolean(),
  dailyGoalMinutes: time,
  strictGating: z.boolean(),
  discoveryActivities: DiscoveryActivitiesSchema.optional(),
  discoveryPassportMigrated: z.boolean().optional(),
  showStreak: z.boolean(),
  streak: z.object({
    current: count,
    longest: count,
    lastActivityAt: nullableTime,
    freezesAvailable: count,
    freezesEarnedAt: nullableTime,
  }),
  updatedAt: time,
});
const path = z.enum([
  "foundation",
  "career-switch",
  "bootcamp-grad",
  "mid-to-senior",
  "ai-specialist",
  "cto-track",
]);
const skillAssessment = z.object({
  id: z.literal("skill-assessment"),
  data: z.object({
    id,
    completedAt: time,
    answers: z.array(
      z.object({ questionId: id, selectedOption: count, correct: z.boolean(), phaseLevel: count })
    ),
    score: z.object({
      total: count,
      correct: count,
      byBracket: z.record(z.string(), z.object({ total: count, correct: count })),
      dreyfusLevel: z.enum(["novice", "advanced-beginner", "competent", "proficient", "expert"]),
    }),
    recommendedPath: path,
    selectedPath: path,
  }),
});
/** Complete device-owned learning inventory, excluding caches, authentication and secret keys. */
export const PORTABLE_RECORD_SCHEMA = z.object({
  judgmentAttempts: z.array(JUDGMENT_ATTEMPT_SCHEMA).max(10_000).default([]),
  tombstones: z
    .array(
      z.object({
        id,
        table: z.enum(["flashcards", "goals", "sandbox_saves"]),
        recordId: id,
        deletedAt: time,
        synced: z.union([z.literal(0), z.literal(1)]),
      })
    )
    .default([]),
  version: z.literal(2),
  generatedAt: z.string().datetime(),
  progress: z.array(PORTABLE_PROGRESS_SCHEMA),
  moduleProgress: z.array(
    z.object({
      moduleId: id,
      phaseId: id,
      completedLessons: count,
      totalLessons: count,
      masteryGatePassed: z.boolean(),
      unlockedAt: time,
    })
  ),
  phaseProgress: z.array(
    z.object({
      phaseId: id,
      unlocked: z.boolean(),
      unlockedAt: nullableTime,
      completedAt: nullableTime,
      verificationScore: number.nullable(),
    })
  ),
  flashcards: z.array(StoredFlashCardSchema),
  reviewLogs: z.array(StoredReviewLogSchema),
  goals: z.array(
    z.object({
      id,
      type: z.enum(["daily", "weekly", "phase", "career", "custom"]),
      unit: z.enum(["minutes", "lessons", "hours", "xp"]),
      target: number,
      current: number,
      startedAt: time,
      deadline: nullableTime,
      achievedAt: nullableTime,
      label: text,
      phaseId: z.string().optional(),
      roleId: z.string().optional(),
    })
  ),
  preferences: z.array(z.union([preferences, skillAssessment])),
  sandboxSaves: z.array(
    z.object({
      id,
      title: text,
      language: z.enum(["javascript", "typescript", "html", "react"]),
      code: text,
      createdAt: time,
      updatedAt: time,
    })
  ),
  assessmentResults: z.array(assessment),
  certificates: z.array(
    z.object({
      id,
      phaseId: id,
      userId: z.string().nullable(),
      displayName: text,
      phaseTitle: text,
      score: number,
      totalQuestions: count,
      completedAt: time,
      verificationHash: id,
      standards: z.array(text),
      signature: text.optional(),
      serverCredential: z.string().max(8192).optional(),
    })
  ),
  xpEvents: z.array(
    z.object({
      id,
      source: z.enum([
        "lesson",
        "quiz",
        "flashcard",
        "sandbox",
        "mastery-gate",
        "verification",
        "phase-complete",
        "module-complete",
      ]),
      amount: number,
      sourceId: id,
      awardedAt: time,
      pointType: z.enum(["ap", "mp"]).optional(),
    })
  ),
  tutorialProgress: z.array(
    z.object({
      id,
      slug: id,
      type: z.enum(["howto", "tutorial"]),
      currentStep: count,
      totalSteps: count,
      checkpoints: z.array(
        z.object({
          id,
          label: text,
          status: z.enum(["locked", "active", "completed"]),
          completedAt: nullableTime,
        })
      ),
      startedAt: time,
      completedAt: nullableTime,
      lastActiveAt: time,
    })
  ),
  dojoSessions: z.array(
    z.object({
      id,
      startedAt: time,
      completedAt: time,
      tier: z.enum(["T1", "T3"]),
      phaseFilter: z.string().optional(),
      results: z.array(
        z.object({
          questionId: id,
          questionText: text,
          answer: text,
          score: number,
          gap: text,
          feedback: text,
          timeMs: time,
        })
      ),
      avgScore: number,
    })
  ),
  analytics: z.array(
    z.object({
      id,
      name: id,
      timestamp: time,
      properties: z.record(z.string(), z.union([text, number, z.boolean(), z.null()])),
      synced: z.union([z.literal(0), z.literal(1)]),
    })
  ),
});
export type PortableRecord = z.infer<typeof PORTABLE_RECORD_SCHEMA>;
