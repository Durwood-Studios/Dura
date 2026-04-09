import { getProgressByModule, getProgressByPhase } from "@/lib/db/progress";
import { getLatestResult } from "@/lib/db/assessments";
import { getCertificatesByPhase } from "@/lib/db/certificates";
import { PHASES } from "@/content/phases";
import type { Module, Phase } from "@/types/curriculum";

export interface ModuleSummary {
  module: Module;
  completedLessons: number;
  totalLessons: number;
  averageScore: number | null;
  masteryGate: {
    status: "not-attempted" | "passed" | "failed" | "cooldown";
    lastAttemptAt: number | null;
    score: number | null;
    cooldownUntil: number | null;
  };
}

export interface PhaseSummary {
  phase: Phase;
  completedLessons: number;
  totalLessons: number;
  modulesPassed: number;
  certificate: { hash: string; completedAt: number; score: number } | null;
  ready: boolean;
}

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function summarizeModule(module: Module): Promise<ModuleSummary> {
  const [progress, latestGate] = await Promise.all([
    getProgressByModule(module.id),
    getLatestResult(module.id, "mastery-gate"),
  ]);

  const completed = progress.filter((p) => p.completedAt !== null);
  const scores = completed
    .map((p) => p.quizScore)
    .filter((s): s is number => typeof s === "number");
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  let status: ModuleSummary["masteryGate"]["status"] = "not-attempted";
  let cooldownUntil: number | null = null;
  if (latestGate) {
    if (latestGate.passed) {
      status = "passed";
    } else if (Date.now() - latestGate.completedAt < COOLDOWN_MS) {
      status = "cooldown";
      cooldownUntil = latestGate.completedAt + COOLDOWN_MS;
    } else {
      status = "failed";
    }
  }

  return {
    module,
    completedLessons: completed.length,
    totalLessons: module.lessonCount,
    averageScore,
    masteryGate: {
      status,
      lastAttemptAt: latestGate?.completedAt ?? null,
      score: latestGate?.score ?? null,
      cooldownUntil,
    },
  };
}

export async function summarizePhase(phase: Phase): Promise<PhaseSummary> {
  const [progress, certs] = await Promise.all([
    getProgressByPhase(phase.id),
    getCertificatesByPhase(phase.id),
  ]);
  const completedLessons = progress.filter((p) => p.completedAt !== null).length;

  const summaries = await Promise.all(phase.modules.map((m) => summarizeModule(m)));
  const modulesPassed = summaries.filter((s) => s.masteryGate.status === "passed").length;
  const ready = completedLessons >= phase.lessonCount && modulesPassed >= phase.modules.length;

  const cert = certs[0]
    ? {
        hash: certs[0].verificationHash,
        completedAt: certs[0].completedAt,
        score: certs[0].score,
      }
    : null;

  return {
    phase,
    completedLessons,
    totalLessons: phase.lessonCount,
    modulesPassed,
    certificate: cert,
    ready,
  };
}

export async function summarizeAllPhases(): Promise<PhaseSummary[]> {
  return Promise.all(PHASES.map((p) => summarizePhase(p)));
}
