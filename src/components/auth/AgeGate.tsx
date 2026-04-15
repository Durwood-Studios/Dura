"use client";

import { useState } from "react";

/**
 * AgeGate — Verifies the user is 13 or older before proceeding to account
 * creation. Required for COPPA compliance.
 *
 * Usage: Rendered during the Supabase auth sign-up flow (Phase J).
 * Not wired into any current flow — all current features work locally
 * without an account and collect no personal information.
 *
 * The component captures month/year only (not full birthdate) to minimize
 * PII collection. The result is stored in sessionStorage so it persists
 * for the current sign-up attempt but is not saved long-term.
 */

interface AgeGateProps {
  /** Called when the user passes age verification (13+) */
  onVerified: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;
const MAX_YEAR = CURRENT_YEAR;

export default function AgeGate({ onVerified }: AgeGateProps): React.ReactElement {
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<string>("");
  const [isUnder13, setIsUnder13] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(): void {
    setError(null);
    setIsUnder13(false);

    if (month === null) {
      setError("Please select your birth month.");
      return;
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
      setError("Please enter a valid birth year.");
      return;
    }

    // Calculate age using month/year only.
    // Use the last day of the birth month to be conservative (gives the
    // user the benefit of the doubt if their birthday hasn't passed yet).
    const now = new Date();
    const birthDate = new Date(yearNum, month + 1, 0); // last day of birth month
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 13) {
      setIsUnder13(true);
      return;
    }

    // Store verification in sessionStorage (not IndexedDB — we don't
    // persist birthdates, and this only needs to last for the current
    // sign-up attempt).
    try {
      sessionStorage.setItem("dura-age-verified", "true");
    } catch {
      // sessionStorage may be unavailable in some contexts — proceed anyway
    }

    onVerified();
  }

  if (isUnder13) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-subtle)]">
          <span className="text-xl" aria-hidden>
            &#x1F512;
          </span>
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Account creation requires age 13+
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          DURA requires users to be at least 13 years old to create an account. You can still use
          every feature of DURA without an account — all learning, progress tracking, flashcards,
          and assessments work locally on your device.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsUnder13(false);
            setMonth(null);
            setYear("");
          }}
          className="mt-6 text-sm text-[var(--color-accent-emerald)] underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Verify your age</h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        DURA requires account holders to be at least 13 years old.
      </p>

      <div className="mt-6 flex gap-3">
        {/* Month selector */}
        <div className="flex-1">
          <label
            htmlFor="age-gate-month"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            Birth month
          </label>
          <select
            id="age-gate-month"
            value={month === null ? "" : month}
            onChange={(e) => setMonth(e.target.value === "" ? null : parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:outline-none"
          >
            <option value="">Month</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Year input */}
        <div className="w-28">
          <label
            htmlFor="age-gate-year"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            Birth year
          </label>
          <input
            id="age-gate-year"
            type="number"
            inputMode="numeric"
            placeholder="YYYY"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--color-accent-rose)]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-6 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
      >
        Continue
      </button>

      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
        We only use this to verify your age. Your birth month and year are not stored.
      </p>
    </div>
  );
}
