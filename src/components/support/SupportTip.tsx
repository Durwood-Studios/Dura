"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { TIP_PRESETS_USD, TIP_MIN_USD, TIP_MAX_USD, type TipInterval } from "@/lib/payments/tips";

/**
 * Voluntary "Support the Developer" tip widget. Redirects to Stripe-hosted
 * Checkout — no card data ever touches this app. Per Rule 7 the copy makes
 * unmistakable that a tip unlocks nothing; DURA is free forever.
 */
export function SupportTip(): React.ReactElement {
  const [amount, setAmount] = useState<number>(5);
  const [custom, setCustom] = useState<string>("");
  const [interval, setInterval] = useState<TipInterval>("once");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = custom.trim() ? Number(custom) : amount;
  const isValid =
    Number.isFinite(effectiveAmount) &&
    Number.isInteger(effectiveAmount) &&
    effectiveAmount >= TIP_MIN_USD &&
    effectiveAmount <= TIP_MAX_USD;

  async function handleSupport(): Promise<void> {
    if (!isValid) {
      setError(`Enter a whole dollar amount between $${TIP_MIN_USD} and $${TIP_MAX_USD}.`);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/tips/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd: effectiveAmount, interval }),
      });
      if (res.status === 503) {
        setError("Tipping isn’t available right now. Thanks for the thought!");
        return;
      }
      if (!res.ok) {
        setError("Couldn’t start checkout. Please try again.");
        return;
      }
      const { url } = (await res.json()) as { url?: string };
      if (url) {
        window.location.href = url;
        return;
      }
      setError("Couldn’t start checkout. Please try again.");
    } catch {
      setError("Couldn’t start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      {/* Interval toggle */}
      <div
        role="group"
        aria-label="Tip frequency"
        className="mb-5 inline-flex rounded-full border border-[var(--color-border)] p-0.5 text-sm"
      >
        {(["once", "month"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={interval === opt}
            onClick={() => setInterval(opt)}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              interval === opt
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {opt === "once" ? "One-time" : "Monthly"}
          </button>
        ))}
      </div>

      {/* Preset amounts */}
      <div className="mb-3 grid grid-cols-4 gap-2">
        {TIP_PRESETS_USD.map((preset) => {
          const active = !custom.trim() && amount === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setAmount(preset);
                setCustom("");
                setError(null);
              }}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
              }`}
            >
              ${preset}
            </button>
          );
        })}
      </div>

      {/* Custom amount */}
      <label className="mb-5 block">
        <span className="sr-only">Custom amount in US dollars</span>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 focus-within:border-[var(--color-accent)]">
          <span className="text-[var(--color-text-muted)]">$</span>
          <input
            type="number"
            inputMode="numeric"
            min={TIP_MIN_USD}
            max={TIP_MAX_USD}
            step={1}
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setError(null);
            }}
            placeholder="Custom amount"
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <span className="text-xs text-[var(--color-text-muted)]">
            {interval === "month" ? "/ month" : "USD"}
          </span>
        </div>
      </label>

      {error && (
        <p className="mb-3 text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSupport}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:outline-none disabled:opacity-50"
      >
        <Heart className="h-4 w-4" aria-hidden />
        {isLoading
          ? "Redirecting…"
          : interval === "month"
            ? `Support $${isValid ? effectiveAmount : "…"}/mo`
            : `Send $${isValid ? effectiveAmount : "…"}`}
      </button>

      <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
        Secure checkout by Stripe. This is a voluntary thank-you — it unlocks nothing. DURA is free
        forever.
      </p>
    </div>
  );
}
