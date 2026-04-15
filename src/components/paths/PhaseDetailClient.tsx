"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, Clock, Award } from "lucide-react";
import { summarizePhase, type PhaseSummary } from "@/lib/progress-aggregate";
import dynamic from "next/dynamic";

const PhaseTest = dynamic(
  () => import("@/components/verify/PhaseTest").then((m) => ({ default: m.PhaseTest })),
  { ssr: false }
);
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import type { Phase } from "@/types/curriculum";

interface PhaseDetailClientProps {
  phase: Phase;
}

export function PhaseDetailClient({ phase }: PhaseDetailClientProps): React.ReactElement {
  const [summary, setSummary] = useState<PhaseSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await summarizePhase(phase);
      if (!cancelled) setSummary(next);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  if (!summary) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: phase.modules.length }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="font-mono text-xs font-semibold tracking-widest uppercase"
            style={{ color: phase.color }}
          >
            Phase {phase.id}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">
            {phase.title}
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">{phase.tagline}</p>
        </div>
        {summary.certificate && (
          <Link
            href={`/verify/${summary.certificate.hash}`}
            className="dura-glow-emerald inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-600 transition hover:bg-emerald-500/15 dark:text-emerald-400"
          >
            <Award className="h-4 w-4" />
            Verified · {Math.round(summary.certificate.score * 100)}%
          </Link>
        )}
      </header>

      {/* Stats row */}
      <div className="mb-10 grid grid-cols-3 gap-4 text-center">
        <StatCard
          label="Lessons"
          value={`${summary.completedLessons}/${summary.totalLessons}`}
          phaseColor={phase.color}
        />
        <StatCard
          label="Modules passed"
          value={`${summary.modulesPassed}/${phase.modules.length}`}
          phaseColor={phase.color}
        />
        <StatCard label="Hours" value={`${phase.estimatedHours}`} phaseColor={phase.color} />
      </div>

      <div className="dura-divider mb-8" />

      {/* Module list */}
      <ul className="flex flex-col gap-4">
        {phase.modules.map((module, index) => (
          <li key={module.id}>
            <ModuleRow phaseId={phase.id} module={module} phaseColor={phase.color} index={index} />
          </li>
        ))}
      </ul>

      <div className="dura-divider mt-10 mb-8" />

      <div>
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
          Phase Verification
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Complete all module assessments, then verify your mastery of the entire phase.
        </p>
        <PhaseTest phaseId={phase.id} phaseTitle={phase.title} />
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  phaseColor,
}: {
  label: string;
  value: string;
  phaseColor: string;
}): React.ReactElement {
  return (
    <div className="dura-card p-4">
      {/* Accent strip at top */}
      <div
        className="mx-auto mb-3 h-0.5 w-12 rounded-full opacity-60"
        style={{ background: phaseColor }}
      />
      <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
        {label}
      </p>
      <p className="dura-stat-gradient mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

interface ModuleRowProps {
  phaseId: string;
  module: import("@/types/curriculum").Module;
  phaseColor: string;
  index: number;
}

function ModuleRow({ phaseId, module, phaseColor, index }: ModuleRowProps): React.ReactElement {
  const [summary, setSummary] = useState<{
    completedLessons: number;
    masteryStatus: "not-attempted" | "passed" | "failed" | "cooldown";
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { summarizeModule } = await import("@/lib/progress-aggregate");
      const result = await summarizeModule(module);
      if (cancelled) return;
      setSummary({
        completedLessons: result.completedLessons,
        masteryStatus: result.masteryGate.status,
      });
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [module]);

  const completed = summary?.completedLessons ?? 0;
  const status = summary?.masteryStatus ?? "not-attempted";
  const percent = module.lessonCount === 0 ? 0 : Math.round((completed / module.lessonCount) * 100);

  return (
    <Link
      href={`/paths/${phaseId}/${module.id}`}
      className="dura-card group flex items-stretch overflow-hidden"
    >
      {/* Phase-colored left border accent */}
      <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: phaseColor }} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-4">
          {/* Module number circle */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: `${phaseColor}20`,
              color: phaseColor,
            }}
          >
            {index + 1}
          </div>

          <div className="flex-1">
            <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
              {module.id}
            </p>
            <h3 className="mt-0.5 font-semibold text-[var(--color-text-primary)]">
              {module.title}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              {module.description}
            </p>
          </div>

          <MasteryIcon status={status} />
          <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
        </div>

        {/* Stat row */}
        <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)]">
          <span className="font-mono">
            {module.lessonCount} lesson{module.lessonCount === 1 ? "" : "s"}
          </span>
          <span className="text-[var(--color-border)]">|</span>
          <span className="font-mono">~{module.estimatedHours}h</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                status === "passed" ? "dura-progress" : ""
              )}
              style={{
                width: `${percent}%`,
                background: status !== "passed" ? `${phaseColor}80` : undefined,
              }}
            />
          </div>
          <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
            {completed}/{module.lessonCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MasteryIcon({
  status,
}: {
  status: "not-attempted" | "passed" | "failed" | "cooldown";
}): React.ReactElement | null {
  if (status === "passed") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Mastery passed" />;
  }
  if (status === "cooldown") {
    return <Clock className="h-5 w-5 text-amber-500" aria-label="Cooldown" />;
  }
  if (status === "failed") {
    return <Lock className="h-5 w-5 text-rose-500" aria-label="Failed — retry available" />;
  }
  return <Lock className="h-5 w-5 text-[var(--color-text-muted)]" aria-label="Not attempted" />;
}
