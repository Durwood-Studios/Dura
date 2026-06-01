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

// ─── Phase 2 · RFC 2119 / BCP 14 ──────────────────────────────────────────
// Anchored to RFC 2119 + RFC 8174. The MUST/SHOULD/MAY gradient drives daily
// PR-review disagreements; this question pinpoints the most-missed nuance.

export const RFC_2119_SHOULD: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-rfc2119-should-01",
  difficulty: "core",
  prompt:
    "An IETF spec says: 'Implementations SHOULD reject malformed payloads.' Per RFC 2119 / BCP 14, what is the obligation on a conforming implementation?",
  correct: {
    text: "Reject by default; if you do not reject, you must understand the implications and have a documented reason",
    explanation:
      "RFC 2119 defines SHOULD as: there may exist valid reasons in particular circumstances to ignore this requirement, but the full implications must be understood and weighed before choosing a different course.",
  },
  distractors: [
    {
      text: "Reject malformed payloads — SHOULD is binding identically to MUST",
      misconception: "confuses-rfc2119-vocabulary",
    },
    {
      text: "Implementations may safely ignore the recommendation — SHOULD is optional",
      misconception: "confuses-rfc2119-vocabulary",
    },
    {
      text: "The lowercase 'should' has no normative weight; only RFC 2119 uppercase MUST is binding",
      misconception: "informational-vs-standards-track",
    },
  ],
  workedSolution: {
    steps: [
      "RFC 2119 (and the updating RFC 8174) define the normative vocabulary used across IETF documents.",
      "ALL CAPS keywords (MUST, SHOULD, MAY) carry the normative meaning when used as defined. Lowercase or conventional usage does not.",
      "MUST means absolute requirement. MAY means truly optional. SHOULD sits between: there may be valid reasons to ignore, but those reasons must be weighed and documented.",
      "A spec that uses 'SHOULD reject' is saying: rejection is the default conforming behavior, but you can deviate if you have a documented and understood reason.",
      "The wrong answers either over-strict (treating SHOULD as MUST), over-lax (treating SHOULD as MAY), or wrongly dismiss the keyword entirely.",
    ],
  },
  confidenceCheck: true,
  tags: ["rfc-2119", "bcp-14", "ietf", "phase-2"],
};

// ─── Phase 2 · ECMA TC39 process ──────────────────────────────────────────
// Anchored to the TC39 staging process. Engineers shipping JS features at
// the wrong stage gate is a real production-breakage source.

export const TC39_STAGE_READINESS: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-tc39-stage-readiness-01",
  difficulty: "core",
  prompt:
    "A TC39 proposal you want to use for a production browser app is currently at Stage 2 (Draft). What is the safest characterization of shipping it?",
  correct: {
    text: "Stage 2 means the spec authors agree on the problem and a rough solution, but semantics can still change before Stage 4. Production use requires a transpiler pinning current semantics, plus accepting that the spec may diverge later.",
    explanation:
      "Per the TC39 Process Document, only Stage 4 is a 'Finished' proposal — the only stage where ECMA-262 has accepted the proposal with two spec-compliant implementations and tests.",
  },
  distractors: [
    {
      text: "Stage 2 means the proposal is implementation-ready — safe to use directly in modern engines",
      misconception: "tc39-stage-readiness",
    },
    {
      text: "Stage 2 is part of the most recent ECMAScript yearly edition; it's standardized",
      misconception: "tc39-stage-readiness",
    },
    {
      text: "Once any proposal reaches Stage 4, it ships in all major runtimes simultaneously",
      misconception: "tc39-cross-runtime",
    },
  ],
  workedSolution: {
    steps: [
      "TC39 stages: 0 (Strawperson), 1 (Proposal), 2 (Draft), 3 (Candidate), 4 (Finished).",
      "Stage 2 = the committee has accepted the problem statement and has a rough solution sketched, but the spec text and semantics can still change materially.",
      "Stage 3 = spec text is essentially final; awaiting implementation feedback. Breaking changes still possible but rare.",
      "Stage 4 = at least two spec-compliant implementations exist with test262 coverage, and the ECMA-262 editor has signed off for inclusion in the next yearly edition.",
      "Production use of pre-Stage-4 features is possible via Babel/SWC transpilation, but the transpiled output reflects the proposal at compile time — if the spec changes before Stage 4, your shipped code may not match the eventual standard.",
      "Even Stage 4 doesn't mean universal runtime availability. V8, JavaScriptCore, SpiderMonkey, and runtime targets (Node/Bun/Deno) implement on their own schedules. Always check compat tables before relying on a feature in production.",
    ],
  },
  confidenceCheck: true,
  tags: ["tc39", "ecmascript", "javascript", "phase-2"],
};

