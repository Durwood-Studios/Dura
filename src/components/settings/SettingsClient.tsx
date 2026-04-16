"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  Trash2,
  AlertTriangle,
  Shield,
  Accessibility,
  Keyboard,
  Check,
} from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { clearAllData, exportAllData } from "@/lib/clearAllData";
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
  { value: "standard", label: "Standard", hint: "Full lesson layout" },
  { value: "bite", label: "Bite-sized", hint: "Lessons split into short segments" },
  { value: "focus", label: "Focus", hint: "Hide nav, distraction-free" },
  { value: "review", label: "Review", hint: "Flashcard sessions only" },
  { value: "sprint", label: "Sprint", hint: "Pomodoro timer in top bar" },
  { value: "challenge", label: "Challenge", hint: "Timed quiz mode" },
];

const SHORTCUTS = [
  { keys: "Ctrl + K", action: "Command palette" },
  { keys: "Ctrl + Shift + F", action: "Toggle focus mode" },
  { keys: "Space", action: "Flip flashcard" },
  { keys: "← →", action: "Navigate bite-sized segments" },
  { keys: "1-4", action: "Rate flashcard (Again/Hard/Good/Easy)" },
];

export function SettingsClient(): React.ReactElement {
  const prefs = usePreferencesStore((s) => s.prefs);
  const update = usePreferencesStore((s) => s.update);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const confirmSave = useCallback(() => {
    setSaved(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaved(false), 1500);
  }, []);

  /** Wrap update calls to show the save indicator */
  const save = useCallback(
    (patch: Parameters<typeof update>[0]) => {
      void update(patch);
      confirmSave();
    },
    [update, confirmSave]
  );

  const handleExport = async (): Promise<void> => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dura-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async (): Promise<void> => {
    await clearAllData();
    setConfirmingClear(false);
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Appearance ──────────────────────────────────────────────── */}
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
                onClick={() => save({ fontSize: f.value })}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  prefs.fontSize === f.value
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* ── Accessibility ──────────────────────────────────────────── */}
      <Section title="Accessibility" icon={<Accessibility className="h-4 w-4 text-emerald-500" />}>
        <SettingRow label="Reduced motion" hint="Disable animations site-wide">
          <Toggle value={prefs.reducedMotion} onChange={(v) => save({ reducedMotion: v })} />
        </SettingRow>
        <SettingRow label="High contrast" hint="Increase text contrast and border visibility">
          <Toggle value={prefs.highContrast} onChange={(v) => save({ highContrast: v })} />
        </SettingRow>
        <SettingRow label="Dyslexia-friendly font" hint="Switch to OpenDyslexic for body text">
          <Toggle value={prefs.dyslexiaFont} onChange={(v) => save({ dyslexiaFont: v })} />
        </SettingRow>
      </Section>

      {/* ── Learning ───────────────────────────────────────────────── */}
      <Section title="Learning">
        <SettingRow label="Default study mode" hint="Choose how lessons are presented">
          <div className="flex flex-col gap-1.5">
            {STUDY_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => {
                  save({ studyMode: m.value });
                  void track("study_mode_changed", { to: m.value });
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition",
                  prefs.studyMode === m.value
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
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
                save({ dailyGoalMinutes: val });
              }
            }}
            className="w-24 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </SettingRow>
        <SettingRow label="Strict gating" hint="Require mastery gates to advance between modules">
          <Toggle value={prefs.strictGating} onChange={(v) => save({ strictGating: v })} />
        </SettingRow>
        <SettingRow
          label="Show streak counter"
          hint="Turn off if streaks feel pressuring. Missing a day changes nothing about what you've learned."
        >
          <Toggle value={prefs.showStreak} onChange={(v) => save({ showStreak: v })} />
        </SettingRow>
      </Section>

      {/* ── Notifications ──────────────────────────────────────────── */}
      <Section title="Notifications">
        <SettingRow label="Sound effects" hint="Completion chimes and timer pings">
          <Toggle value={prefs.soundEnabled} onChange={(v) => save({ soundEnabled: v })} />
        </SettingRow>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Review and streak reminders will arrive in a future update.
        </p>
      </Section>

      {/* ── Keyboard shortcuts ─────────────────────────────────────── */}
      <Section
        title="Keyboard shortcuts"
        icon={<Keyboard className="h-4 w-4 text-[var(--color-text-muted)]" />}
      >
        <div className="grid gap-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">{s.action}</span>
              <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Data ───────────────────────────────────────────────────── */}
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
            className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all data
          </button>
        </div>
      </Section>

      {/* ── Privacy ────────────────────────────────────────────────── */}
      <Section title="Privacy">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-4 w-4 text-emerald-500" />
          <div className="text-xs text-[var(--color-text-secondary)]">
            <p>All your data is stored locally on this device. No cookies. No tracking.</p>
            <p className="mt-2 flex gap-3">
              <Link
                href="/privacy"
                className="text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="mt-3 inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] opacity-50"
        >
          Delete Account — available when signed in
        </button>
      </Section>

      {/* ── About ──────────────────────────────────────────────────── */}
      <Section title="About">
        <div className="text-xs text-[var(--color-text-secondary)]">
          <p className="font-semibold text-[var(--color-text-primary)]">DURA · v0.1.0</p>
          <p>Durwood Studios LLC · Open source · AGPLv3</p>
          <p className="mt-2 flex gap-3">
            <Link
              href="https://github.com/Durwood-Studios/Dura"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
            <Link
              href="/open-source"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Open source
            </Link>
          </p>
        </div>
      </Section>

      {/* ── Save confirmation toast ──────────────────────────────────── */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 animate-in items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg duration-200 fade-in">
          <Check className="h-3.5 w-3.5" />
          Saved
        </div>
      )}

      {/* ── Confirm clear modal ────────────────────────────────────── */}
      {confirmingClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div
            role="alertdialog"
            aria-labelledby="clear-title"
            aria-describedby="clear-desc"
            className="max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center shadow-xl"
          >
            <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" aria-hidden />
            <h3
              id="clear-title"
              className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]"
            >
              Clear all data?
            </h3>
            <p id="clear-desc" className="mt-1 text-sm text-[var(--color-text-secondary)]">
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
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="dura-card p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          {title}
        </h2>
      </div>
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
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition dark:bg-[var(--color-bg-surface)]",
          value ? "left-5" : "left-0.5"
        )}
      />
    </button>
  );
}
