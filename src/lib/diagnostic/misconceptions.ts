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
];

export const MISCONCEPTIONS: MisconceptionCatalog = Object.freeze(
  ENTRIES.reduce<Record<string, Misconception>>((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {})
);