// ─── Phase 2 · WCAG 2.2 conformance ───────────────────────────────────────
// Anchored to WCAG 2.2 (Oct 2023, updated Dec 2024). The "axe-clean = WCAG
// compliant" misread is the most expensive accessibility misconception in
// the industry — it produces over-confident shipping that gets sued.

export const WCAG_AUTO_TOOLS: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-wcag-automated-tools-01",
  difficulty: "stretch",
  prompt:
    "Your CI runs axe-core against every page and the report shows 100% pass. Per WCAG 2.2, what is a defensible conclusion about the site's AA conformance?",
  correct: {
    text: "An axe-clean run is a necessary but insufficient signal. Automated tools cover roughly 30-40% of WCAG success criteria — keyboard navigation, screen reader narration, alt-text adequacy, and judgment-based criteria still require manual review.",
    explanation:
      "WCAG 2.2 AA requires conformance across all applicable Level A and Level AA success criteria. Many of them — focus order, meaningful sequence, label adequacy, error identification quality — cannot be evaluated mechanically.",
  },
  distractors: [
    {
      text: "100% axe-core pass means the site is WCAG 2.2 AA conformant — CI is sufficient",
      misconception: "wcag-auto-tools-coverage",
    },
    {
      text: "axe-core covers WCAG 2.1 only; the 2.2 success criteria require a separate tool",
      misconception: "wcag-auto-tools-coverage",
    },
    {
      text: "ADA Title II accepts a clean automated scan as compliance evidence in litigation",
      misconception: "wcag-conformance-level",
    },
  ],
  workedSolution: {
    steps: [
      "WCAG 2.2 organizes accessibility requirements as testable success criteria (SC) across four principles: Perceivable, Operable, Understandable, Robust.",
      "Each SC has Level A, AA, or AAA. AA is the level most legal regimes and industry contracts cite as the conformance floor.",
      "Studies and tool vendors broadly converge: automated tools catch ~30-40% of SC violations by validity volume. Deque, Microsoft, and the W3C all publish similar figures.",
      "Automated tools detect: missing alt text, missing form labels, contrast violations, ARIA misuse, heading order. They CANNOT evaluate: whether alt text is meaningful, whether focus order matches reading order, whether the error message helps a real user recover, whether the page is keyboard-navigable end-to-end.",
      "A WCAG AA conformance claim requires: automated scan + manual keyboard walkthrough + screen reader testing + content review for plain-language SC + cognitive review for judgment-based SC. Any single tool's 100% score is one signal among many.",
      "Legal posture: the ADA Title II rule (2024) requires public-sector US sites to meet WCAG 2.1 AA. Private-sector lawsuits often cite WCAG by precedent but no court accepts a CI report as standalone compliance evidence.",
    ],
  },
  confidenceCheck: true,
  tags: ["wcag", "accessibility", "a11y", "phase-2"],
};

export const ALL_EXAMPLES = [
  ARRAY_INDEXING,
  STRING_LENGTH_EMOJI,
  N_PLUS_ONE_LOOP,
  IEEE_754_DECIMAL,
  POSIX_SIGNAL_SAFETY,
  RFC_2119_SHOULD,
  TC39_STAGE_READINESS,
  WCAG_AUTO_TOOLS,
] as const;
