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

export const ALL_EXAMPLES = [ARRAY_INDEXING, STRING_LENGTH_EMOJI, N_PLUS_ONE_LOOP] as const;
