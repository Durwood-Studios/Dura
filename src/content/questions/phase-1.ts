import type { AssessmentQuestion } from "@/types/assessment";

function q(
  id: string,
  moduleId: string,
  type: AssessmentQuestion["type"],
  question: string,
  options: string[],
  correct: number | number[],
  explanation: string,
  difficulty: AssessmentQuestion["difficulty"],
  tags: string[]
): AssessmentQuestion {
  return {
    id,
    phaseId: "1",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "understand" },
  };
}

export const PHASE_1_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 1-1: Variables and Types ──────────────────────────────────────
  q(
    "1-1-q1",
    "1-1",
    "multiple-choice",
    "Which keyword should you reach for first when declaring a variable?",
    ["var", "let", "const", "function"],
    2,
    "const is the default. Only use let when you need to reassign.",
    "easy",
    ["variable", "const"]
  ),
  q(
    "1-1-q2",
    "1-1",
    "code-output",
    "What does this print?\n```js\nconsole.log(typeof 'hello');\n```",
    ["'text'", "'string'", "'hello'", "'characters'"],
    1,
    "typeof returns the type name as a string. Text values are of type 'string'.",
    "easy",
    ["typeof", "string"]
  ),
  q(
    "1-1-q3",
    "1-1",
    "true-false",
    "True or false: `0.1 + 0.2 === 0.3` evaluates to true in JavaScript.",
    ["True", "False"],
    1,
    "Floating-point rounding means the result is 0.30000000000000004, not exactly 0.3.",
    "easy",
    ["number", "floating-point"]
  ),
  q(
    "1-1-q4",
    "1-1",
    "multiple-choice",
    "What is the result of `typeof null`?",
    ["'null'", "'undefined'", "'object'", "'boolean'"],
    2,
    "This is a famous JavaScript bug from 1995. typeof null === 'object'.",
    "easy",
    ["null", "typeof"]
  ),
  q(
    "1-1-q5",
    "1-1",
    "multiple-choice",
    "What does the `%` operator return?",
    ["The quotient", "The remainder", "The percentage", "The absolute value"],
    1,
    "% is the remainder (modulo) operator.",
    "medium",
    ["number", "operator"]
  ),
  q(
    "1-1-q6",
    "1-1",
    "code-output",
    "What does this print?\n```js\nconsole.log(2 + '3');\n```",
    ["5", "'5'", "'23'", "Error"],
    2,
    "JavaScript coerces 2 to '2' and concatenates, giving '23'.",
    "medium",
    ["type-coercion", "string"]
  ),
  q(
    "1-1-q7",
    "1-1",
    "multiple-select",
    "Which values are falsy in JavaScript? Select all.",
    ["0", "'0'", "null", "[]"],
    [0, 2],
    "0 and null are falsy. '0' (non-empty string) and [] (empty array) are truthy.",
    "medium",
    ["boolean", "falsy"]
  ),
  q(
    "1-1-q8",
    "1-1",
    "multiple-choice",
    "What does the `??` operator do?",
    [
      "Returns the first truthy value",
      "Returns the left side unless it is null or undefined, then the right side",
      "Checks strict equality",
      "Converts to boolean",
    ],
    1,
    "Nullish coalescing only falls through on null or undefined, unlike || which falls through on any falsy.",
    "medium",
    ["null", "undefined", "operator"]
  ),
  q(
    "1-1-q9",
    "1-1",
    "code-output",
    "What does this print?\n```js\nlet x;\nconsole.log(x);\n```",
    ["null", "undefined", "0", "Error"],
    1,
    "A declared but unassigned variable holds undefined.",
    "hard",
    ["undefined", "variable"]
  ),
  q(
    "1-1-q10",
    "1-1",
    "multiple-choice",
    "Why should you avoid `var` in modern JavaScript?",
    [
      "It is slower than let and const",
      "It is function-scoped and hoisted with undefined, causing subtle bugs",
      "It cannot hold string values",
      "It is not supported by modern browsers",
    ],
    1,
    "var's function scoping and hoisting behavior are footguns; let and const are block-scoped.",
    "hard",
    ["var", "scope"]
  ),
];
