import type { MCQQuestion } from "./types";

/**
 * Canonical reference questions. Three are enough to show the system end-to-
 * end: one elementary (Phase 0), one mid-curriculum (Phase 2), one production-
 * adjacent (Phase 4). Each uses a distinct misconception from the catalog so
 * authors can see how the schema cashes out in practice.
 */

export const ARRAY_INDEXING: MCQQuestion = {
  kind: "mcq",
  id: "phase-0-arrays-indexing-01",
  difficulty: "intro",
  prompt: "Given const arr = ['a', 'b', 'c'], which expression evaluates to the last element 'c'?",
  correct: {
    text: "arr[arr.length - 1]",
    explanation: "In a 0-indexed language the last valid index is one less than the length.",
  },
  distractors: [
    { text: "arr[arr.length]", misconception: "off-by-one-indexing" },
    { text: "arr.last()", misconception: "list-vs-array-confusion" },
    { text: "arr.pop()", misconception: "list-vs-array-confusion" },
  ],
  workedSolution: {
    steps: [
      "JavaScript arrays are 0-indexed: arr[0] is 'a', arr[1] is 'b', arr[2] is 'c'.",
      "arr.length is 3 — one past the last valid index.",
      "So the last element lives at arr[arr.length - 1] = arr[2] = 'c'.",
    ],
  },
  confidenceCheck: true,
  tags: ["arrays", "indexing", "javascript"],
};

export const STRING_LENGTH_EMOJI: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-string-length-emoji-01",
  difficulty: "core",
  prompt: 'In JavaScript, what does "🚀".length return?',
  correct: {
    text: "2",
    explanation:
      "JavaScript stores strings as UTF-16 code units. A rocket emoji is a surrogate pair → two code units → length 2.",
  },
  distractors: [
    { text: "1", misconception: "string-length-vs-codepoint" },
    { text: "4", misconception: "string-length-vs-codepoint" },
    {
      text: "Error — emojis are not valid in strings",
      misconception: "string-length-vs-codepoint",
    },
  ],
  workedSolution: {
    steps: [
      "JavaScript stores strings as UTF-16 code units (.length returns the unit count).",
      "Most Basic Multilingual Plane characters (ASCII, most CJK) fit in one code unit.",
      "Characters above U+FFFF — most emoji, some CJK extensions — are stored as a surrogate pair: two code units.",
      "So '🚀'.length === 2. Use Array.from(s).length or [...s].length if you want code-point count.",
    ],
  },
  confidenceCheck: true,
  tags: ["strings", "unicode", "javascript"],
};

export const N_PLUS_ONE_LOOP: MCQQuestion = {
  kind: "mcq",
  id: "phase-4-n-plus-one-loop-01",
  difficulty: "core",
  prompt:
    "An ORM query renders a list of users with their posts. The handler runs `users = User.all(); for (u of users) print(u.posts)`. With 200 users (each with 5 posts) and 20 ms per DB round-trip, what's the wall-clock latency?",
  correct: {
    text: "~4 seconds — one query per user iteration on top of the initial fetch",
    explanation:
      "u.posts looks like a property access but issues a database query. 1 (users) + 200 (per-user posts) = 201 round-trips × 20 ms ≈ 4 s.",
  },
  distractors: [
    {
      text: "~40 ms — the ORM joins automatically",
      misconception: "n-plus-one-disguised-as-property",
    },
    {
      text: "~20 ms — only the User.all() call hits the DB",
      misconception: "n-plus-one-disguised-as-property",
    },
    {
      text: "~100 ms — the ORM caches the posts lookup after the first call",
      misconception: "n-plus-one-disguised-as-property",
    },
  ],
  workedSolution: {
    steps: [
      "User.all() issues one query and returns 200 user rows.",
      "u.posts is a relation accessor: it issues a fresh query per call.",
      "The loop calls u.posts 200 times → 200 extra round-trips.",
      "Total: 1 + 200 = 201 round-trips × 20 ms = 4.02 s.",
      "Fix: prefetch the relation (User.all().includes(:posts) / .with('posts')) — 2 queries total.",
    ],
  },
  confidenceCheck: true,
  tags: ["database", "performance", "orm"],
};

// ─── Phase 1 · IEEE 754 floating-point ────────────────────────────────────
// Anchored to IEEE 754-2019. Canonical "the 0.1 + 0.2 surprise" question —
// the gateway misconception every working engineer eventually hits in
// production and the cleanest entry point for the IEEE 754 lesson.

