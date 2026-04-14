"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

interface LockedModuleProps {
  moduleTitle: string;
  prerequisite: { phaseId: string; moduleId: string; title: string };
}

/** Shown when a module is locked behind a mastery gate. */
export function LockedModule({ moduleTitle, prerequisite }: LockedModuleProps): React.ReactElement {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Lock className="h-7 w-7 text-[var(--color-text-muted)]" />
      </div>
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{moduleTitle}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Complete the mastery assessment for{" "}
        <strong className="text-neutral-700">{prerequisite.title}</strong> to unlock this module.
      </p>
      <Link
        href={`/paths/${prerequisite.phaseId}/${prerequisite.moduleId}`}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
      >
        Go to {prerequisite.title}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
