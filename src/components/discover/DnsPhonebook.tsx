"use client";

import { useCallback, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";
import { cn } from "@/lib/utils";

interface DnsEntry {
  domain: string;
  ip: string;
}

const DNS_ENTRIES: DnsEntry[] = [
  { domain: "google.com", ip: "142.250.80.46" },
  { domain: "youtube.com", ip: "142.250.190.78" },
  { domain: "wikipedia.org", ip: "208.80.154.224" },
  { domain: "github.com", ip: "140.82.121.3" },
  { domain: "nasa.gov", ip: "52.0.14.116" },
  { domain: "minecraft.net", ip: "13.107.213.51" },
];

type LookupState = "idle" | "searching" | "found" | "not-found";

const CHAIN_STEPS = [
  { label: "Your Browser", emoji: "🌐" },
  { label: "Local DNS", emoji: "📋" },
  { label: "Root Server", emoji: "🏛️" },
  { label: "TLD Server", emoji: "🗂️" },
  { label: "Website Server", emoji: "💻" },
];

/** DNS Phone Book — show how domain names map to IP addresses. */
export function DnsPhonebook(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<LookupState>("idle");
  const [result, setResult] = useState<DnsEntry | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [lookupCount, setLookupCount] = useState(0);
  const [showChain, setShowChain] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookup = useCallback((): void => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || state === "searching") return;

    setState("searching");
    setResult(null);
    setHighlightIndex(-1);
    setShowChain(false);

    // Animate flipping through entries
    let step = 0;
    const totalSteps = DNS_ENTRIES.length;

    function flipNext(): void {
      if (step < totalSteps) {
        setHighlightIndex(step);
        step++;
        flipTimerRef.current = setTimeout(flipNext, 250);
      } else {
        // Done flipping — check for match
        const match = DNS_ENTRIES.find((e) => e.domain === trimmed);
        setHighlightIndex(-1);

        if (match) {
          setResult(match);
          setState("found");
          setLookupCount((c) => {
            const next = c + 1;
            if (next >= 2) {
              markActivityComplete("dns-phonebook");
            }
            return next;
          });
        } else {
          setState("not-found");
        }
      }
    }

    timerRef.current = setTimeout(flipNext, 300);
  }, [query, state]);

  const reset = useCallback((): void => {
    setState("idle");
    setResult(null);
    setQuery("");
    setHighlightIndex(-1);
    setShowChain(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        DNS Phone Book
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Type a website name to look up its address
      </p>

      {/* Phone book */}
      <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h3 className="mb-4 text-center text-sm font-semibold text-[var(--color-text-muted)]">
          📖 The Internet Phone Book
        </h3>
        <div className="flex flex-col gap-2">
          {DNS_ENTRIES.map((entry, i) => (
            <div
              key={entry.domain}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3 text-base transition-all duration-200",
                highlightIndex === i
                  ? "scale-[1.02] bg-[var(--color-accent-emerald)]/20"
                  : result?.domain === entry.domain && state === "found"
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "bg-[var(--color-bg-surface-hover)]"
              )}
            >
              <span className="font-medium text-[var(--color-text-primary)]">{entry.domain}</span>
              <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-muted)]">
                {entry.ip}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="flex w-full gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (state !== "idle" && state !== "searching") {
              setState("idle");
              setResult(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") lookup();
          }}
          placeholder="Type a domain (e.g. google.com)"
          className="min-h-[48px] flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:outline-none"
          disabled={state === "searching"}
        />
        <button
          type="button"
          onClick={lookup}
          disabled={state === "searching" || !query.trim()}
          className="min-h-[48px] rounded-2xl bg-[var(--color-accent-emerald)] px-6 py-3 text-base font-semibold text-white transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          Look up
        </button>
      </div>

      {/* Result */}
      {state === "found" && result && (
        <div className="w-full rounded-2xl bg-emerald-500/10 p-6 text-center">
          <p className="mb-1 text-lg font-semibold text-emerald-400">Connected!</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">{result.domain}</span>
            {" → "}
            <span className="font-[family-name:var(--font-mono)] text-[var(--color-accent-emerald)]">
              {result.ip}
            </span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-2xl">
            <span>💻</span>
            <span className="text-sm text-[var(--color-text-muted)]">→</span>
            <span>🌐</span>
            <span className="text-sm text-[var(--color-text-muted)]">→</span>
            <span>📡</span>
            <span className="text-sm text-[var(--color-text-muted)]">→</span>
            <span>💻</span>
          </div>
          <button
            type="button"
            onClick={() => setShowChain((v) => !v)}
            className="mt-4 text-sm font-medium text-[var(--color-accent-emerald)] underline underline-offset-2"
          >
            {showChain ? "Hide" : "Show"} what really happens
          </button>
        </div>
      )}

      {state === "not-found" && (
        <div className="w-full rounded-2xl bg-amber-500/10 p-6 text-center">
          <p className="text-base font-medium text-amber-400">
            That website isn&apos;t in our phone book.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            In real life, DNS servers have billions of entries.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 min-h-[48px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-transform duration-150 hover:scale-105"
          >
            Try again
          </button>
        </div>
      )}

      {/* DNS chain visualization */}
      {showChain && (
        <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h3 className="mb-4 text-center text-sm font-semibold text-[var(--color-text-muted)]">
            What Really Happens
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CHAIN_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-bg-surface-hover)] px-4 py-3">
                  <span className="text-2xl">{step.emoji}</span>
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {step.label}
                  </span>
                </div>
                {i < CHAIN_STEPS.length - 1 && (
                  <span className="text-[var(--color-text-muted)]">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What you just learned */}
      {lookupCount >= 2 && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
            What you just learned
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            When you type a website name, your computer asks a DNS server to look up the address —
            just like looking up a phone number. Without DNS, you&apos;d have to remember numbers
            like 142.250.80.46.
          </p>
        </div>
      )}
    </div>
  );
}
