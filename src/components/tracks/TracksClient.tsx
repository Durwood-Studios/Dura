"use client";

import { useCallback, useRef, useState } from "react";
import { GoalCard } from "@/components/tracks/GoalCard";
import { RoleCard } from "@/components/tracks/RoleCard";
import type { TrackGoal, Role } from "@/types/career-track";

interface TracksClientProps {
  goals: TrackGoal[];
  roles: Role[];
}

/** Client wrapper that wires goal-click filtering to the roles grid. */
export function TracksClient({ goals, roles }: TracksClientProps): React.ReactElement {
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const rolesRef = useRef<HTMLDivElement>(null);

  const handleGoalClick = useCallback(
    (goalId: string): void => {
      const isSame = activeGoalId === goalId;
      setActiveGoalId(isSame ? null : goalId);

      if (!isSame && rolesRef.current) {
        rolesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [activeGoalId]
  );

  const goal = goals.find((g) => g.id === activeGoalId);
  const highlightedRoleIds = goal ? goal.roleIds : [];

  // Sort roles: highlighted ones first when a goal is active
  const sortedRoles = activeGoalId
    ? [...roles].sort((a, b) => {
        const aHighlighted = highlightedRoleIds.includes(a.id) ? 0 : 1;
        const bHighlighted = highlightedRoleIds.includes(b.id) ? 0 : 1;
        return aHighlighted - bHighlighted;
      })
    : roles;

  return (
    <>
      {/* Section 1: Goals */}
      <section>
        <h2 className="mb-1 text-2xl font-semibold text-[var(--color-text-primary)]">
          What&apos;s your goal?
        </h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          Pick a goal to see which roles match.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onClick={handleGoalClick} />
          ))}
        </div>
      </section>

      {/* Section 2: Roles */}
      <section ref={rolesRef} className="scroll-mt-24 pt-12">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="mb-1 text-2xl font-semibold text-[var(--color-text-primary)]">
              Browse by role
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              {activeGoalId
                ? "Matching roles are highlighted below."
                : "Explore 12 engineering career paths."}
            </p>
          </div>
          {activeGoalId && (
            <button
              type="button"
              onClick={() => setActiveGoalId(null)}
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isHighlighted={highlightedRoleIds.includes(role.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
