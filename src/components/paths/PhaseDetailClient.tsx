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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
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
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-[var(--color-bg-accent)] px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            <Award className="h-4 w-4" />
            Verified · {Math.round(summary.certificate.score * 100)}%
          </Link>
        )}
      </header>

      <div className="mb-8 grid grid-cols-3 gap-3 text-center">
        <Stat label="Lessons" value={`${summary.completedLessons}/${summary.totalLessons}`} />
        <Stat label="Modules passed" value={`${summary.modulesPassed}/${phase.modules.length}`} />
        <Stat label="Hours" value={`${phase.estimatedHours}`} />
      </div>

      <ul className="flex flex-col gap-3">
        {phase.modules.map((module) => (
          <li key={module.id}>
            <ModuleRow phaseId={phase.id} module={module} />
          </li>
        ))}
      </ul>

      <div className="mt-10">
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

function Stat({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
      <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

interface ModuleRowProps {
  phaseId: string;
  module: import("@/types/curriculum").Module;
}

function ModuleRow({ phaseId, module }: ModuleRowProps): React.ReactElement {
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
      className="group flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            {module.id}
          </p>
          <h3 className="mt-1 font-semibold text-[var(--color-text-primary)]">{module.title}</h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{module.description}</p>
        </div>
        <MasteryIcon status={status} />
        <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-emerald-600" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <div
            className={cn(
              "h-full transition-all duration-300",
              status === "passed" ? "bg-emerald-500" : "bg-[var(--color-text-muted)]"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
          {completed}/{module.lessonCount}
        </span>
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