export const IEEE_754_DECIMAL: MCQQuestion = {
  kind: "mcq",
  id: "phase-1-ieee754-decimal-sum-01",
  difficulty: "core",
  prompt: "In JavaScript, what does the expression (0.1 + 0.2 === 0.3) evaluate to?",
  correct: {
    text: "false",
    explanation:
      "0.1 and 0.2 cannot be represented exactly in IEEE 754 binary64. Their sum rounds to 0.30000000000000004, which differs from the binary64 representation of 0.3 by exactly one ULP.",
  },
  distractors: [
    { text: "true", misconception: "assumes-decimal-precision" },
    {
      text: "true — the runtime rounds derived values for equality",
      misconception: "float-equality-derived",
    },
    {
      text: "NaN — non-representable decimals produce NaN",
      misconception: "nan-equality-comparison",
    },
  ],
  workedSolution: {
    steps: [
      "IEEE 754 binary64 stores numbers as sign × mantissa × 2^exponent — a binary fraction.",
      "0.1 in binary is 0.0001100110011… (a repeating fraction). It cannot be exact in any finite binary representation.",
      "0.1 + 0.2 yields 0.30000000000000004 in binary64 — the closest representable double to the true sum.",
      "0.3 also rounds to a slightly different binary64 value. The two representations differ by one ULP (unit in the last place).",
      "So === — which compares bit patterns for primitives — returns false. For comparing computed floats, use |a - b| < epsilon, where epsilon is chosen by domain.",
    ],
  },
  confidenceCheck: true,
  tags: ["ieee-754", "floating-point", "javascript", "phase-1"],
};

// ─── Phase 1 · POSIX async-signal-safety ──────────────────────────────────
// Anchored to POSIX.1-2024 (IEEE Std 1003.1-2024). The async-signal-safety
// trap is the single most common deadlock/heap-corruption source in
// signal-using code — a perfect "industry-grade" diagnostic question.

export const POSIX_SIGNAL_SAFETY: MCQQuestion = {
  kind: "mcq",
  id: "phase-1-posix-signal-safety-01",
  difficulty: "stretch",
  prompt:
    "Your C program installs a SIGINT handler that needs to write the message 'caught signal' to standard error before exiting. Per POSIX.1, which of these is the safe way to do it inside the handler?",
  correct: {
    text: 'write(STDERR_FILENO, "caught signal\\n", 14)',
    explanation:
      "write() is on the POSIX async-signal-safe list. The handler can call it without invoking undefined behaviour, even if the main program was inside libc when the signal arrived.",
  },
  distractors: [
    {
      text: 'fprintf(stderr, "caught signal\\n")',
      misconception: "signal-handler-library-calls",
    },
    {
      text: 'char *msg = malloc(64); strcpy(msg, "caught signal\\n"); write(2, msg, 14)',
      misconception: "signal-handler-library-calls",
    },
    {
      text: 'pthread_mutex_lock(&log_mutex); log_message("caught signal\\n"); pthread_mutex_unlock(&log_mutex)',
      misconception: "signal-handler-library-calls",
    },
  ],
  workedSolution: {
    steps: [
      "POSIX.1 defines a specific list of functions guaranteed to be safe inside a signal handler — the async-signal-safe set.",
      "If the main program was interrupted while inside, say, malloc's internal arena, calling malloc again from the handler can corrupt the heap.",
      "fprintf is not on the safe list — it touches stdio buffers and ultimately calls malloc.",
      "malloc is not on the safe list — re-entering the allocator is the canonical deadlock source.",
      "pthread_mutex_lock is not on the safe list — if the main program already holds the mutex, the handler deadlocks the thread.",
      "write() IS on the safe list. It maps to a single syscall, takes no locks, allocates no memory. Use it (with a static or stack-allocated buffer) for signal-handler I/O.",
    ],
  },
  confidenceCheck: true,
  tags: ["posix", "signals", "async-signal-safety", "c", "phase-1"],
};

export const ALL_EXAMPLES = [
  ARRAY_INDEXING,
  STRING_LENGTH_EMOJI,
  N_PLUS_ONE_LOOP,
  IEEE_754_DECIMAL,
  POSIX_SIGNAL_SAFETY,
] as const;
