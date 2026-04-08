import type { DictionaryTerm } from "@/types/dictionary";

/**
 * Seed dictionary. Real content lives here as the curriculum is written.
 * Each term gets its own indexed URL: /dictionary/{slug}.
 */
export const DICTIONARY: DictionaryTerm[] = [
  {
    slug: "algorithm",
    term: "Algorithm",
    aliases: ["procedure", "recipe"],
    category: "fundamentals",
    phaseIds: ["1", "3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of step-by-step instructions for solving a problem — like a recipe a computer can follow.",
      intermediate:
        "A finite, deterministic sequence of well-defined operations that takes an input and produces an output. Algorithms are evaluated by correctness, time complexity, and space complexity.",
      advanced:
        "A computable function expressed as a finite procedure over a defined model of computation. Properties of interest include termination, asymptotic behavior in time/space, and amenability to parallelization or distribution.",
    },
    examples: [
      {
        language: "javascript",
        code: "function sum(nums) {\n  let total = 0;\n  for (const n of nums) total += n;\n  return total;\n}",
      },
    ],
    seeAlso: ["data-structure", "complexity", "big-o"],
    standards: { cs2023: ["AL/Foundational"] },
  },
  {
    slug: "variable",
    term: "Variable",
    aliases: ["binding"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A named container that holds a value you can reference and change later.",
      intermediate:
        "A binding between an identifier and a memory location (or value, in immutable languages). Scope determines where it's visible; lifetime determines when it's reclaimed.",
      advanced:
        "An identifier bound to a storage location with a defined type, scope, lifetime, and mutability. In compiled languages, binding may be resolved at compile time (lexical) or runtime (dynamic).",
    },
    seeAlso: ["scope", "type", "constant"],
  },
  {
    slug: "function",
    term: "Function",
    aliases: ["procedure", "subroutine", "method"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A reusable block of code that takes input, does something, and gives back a result.",
      intermediate:
        "A named, parameterized unit of computation. Pure functions return outputs based only on inputs and have no side effects; impure functions may read or modify external state.",
      advanced:
        "A first-class abstraction in most languages, often supporting closures, higher-order use, and currying. In type systems, functions are values whose type encodes parameter and return types and effects.",
    },
    seeAlso: ["closure", "scope", "pure-function"],
  },
  {
    slug: "big-o",
    term: "Big O Notation",
    aliases: ["asymptotic notation"],
    category: "complexity",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "A way to describe how slow or fast an algorithm gets as the amount of data grows.",
      intermediate:
        "An upper bound on the growth rate of a function. O(n) means the work scales linearly with input size; O(1) means it stays constant; O(log n) grows much slower than n.",
      advanced:
        "Formally: f(n) = O(g(n)) iff there exist positive constants c, n₀ such that |f(n)| ≤ c|g(n)| for all n ≥ n₀. Used to characterize worst-case time and space complexity in the asymptotic limit.",
    },
    seeAlso: ["complexity", "algorithm"],
  },
];

export const DICTIONARY_BY_SLUG: Map<string, DictionaryTerm> = new Map(
  DICTIONARY.map((t) => [t.slug, t])
);
