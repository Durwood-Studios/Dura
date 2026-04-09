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

  // ── Module 1-2: Control Flow ─────────────────────────────────────────────
  q(
    "1-2-q1",
    "1-2",
    "multiple-choice",
    "How many blocks can execute in an if/else if/else chain?",
    ["All of them", "Exactly one", "At least one", "Zero or more"],
    1,
    "Exactly one block runs — the first whose condition is true, or the else.",
    "easy",
    ["if", "else"]
  ),
  q(
    "1-2-q2",
    "1-2",
    "code-output",
    "What does this print?\n```js\nconst x = 0;\nif (x) { console.log('yes'); } else { console.log('no'); }\n```",
    ["'yes'", "'no'", "undefined", "Error"],
    1,
    "0 is falsy, so the else branch runs.",
    "easy",
    ["falsy", "if"]
  ),
  q(
    "1-2-q3",
    "1-2",
    "multiple-choice",
    "What does `continue` do inside a loop?",
    [
      "Exits the loop entirely",
      "Skips to the next iteration",
      "Restarts the loop",
      "Pauses the loop",
    ],
    1,
    "continue skips the rest of the current iteration and moves to the next.",
    "easy",
    ["loop", "continue"]
  ),
  q(
    "1-2-q4",
    "1-2",
    "true-false",
    "True or false: `do...while` always runs its body at least once.",
    ["True", "False"],
    0,
    "do...while checks the condition after the body, guaranteeing at least one execution.",
    "easy",
    ["while", "do-while"]
  ),
  q(
    "1-2-q5",
    "1-2",
    "multiple-choice",
    "What happens if you forget `break` in a switch case?",
    [
      "An error is thrown",
      "Execution falls through to the next case",
      "Only the matching case runs",
      "The switch exits",
    ],
    1,
    "Without break, execution continues into the next case — intentional or not.",
    "medium",
    ["switch", "break"]
  ),
  q(
    "1-2-q6",
    "1-2",
    "multiple-choice",
    "What is a guard clause?",
    [
      "A deeply nested if",
      "An early return handling an edge case",
      "A switch at the top of a function",
      "A try/catch block",
    ],
    1,
    "Guard clauses return early on edge cases so the main logic stays flat.",
    "medium",
    ["guard-clause", "early-return"]
  ),
  q(
    "1-2-q7",
    "1-2",
    "code-output",
    "What does this print?\n```js\nconsole.log(0 || 'fallback');\n```",
    ["0", "'fallback'", "false", "null"],
    1,
    "0 is falsy, so || returns the next operand.",
    "medium",
    ["logical-or", "falsy"]
  ),
  q(
    "1-2-q8",
    "1-2",
    "multiple-choice",
    "When does the `finally` block run?",
    ["Only on error", "Only on success", "Always, error or not", "Only when catch re-throws"],
    2,
    "finally always runs. Use it for cleanup.",
    "medium",
    ["try-catch", "finally"]
  ),
  q(
    "1-2-q9",
    "1-2",
    "code-output",
    "What does this print?\n```js\nfor (let i = 0; i < 3; i++) {\n  if (i === 1) continue;\n  console.log(i);\n}\n```",
    ["0, 1, 2", "0, 2", "1", "0, 1"],
    1,
    "continue skips the iteration when i is 1, so only 0 and 2 are logged.",
    "hard",
    ["for", "continue"]
  ),
  q(
    "1-2-q10",
    "1-2",
    "multiple-choice",
    "Why is chaining ternary operators (a ? b : c ? d : e) discouraged?",
    [
      "It's slower",
      "It's harder to read than if/else",
      "It doesn't work in strict mode",
      "It only supports two branches",
    ],
    1,
    "Chained ternaries are syntactically valid but much harder to read than equivalent if/else.",
    "hard",
    ["ternary", "readability"]
  ),
];
