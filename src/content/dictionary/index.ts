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
    slug: "bit",
    term: "Bit",
    aliases: ["binary digit"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "The smallest piece of data a computer stores — a single 0 or 1, like a switch that's off or on.",
      intermediate:
        "A binary digit. The fundamental unit of information, taking one of two values (0 or 1). Eight bits make a byte; groups of bits encode numbers, characters, and machine instructions.",
      advanced:
        "An information-theoretic unit equal to one shannon — the entropy of a uniformly distributed binary random variable. In hardware, realized as a two-state circuit (voltage high/low, magnetic polarity, charge present/absent).",
    },
    seeAlso: ["byte", "binary"],
  },
  {
    slug: "byte",
    term: "Byte",
    aliases: ["octet"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "Eight bits grouped together. One byte can hold any number from 0 to 255 — enough for a single letter or symbol.",
      intermediate:
        "A group of 8 bits, capable of representing 256 distinct values. Bytes are the smallest addressable unit in most CPU architectures and the basis for character encodings like ASCII and UTF-8.",
      advanced:
        "Historically variable-width on early architectures; standardized to 8 bits (an octet) by IEEE 1541. Memory addresses index bytes; word size, alignment, and endianness determine how multi-byte values are laid out and accessed.",
    },
    seeAlso: ["bit", "binary"],
  },
  {
    slug: "binary",
    term: "Binary",
    aliases: ["base 2"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "Counting using only two digits — 0 and 1. It's how computers represent everything internally.",
      intermediate:
        "A positional number system with base 2. Each column is a power of two, so 1010 = 8 + 2 = 10. All digital data, from numbers to images, ultimately reduces to binary.",
      advanced:
        "Base-2 positional notation. Closed under arithmetic with carry propagation. Direct correspondence to two-state digital logic makes it the natural representation for hardware. Two's complement extends it to signed integers without a separate sign bit.",
    },
    seeAlso: ["bit", "byte"],
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
