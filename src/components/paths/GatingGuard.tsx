"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { isModuleUnlocked, getPrerequisiteModule } from "@/lib/gating";
import { LockedModule } from "@/components/paths/LockedModule";
import { Skeleton } from "@/components/ui/Skeleton";

interface GatingGuardProps {
  phaseId: string;
  moduleId: string;
  moduleTitle: string;
  children: React.ReactNode;
}

/** Client-side gating guard. Shows locked UI or children based on gate status. */
export function GatingGuard({
  phaseId,
  moduleId,
  moduleTitle,
  children,
}: GatingGuardProps): React.ReactElement {
  const strictGating = usePreferencesStore((s) => s.prefs.strictGating);
  const hydrated = usePreferencesStore((s) => s.hydrated);
  const [state, setState] = useState<"loading" | "locked" | "unlocked">("loading");
  const [prerequisite, setPrerequisite] = useState<{
    phaseId: string;
    moduleId: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!strictGating) {
      setState("unlocked");
      return;
    }
    void isModuleUnlocked(phaseId, moduleId, true).then((unlocked) => {
      if (unlocked) {
        setState("unlocked");
      } else {
        setPrerequisite(getPrerequisiteModule(phaseId, moduleId));
        setState("locked");
      }
    });
  }, [phaseId, moduleId, strictGating, hydrated]);

  if (state === "loading") {
    return (
      <div className="space-y-4 px-6 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (state === "locked" && prerequisite) {
    return <LockedModule moduleTitle={moduleTitle} prerequisite={prerequisite} />;
  }

  return <>{children}</>;
}
