"use client";

import { useState, useCallback } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface AgeGateProps {
  /** Called when the user confirms they are 13+. */
  onVerified: () => void;
}

/**
 * COPPA age gate component. Collects month/year only (minimal PII).
 * Used during Supabase auth sign-up flow (Phase J).
 *
 * Not wired into any flow yet — the auth integration will import this.
 */
export function AgeGate({ onVerified }: AgeGateProps): React.ReactElement {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [blocked, setBlocked] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (isNaN(m) || isNaN(y) || m < 1 || m > 12 || y < 1900) return;

      const now = new Date();
      const birthDate = new Date(y, m - 1);
      const age = (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

      if (age >= 13) {
        // Store in sessionStorage — not persisted across sessions, not in IDB
        try {
          sessionStorage.setItem("dura-age-verified", "true");
        } catch {
          // ignore — private mode
        }
        onVerified();
      } else {
        setBlocked(true);
      }
    },
    [month, year, onVerified]
  );

  if (blocked) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900 dark:bg-amber-950/30">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-amber-500" />
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
          Age Requirement
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          DURA requires users to be at least 13 years old to create an account. You can still use
          DURA without an account — all features work locally on your device.
        </p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-emerald-500" />
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Verify Your Age</h2>
      </div>
      <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        To create an account, please confirm your birth month and year. We only use this to verify
        you meet the minimum age requirement. This information is not stored.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label
              htmlFor="age-month"
              className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]"
            >
              Month
            </label>
            <select
              id="age-month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            >
              <option value="">Select</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="age-year"
              className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]"
            >
              Year
            </label>
            <select
              id="age-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            >
              <option value="">Select</option>
              {Array.from({ length: 100 }, (_, i) => {
                const y = currentYear - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
