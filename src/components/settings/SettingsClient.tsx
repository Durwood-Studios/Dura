"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { getDB } from "@/lib/db";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { FontSize, StudyMode } from "@/types/preferences";

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

const STUDY_MODES: { value: StudyMode; label: string; hint: string }[] = [
  { value: "standard", label: "Standard", hint: "Normal reading layout" },
  { value: "focus", label: "Focus", hint: "Hide nav, full-width content" },
  { value: "sprint", label: "Sprint", hint: "Pomodoro timer in top bar" },
];

const STORES_TO_EXPORT = [
  "progress",
  "flashcards",
  "reviewLogs",
  "goals",
  "preferences",
  "analytics",
  "assessment-results",
  "certificates",
  "xp-events",
  "sandbox-saves",
] as const;

async function exportAllData(): Promise<string> {
  const db = await getDB();
  const dump: Record<string, unknown> = { exportedAt: new Date().toISOString(), version: 4 };
  for (const store of STORES_TO_EXPORT) {
    try {
      dump[store] = await db.getAll(store);
    } catch (error) {
      console.error(`[settings] export failed for ${store}`, error);
      dump[store] = [];
    }
  }
  return JSON.stringify(dump, null, 2);
}

async function clearAllData(): Promise<void> {
  const db = await getDB();
  for (const store of STORES_TO_EXPORT) {
    try {
      await db.clear(store);
    } catch (error) {
      console.error(`[settings] clear failed for ${store}`, error);
    }
  }
}

export function SettingsClient(): React.ReactElement {
  const prefs = usePreferencesStore((s) => s.prefs);
  const update = usePreferencesStore((s) => s.update);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dura-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    await clearAllData();
    setConfirmingClear(false);
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Appearance */}
      <Section title="Appearance">
        <SettingRow label="Theme" hint="Light, dark, or follow your system">
          <ThemeToggle />
        </SettingRow>
        <SettingRow label="Font size" hint="Applies to lesson reader body text">
          <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1">
            {FONT_SIZES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => void update({ fontSize: f.value })}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  prefs.fontSize === f.value
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Reduced motion" hint="Disable animations beyond the OS setting">
          <Toggle value={prefs.reducedMotion} onChange={(v) => void update({ reducedMotion: v })} />
        </SettingRow>
      </Section>

      {/* Learning */}
      <Section title="Learning">
        <SettingRow label="Default study mode" hint="Set once, apply everywhere">
          <div className="flex flex-col gap-1">
            {STUDY_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => {
                  void update({ studyMode: m.value });
                  void track("study_mode_changed", { to: m.value });
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition",
                  prefs.studyMode === m.value
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                )}
              >
                <span className="font-semibold">{m.label}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{m.hint}</span>
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Daily goal" hint="Minutes you aim to study each day">
          <input
            type="number"
            min={5}
            max={240}
            step={5}
            value={prefs.dailyGoalMinutes}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!Number.isNaN(val) && val >= 5 && val <= 240) {
                void update({ dailyGoalMinutes: val });
              }
            }}
            className="w-24 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-sm"
          />
        </SettingRow>
        <SettingRow label="Strict gating" hint="Require mastery gates to advance between modules">
          <Toggle value={prefs.strictGating} onChange={(v) => void update({ strictGating: v })} />
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow label="Sound effects" hint="Completion chimes and timer pings">
          <Toggle value={prefs.soundEnabled} onChange={(v) => void update({ soundEnabled: v })} />
        </SettingRow>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Review and streak reminders will arrive in a future update.
        </p>
      </Section>

      {/* Data */}
      <Section title="Data">
        <p className="text-xs text-[var(--color-text-secondary)]">
          Your data is stored locally on this device. Nothing is sent to any server.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            <Download className="h-3.5 w-3.5" />
            Export my data
          </button>
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all data
          </button>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="text-xs text-[var(--color-text-secondary)]">
          <p className="font-semibold text-[var(--color-text-primary)]">DURA · v0.1.0</p>
          <p>Durwood Studios LLC · Open source · AGPLv3</p>
          <p className="mt-2 flex gap-3">
            <Link
              href="https://github.com/Durwood-Studios/Dura"
              className="text-emerald-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
            <Link href="/open-source" className="text-emerald-600 hover:underline">
              Open source
            </Link>
          </p>
        </div>
      </Section>

      {confirmingClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center shadow-xl">
            <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" aria-hidden />
            <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
              Clear all data?
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              This permanently deletes your progress, flashcards, goals, certificates, and
              preferences on this device. There is no undo.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleClear()}
                className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Delete everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        {hint && <p className="text-[11px] text-[var(--color-text-muted)]">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "relative h-6 w-11 rounded-full border transition",
        value
          ? "border-emerald-500 bg-emerald-500"
          : "border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-[var(--color-bg-surface)] shadow transition",
          value ? "left-5" : "left-0.5"
        )}
      />
    </button>
  );
}
