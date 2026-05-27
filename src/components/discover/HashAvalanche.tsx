"use client";

import { useEffect, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const DEFAULT_A = "Hello, world!";
const DEFAULT_B = "Hello, world.";

/** Compute SHA-256 of a string using the Web Crypto API. */
async function sha256(message: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

/** Convert bytes to a flat array of 0s and 1s. */
function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]!;
    for (let b = 7; b >= 0; b--) {
      bits.push((byte >> b) & 1);
    }
  }
  return bits;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface BitGridProps {
  label: string;
  bits: number[];
  diffs: boolean[];
  hex: string;
  loading: boolean;
}

function BitGrid({ label, bits, diffs, hex, loading }: BitGridProps): React.ReactElement {
  // Always render 256 cells so the grid layout is stable from the first paint —
  // before SHA-256 resolves, show a skeleton; once it resolves, swap to the real bits.
  const cells = bits.length === 256 ? bits : new Array(256).fill(0);
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        {label}
      </p>
      <div
        className={`grid gap-px rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-2 ${loading ? "animate-pulse" : ""}`}
        style={{ gridTemplateColumns: "repeat(32, minmax(0, 1fr))" }}
        aria-busy={loading}
      >
        {cells.map((bit, i) => {
          let bg: string;
          if (loading) {
            bg = "var(--color-bg-surface)";
          } else if (diffs[i]) {
            bg = bit === 1 ? "#fb7185" : "rgba(251, 113, 133, 0.25)";
          } else {
            bg = bit === 1 ? "rgba(52, 211, 153, 0.85)" : "var(--color-bg-surface)";
          }
          return (
            <div
              key={i}
              className="aspect-square rounded-[1px] transition-colors duration-200"
              style={{ backgroundColor: bg }}
              aria-label={loading ? "computing" : `bit ${i}: ${bit}${diffs[i] ? " (differs)" : ""}`}
            />
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[10px] leading-relaxed break-all text-[var(--color-text-muted)]">
        {hex}
      </p>
    </div>
  );
}

export default function HashAvalanche(): React.ReactElement {
  const [inputA, setInputA] = useState(DEFAULT_A);
  const [inputB, setInputB] = useState(DEFAULT_B);
  const [hashA, setHashA] = useState<Uint8Array | null>(null);
  const [hashB, setHashB] = useState<Uint8Array | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([sha256(inputA), sha256(inputB)]).then(([a, b]) => {
      if (cancelled) return;
      setHashA(a);
      setHashB(b);
    });
    return () => {
      cancelled = true;
    };
  }, [inputA, inputB]);

  // Mark complete once the user has changed at least one of the defaults.
  useEffect(() => {
    if ((inputA !== DEFAULT_A || inputB !== DEFAULT_B) && !completedRef.current) {
      completedRef.current = true;
      markActivityComplete("hash-avalanche");
    }
  }, [inputA, inputB]);

  const bitsA = hashA ? bytesToBits(hashA) : [];
  const bitsB = hashB ? bytesToBits(hashB) : [];
  const diffs = bitsA.map((b, i) => b !== bitsB[i]);
  const diffCount = diffs.filter(Boolean).length;
  const diffPercent = bitsA.length > 0 ? ((diffCount / bitsA.length) * 100).toFixed(1) : "0.0";

  // Color the percentage based on how close to the theoretical ideal of 50%.
  const distanceFromIdeal = Math.abs(50 - Number(diffPercent));
  const percentColor =
    distanceFromIdeal < 5 ? "#34d399" : distanceFromIdeal < 15 ? "#fbbf24" : "#fb7185";

  return (
    <div className="space-y-7">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Message A</span>
          <input
            type="text"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Message B</span>
          <input
            type="text"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>
      </div>

      {/* Diff summary */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-5 text-center">
        <p className="font-mono text-5xl font-bold" style={{ color: percentColor }}>
          {diffPercent}%
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          of bits differ — {diffCount} of 256
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          A cryptographic hash should hover near 50% even for one-character input changes. Edit
          either input to explore.
        </p>
      </div>

      {/* Bit grids — two side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BitGrid
          label="SHA-256 of A"
          bits={bitsA}
          diffs={diffs}
          hex={hashA ? bytesToHex(hashA) : "computing…"}
          loading={!hashA}
        />
        <BitGrid
          label="SHA-256 of B"
          bits={bitsB}
          diffs={diffs}
          hex={hashB ? bytesToHex(hashB) : "computing…"}
          loading={!hashB}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: "rgba(52, 211, 153, 0.85)" }}
          />
          bit is 1, same in both
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm border border-[var(--color-border)]"
            style={{ backgroundColor: "var(--color-bg-surface)" }}
          />
          bit is 0, same in both
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#fb7185" }} />
          differs between A and B
        </span>
      </div>
    </div>
  );
}
