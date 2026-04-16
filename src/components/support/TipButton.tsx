"use client";

import { useEffect, useState } from "react";
import { Coffee, Heart, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Voluntary tip button. Unlocks nothing. Gates nothing. Free forever
 * is the core promise — tips are optional gratitude, nothing more.
 *
 * Stripe Payment Links are set via env vars so they can slot in when
 * the Dashboard links are created (PLANNING.md §33 blocker #5). When
 * any of the four env vars are missing the button still renders — the
 * missing tier just links to the GitHub repo as a fallback instead.
 *
 * Env vars (all optional):
 * - NEXT_PUBLIC_TIP_LINK_COFFEE ($5)
 * - NEXT_PUBLIC_TIP_LINK_LUNCH  ($15)
 * - NEXT_PUBLIC_TIP_LINK_BOOST  ($50)
 * - NEXT_PUBLIC_TIP_LINK_CUSTOM (any amount)
 */

const STORAGE_KEY = "dura-tip-seen";
const FALLBACK = "https://github.com/Durwood-Studios/Dura";

interface TipTier {
  label: string;
  amount: string;
  hint: string;
  envKey: keyof Pick<
    NodeJS.ProcessEnv,
    | "NEXT_PUBLIC_TIP_LINK_COFFEE"
    | "NEXT_PUBLIC_TIP_LINK_LUNCH"
    | "NEXT_PUBLIC_TIP_LINK_BOOST"
    | "NEXT_PUBLIC_TIP_LINK_CUSTOM"
  >;
}

const TIERS: TipTier[] = [
  {
    label: "Coffee",
    amount: "$5",
    hint: "Buy me a coffee while I write your next lesson",
    envKey: "NEXT_PUBLIC_TIP_LINK_COFFEE",
  },
  {
    label: "Lunch",
    amount: "$15",
    hint: "Fund a late-night debugging session",
    envKey: "NEXT_PUBLIC_TIP_LINK_LUNCH",
  },
  {
    label: "Boost",
    amount: "$50",
    hint: "Fuel a full weekend of content creation",
    envKey: "NEXT_PUBLIC_TIP_LINK_BOOST",
  },
  {
    label: "Custom",
    amount: "$",
    hint: "Name your own — every dollar keeps DURA free",
    envKey: "NEXT_PUBLIC_TIP_LINK_CUSTOM",
  },
];

function resolveHref(tier: TipTier): string {
  const value = process.env[tier.envKey];
  return value && value.length > 0 ? value : FALLBACK;
}

interface TipButtonProps {
  variant?: "floating" | "inline";
  className?: string;
}

export function TipButton({ variant = "floating", className }: TipButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [pulseOnce, setPulseOnce] = useState(false);

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

  const onTierClick = (tier: TipTier) => {
    void track("share_clicked", { contentType: "tip", contentId: tier.label });
  };

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Support the developer"
      className={cn(
        variant === "floating" &&
          "fixed right-6 bottom-24 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-rose-500 shadow-lg transition hover:scale-105 hover:bg-rose-50 lg:bottom-6",
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
            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((tier) => {
                const href = resolveHref(tier);
                return (
                  <a
                    key={tier.label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onTierClick(tier)}
                    className="flex flex-col gap-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 text-left text-sm transition hover:border-emerald-400 hover:bg-emerald-50/40"
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {tier.label}
                      </span>
                      <span className="font-mono text-xs text-emerald-600">{tier.amount}</span>
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{tier.hint}</span>
                  </a>
                );
              })}
            </div>
            <p className="mt-4 text-[10px] text-[var(--color-text-muted)]">
              Payment via Stripe. 2.9% + 30¢ goes to Stripe, the rest goes to building DURA. No
              middleman platforms.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
