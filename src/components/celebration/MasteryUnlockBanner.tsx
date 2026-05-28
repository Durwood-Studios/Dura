"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LockOpenIcon } from "@/components/ui/lock-open";
import { usePlayOnMount } from "@/components/celebration/usePlayOnMount";

interface MasteryUnlockBannerProps {
  phaseId: string;
  moduleId: string;
  moduleTitle: string;
}

const STORAGE_PREFIX = "dura:unlock-seen:";

function storageKey(phaseId: string, moduleId: string): string {
  return `${STORAGE_PREFIX}${phaseId}:${moduleId}`;
}

/**
 * Shown the first time a learner views a previously-locked module after it
 * unlocks. Tracks the seen state in localStorage so it doesn't replay on
 * every revisit. Animated lock-open icon fires once on mount and respects
 * the reduced-motion contract via [[usePlayOnMount]].
 *
 * Self-dismissable; auto-evaluates "seen" state on mount, so a server-
 * rendered initial paint never includes the banner — it appears on the
 * first client render after hydration if and only if this is the first
 * visit while unlocked.
 */
export function MasteryUnlockBanner({
  phaseId,
  moduleId,
  moduleTitle,
}: MasteryUnlockBannerProps): React.ReactElement | null {
  const [show, setShow] = useState(false);
  const iconRef = usePlayOnMount();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = storageKey(phaseId, moduleId);
      if (window.localStorage.getItem(key) === "1") return;
      window.localStorage.setItem(key, "1");
      setShow(true);
    } catch {
      // localStorage unavailable (private mode quota, etc.) — skip silently.
    }
  }, [phaseId, moduleId]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto mb-6 flex max-w-[700px] items-start gap-3 rounded-2xl border border-emerald-200 bg-[var(--color-bg-accent)] px-5 py-4"
    >
      <LockOpenIcon ref={iconRef} size={28} className="shrink-0 text-emerald-600" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          You unlocked {moduleTitle}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Mastery gate passed. The rest of this module is open from here.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="Dismiss unlock banner"
        className="shrink-0 rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
