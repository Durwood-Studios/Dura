"use client";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useGoalsStore } from "@/stores/goals";
import { generateId, cn } from "@/lib/utils";
import { ROLES } from "@/content/roles";
import { getRoleLessonIds } from "@/lib/career-coverage";
import { PHASES } from "@/content/phases";
import type { Goal, GoalType, GoalUnit } from "@/types/goal";

interface GoalCreatorProps {
  open: boolean;
  onClose: () => void;
}

const GOAL_TYPES: { value: GoalType; label: string; hint: string }[] = [
  { value: "daily", label: "Daily", hint: "Lessons or minutes per day" },
  { value: "weekly", label: "Weekly", hint: "Lessons this week" },
  { value: "phase", label: "Phase", hint: "Finish a phase by a date" },
  { value: "career", label: "Career", hint: "Study lessons mapped to a role" },
];

const DAILY_UNITS: { value: GoalUnit; label: string; min: number; max: number; step: number }[] = [
  { value: "lessons", label: "Lessons / day", min: 1, max: 5, step: 1 },
  { value: "minutes", label: "Minutes / day", min: 15, max: 120, step: 15 },
];

export function GoalCreator({ open, onClose }: GoalCreatorProps): React.ReactElement | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);
  const add = useGoalsStore((s) => s.add);
  const [type, setType] = useState<GoalType>("daily");
  const [unit, setUnit] = useState<GoalUnit>("lessons");
  const [target, setTarget] = useState<number>(2);
  const [phaseId, setPhaseId] = useState<string>("0");
  const [deadline, setDeadline] = useState<string>("");
  const [careerRole, setCareerRole] = useState<string>(ROLES[0].id);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    let label = "";
    let finalUnit: GoalUnit = unit;
    let finalTarget = target;
    let finalDeadline: number | null = null;

    if (type === "daily") {
      finalUnit = unit;
      label = `${target} ${unit} per day`;
    } else if (type === "weekly") {
      finalUnit = "lessons";
      label = `${target} lessons this week`;
    } else if (type === "phase") {
      finalUnit = "lessons";
      finalDeadline = deadline ? new Date(deadline).getTime() : null;
      const phase = PHASES.find((p) => p.id === phaseId);
      finalTarget = phase?.lessonCount ?? 1;
      label = `Finish ${phase?.title ?? `Phase ${phaseId}`}${
        deadline ? ` by ${new Date(deadline).toLocaleDateString()}` : ""
      }`;
    } else {
      finalUnit = "lessons";
      finalTarget = getRoleLessonIds(careerRole).length;
      if (!finalTarget) {
        setSaveError("This role does not yet have mapped lessons. Choose another role.");
        setIsSaving(false);
        return;
      }
      label = `Study ${ROLES.find((role) => role.id === careerRole)?.title ?? careerRole} mapped lessons`;
    }

    const goal: Goal = {
      id: generateId("goal"),
      ...(type === "phase" ? { phaseId } : {}),
      ...(type === "career" ? { roleId: careerRole } : {}),
      type,
      unit: finalUnit,
      target: finalTarget,
      current: 0,
      startedAt: Date.now(),
      deadline: finalDeadline,
      achievedAt: null,
      label,
    };
    try {
      await add(goal);
      onClose();
    } catch (error) {
      console.error("[goals] Save failed", error);
      setSaveError("Your goal could not be saved. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      ref={dialogRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="New goal"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
    >
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:rounded-2xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">New Goal</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {GOAL_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={cn(
                "rounded-lg border p-3 text-left text-xs transition",
                type === t.value
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
              )}
            >
              <div className="font-semibold">{t.label}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{t.hint}</div>
            </button>
          ))}
        </div>

        {type === "daily" && (
          <>
            <div className="mb-3 flex gap-2">
              {DAILY_UNITS.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => {
                    setUnit(u.value);
                    setTarget(u.value === "lessons" ? 2 : 30);
                  }}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition",
                    unit === u.value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
            <label className="mb-4 block text-xs text-[var(--color-text-secondary)]">
              Target: <strong>{target}</strong> {unit} / day
              <input
                type="range"
                min={unit === "lessons" ? 1 : 15}
                max={unit === "lessons" ? 5 : 120}
                step={unit === "lessons" ? 1 : 15}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-500"
              />
            </label>
          </>
        )}

        {type === "weekly" && (
          <label className="mb-4 block text-xs text-[var(--color-text-secondary)]">
            Target: <strong>{target}</strong> lessons this week
            <input
              type="range"
              min={1}
              max={20}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="mt-2 w-full accent-emerald-500"
            />
          </label>
        )}

        {type === "phase" && (
          <div className="mb-4 flex flex-col gap-2">
            <label className="text-xs text-[var(--color-text-secondary)]">
              Phase
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-sm"
              >
                {PHASES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[var(--color-text-secondary)]">
              Deadline
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        )}

        {type === "career" && (
          <label className="mb-4 block text-xs text-[var(--color-text-secondary)]">
            Target role
            <select
              value={careerRole}
              onChange={(e) => setCareerRole(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </label>
        )}

        {saveError && (
          <p role="alert" className="mb-3 text-sm text-[var(--color-error)]">
            {saveError}
          </p>
        )}
        {type === "career" && (
          <p className="mb-3 text-sm">
            Progress counts mapped lessons, not job readiness or professional competence.
          </p>
        )}
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          {isSaving ? "Saving…" : "Set goal"}
        </button>
      </div>
    </div>,
    document.body
  );
}
