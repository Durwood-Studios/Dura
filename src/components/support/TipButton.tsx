"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coffee, Heart, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { TIP_MIN_USD, TIP_MAX_USD } from "@/lib/payments/tips";

/**
 * Voluntary tip button — DURA's single money surface. Unlocks nothing.
 * Gates nothing. Free forever is the core promise — tips are optional
 * gratitude, nothing more.
 *
 * Tiers charge through POST /api/tips/checkout (Stripe-hosted Checkout;
 * no card data touches the app). When Stripe isn't configured the endpoint
 * returns 503 and the modal shows a friendly notice instead of charging.
 */

const STORAGE_KEY = "dura-tip-seen";

interface TipTier {
  label: string;
  amountUsd: number;
  hint: string;
}

const TIERS: TipTier[] = [
  { label: "Coffee", amountUsd: 5, hint: "Buy me a coffee while I write your next lesson" },
  { label: "Lunch", amountUsd: 15, hint: "Fund a late-night debugging session" },
  { label: "Boost", amountUsd: 50, hint: "Fuel a full weekend of content creation" },
];

interface TipButtonProps {
  variant?: "floating" | "inline";
  className?: string;
}

export function TipButton({ variant = "floating", className }: TipButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [pulseOnce, setPulseOnce] = useState(false);
  const [custom, setCustom] = useState("");
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  // First-visit subtle pulse (localStorage flag, shown at most once).
  useEffect(() => {
    if (variant !== "floating") return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setPulseOnce(true);
        localStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      // ignore (private mode)
    }
  }, [variant]);

  async function startCheckout(label: string, amountUsd: number): Promise<void> {
    setError(null);
    setPendingTier(label);
    void track("share_clicked", { contentType: "tip", contentId: label });

    try {
      const res = await fetch("/api/tips/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd, interval: "once" }),
      });
      if (res.status === 503) {
        setIsUnavailable(true);
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
      setPendingTier(null);
    }
  }

  const customAmount = Number(custom);
  const isCustomValid =
    Number.isInteger(customAmount) && customAmount >= TIP_MIN_USD && customAmount <= TIP_MAX_USD;

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Support the developer"
      className={cn(
        variant === "floating" &&
          "fixed right-6 bottom-[calc(96px+env(safe-area-inset-bottom)+8px)] z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-rose-500 shadow-lg transition hover:scale-105 hover:bg-rose-50 lg:bottom-6",
        variant === "inline" &&
          "inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]",
        pulseOnce && variant === "floating" && "tip-pulse-once",
        className
      )}
    >
      <Heart className={cn("h-5 w-5", variant === "inline" && "h-4 w-4")} aria-hidden />
      {variant === "inline" && <span>Support the developer</span>}
    </button>
  );

  return (
    <>
      {trigger}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-xl sm:rounded-2xl">
            <header className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-rose-500" aria-hidden />
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Support the developer
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              DURA is free and open source — built by Dustin Snellings at Durwood Studios. If this
              platform helped your journey, a tip keeps the lights on.
            </p>
            <p className="mb-4 text-xs text-[var(--color-text-muted)]">
              Unlocks nothing. Gates nothing. Free forever.
            </p>

            {error && (
              <p className="mb-3 text-sm text-[var(--color-error)]" role="alert">
                {error}
              </p>
            )}

            {isUnavailable && (
              <div
                role="status"
                className="mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-text-secondary)]"
              >
                Tipping isn’t available right now — thank you for the thought! The best way to
                support DURA today is to keep learning.{" "}
                <Link
                  href="/"
                  className="font-medium text-[var(--color-accent)] underline underline-offset-2 hover:opacity-80"
                >
                  Back to the DURA home screen
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  disabled={pendingTier !== null}
                  onClick={() => void startCheckout(tier.label, tier.amountUsd)}
                  className="flex flex-col gap-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 text-left text-sm transition hover:border-emerald-400 hover:bg-emerald-50/40 disabled:opacity-50"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {pendingTier === tier.label ? "Redirecting…" : tier.label}
                    </span>
                    <span className="font-mono text-xs text-emerald-600">${tier.amountUsd}</span>
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">{tier.hint}</span>
                </button>
              ))}

              {/* Custom tier — inline amount entry */}
              <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 text-left text-sm">
                <span className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text-primary)]">Custom</span>
                  <span className="font-mono text-xs text-emerald-600">$</span>
                </span>
                <div className="flex items-center gap-1.5">
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
                    placeholder="Amount"
                    aria-label="Custom tip amount in US dollars"
                    className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    disabled={!isCustomValid || pendingTier !== null}
                    onClick={() => void startCheckout("Custom", customAmount)}
                    className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
                  >
                    {pendingTier === "Custom" ? "…" : "Send"}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-[var(--color-text-muted)]">
              Secure checkout by Stripe. 2.9% + 30¢ goes to Stripe, the rest goes to building DURA.
              No middleman platforms.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
