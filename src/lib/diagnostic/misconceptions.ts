import type { Misconception, MisconceptionCatalog } from "./types";

/**
 * The misconception catalog. Each entry is a named, durable concept — when a
 * wrong-answer choice cites a misconception ID, the diagnostic engine looks
 * it up here and produces the rendered "why you picked this" feedback.
 *
 * Adding new entries: choose a kebab-case ID that survives renaming the
 * question (e.g. "off-by-one-indexing", not "phase-0-q4-wrong-b").
 */
const ENTRIES: Misconception[] = [
  {
    id: "off-by-one-indexing",
    name: "Off-by-one on a 0-indexed array",
    description:
      "Treating arr[arr.length] as the last element. In 0-indexed languages the last element lives at arr.length - 1; the bare arr.length slot is one past the end and reads as undefined.",
    remediation: {
      kind: "lesson",
      path: "/paths/0/0-1/01",
      label: "Phase 0 · Arrays & indexing",
    },
  },
  {
    id: "list-vs-array-confusion",
    name: "Confuses list with array",
    description:
      "Reaching for list-like operations (push, pop, splice) on a fixed-size array, or assuming all sequences share the same complexity profile. Lists and arrays have different costs and different APIs.",
    remediation: {
      kind: "lesson",
      path: "/paths/0/0-2/03",
      label: "Phase 0 · Data structures basics",
    },
  },
  {
    id: "string-length-vs-codepoint",
    name: "Counts code units, not characters",
    description:
      "Assumes string.length returns the number of visible characters. In JavaScript it returns the number of UTF-16 code units, so emojis and many CJK characters count as 2.",
    remediation: {
      kind: "reading",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length",
      label: "MDN · String.length",
    },
  },
  {
    id: "shallow-vs-deep-copy",
    name: "Treats spread as a deep copy",
    description:
      "Assumes {...obj} or [...arr] produces an independent copy. The spread operator copies one level; nested objects are still shared references, which is how state mutations sneak in across React re-renders.",
    remediation: {
      kind: "lesson",
      path: "/paths/2/2-3/04",
      label: "Phase 2 · Object identity & references",
    },
  },
  {
    id: "n-plus-one-disguised-as-property",
    name: "ORM property access hides a query",
    description:
      "Reads user.posts as a plain property access when it is actually a database round-trip. Hidden under a tight loop this produces the N+1 query bug — the most common backend performance pathology in production code.",
    remediation: {
      kind: "lesson",
      path: "/paths/4/4-2/02",
      label: "Phase 4 · N+1 queries",
    },
  },

  // ─── IEEE 754 floating-point (Phase 1 integration) ──────────────────────
  // Anchored to IEEE 754-2019 (Standard for Floating-Point Arithmetic). These
  // are the three highest-leverage misconceptions a working engineer hits in
  // production code — the canonical 0.1 + 0.2 surprise, the trap of using ==
  // on derived float values, and the NaN-equality counter-intuition.
  {
    id: "assumes-decimal-precision",
    name: "Assumes decimal arithmetic is exact in IEEE 754",
    description:
      "Treats 0.1 + 0.2 as if it equals 0.3 exactly. IEEE 754 binary64 cannot represent 0.1 or 0.2 exactly — both round to the nearest representable double — so the sum is 0.30000000000000004, off by one ULP. This is the most-cited 'gotcha' in float literacy.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-3/01",
      label: "Phase 1 · IEEE 754 floating-point",
    },
  },
  {
    id: "float-equality-derived",
    name: "Uses == on derived float values",
    description:
      "Compares two floats with == when at least one was computed (a sum, a product, a transcendental). Even when the mathematical result is identical, the representations may differ. Standard practice is to test |a - b| < epsilon with epsilon chosen by domain — and the choice itself is non-trivial.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-3/01",
      label: "Phase 1 · IEEE 754 floating-point",
    },
  },
  {
    id: "nan-equality-comparison",
    name: "Expects NaN to equal itself",
    description:
      "Assumes NaN == NaN is true. IEEE 754 defines NaN as not equal to any value including itself — that's the only way a value can fail a self-equality test. Use Number.isNaN(x) or x !== x to test for NaN; the language-level equality will mislead.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-3/01",
      label: "Phase 1 · IEEE 754 floating-point",
    },
  },

  // ─── POSIX / IEEE 1003.1 (Phase 1 integration) ──────────────────────────
  // Anchored to POSIX.1-2024 (Issue 8 / IEEE Std 1003.1-2024). Three real
  // production bugs working systems engineers hit: async-signal-safety
  // violations in signal handlers, fully-buffered stdout when stdout is
  // not a tty, and POSIX-vs-bash shell extensions.
  {
    id: "signal-handler-library-calls",
    name: "Calls non-async-signal-safe functions in a signal handler",
    description:
      "Assumes any libc function can be called from inside a signal handler. POSIX defines a specific list of async-signal-safe functions (write, _exit, kill, sigaction, etc.) and only those are guaranteed reentrant; calling printf, malloc, or pthread_mutex_lock from a handler is undefined behaviour and a common deadlock/heap-corruption source.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-4/03",
      label: "Phase 1 · POSIX signals & async-safety",
    },
  },
  {
    id: "stdout-buffering-mode",
    name: "Treats stdout as line-buffered when piped",
    description:
      "Assumes stdout always flushes on '\\n'. POSIX libc switches stdout to fully-buffered when it is NOT connected to a terminal (e.g. when piped to grep or redirected to a file), so output may not appear until the buffer fills or the process exits. The classic 'my logs disappeared' bug. Fix: explicit fflush() or setvbuf() at startup.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-4/03",
      label: "Phase 1 · POSIX signals & async-safety",
    },
  },
  {
    id: "posix-vs-shell-extensions",
    name: "Confuses POSIX shell with bash extensions",
    description:
      "Writes a script with #!/bin/sh but uses bash-only constructs ([[ ]], arrays, $'...', process substitution). On Debian, Ubuntu, Alpine, BusyBox the system /bin/sh is dash or ash — not bash — and the script breaks. Either use #!/usr/bin/env bash (and depend on bash) or constrain yourself to POSIX.1 features.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-4/03",
      label: "Phase 1 · POSIX signals & async-safety",
    },
  },
];

export const MISCONCEPTIONS: MisconceptionCatalog = Object.freeze(
  ENTRIES.reduce<Record<string, Misconception>>((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {})
);
