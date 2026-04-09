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

  // ── Module 1-3: Functions ────────────────────────────────────────────────
  q(
    "1-3-q1",
    "1-3",
    "multiple-choice",
    "What is the difference between a parameter and an argument?",
    [
      "They are the same",
      "Parameter is in the definition; argument is the value at call time",
      "Argument is in the definition",
      "Parameters are for arrow functions only",
    ],
    1,
    "Parameters are placeholders; arguments are the actual values passed.",
    "easy",
    ["parameter", "argument"]
  ),
  q(
    "1-3-q2",
    "1-3",
    "true-false",
    "True or false: a function declaration is hoisted (available before its line in the code).",
    ["True", "False"],
    0,
    "Function declarations are hoisted. Expressions and arrows are not.",
    "easy",
    ["hoisting", "function"]
  ),
  q(
    "1-3-q3",
    "1-3",
    "multiple-choice",
    "What does a function return if it has no return statement?",
    ["null", "undefined", "0", "Error"],
    1,
    "An implicit return gives undefined.",
    "easy",
    ["return", "undefined"]
  ),
  q(
    "1-3-q4",
    "1-3",
    "code-output",
    "What does this print?\n```js\nconst fn = (a, b = 10) => a + b;\nconsole.log(fn(5));\n```",
    ["5", "10", "15", "NaN"],
    2,
    "b defaults to 10 when not passed. 5 + 10 = 15.",
    "easy",
    ["default-parameter"]
  ),
  q(
    "1-3-q5",
    "1-3",
    "multiple-choice",
    "What is a closure?",
    [
      "A function that self-destructs",
      "A function bundled with references to its outer scope",
      "A function with no parameters",
      "A function that runs once",
    ],
    1,
    "A closure retains access to its enclosing scope even after that scope has returned.",
    "medium",
    ["closure"]
  ),
  q(
    "1-3-q6",
    "1-3",
    "multiple-choice",
    "Which array method transforms each element and returns a new array?",
    ["filter", "reduce", "map", "forEach"],
    2,
    "map applies a callback to every element and collects the returns.",
    "medium",
    ["map", "callback"]
  ),
  q(
    "1-3-q7",
    "1-3",
    "multiple-select",
    "Which are requirements for a function to be pure? Select all.",
    [
      "Same input always gives same output",
      "No side effects",
      "Must use arrow syntax",
      "Must return a value",
    ],
    [0, 1],
    "Pure = deterministic output + no side effects.",
    "medium",
    ["pure-function"]
  ),
  q(
    "1-3-q8",
    "1-3",
    "multiple-choice",
    "What does `await` do?",
    [
      "Stops all code everywhere",
      "Pauses the current async function until the promise settles",
      "Cancels the promise",
      "Converts a promise to a callback",
    ],
    1,
    "await pauses only the enclosing async function; other code continues.",
    "medium",
    ["async", "await"]
  ),
  q(
    "1-3-q9",
    "1-3",
    "code-output",
    "What does this print?\n```js\nfunction makeAdder(a) { return b => a + b; }\nconst add10 = makeAdder(10);\nconsole.log(add10(5));\n```",
    ["5", "10", "15", "NaN"],
    2,
    "makeAdder(10) returns a closure over a=10. add10(5) computes 10+5=15.",
    "hard",
    ["closure", "factory"]
  ),
  q(
    "1-3-q10",
    "1-3",
    "multiple-choice",
    "What does memoization do?",
    [
      "Deletes old calls",
      "Caches results so repeated calls skip the computation",
      "Runs in a worker",
      "Converts to arrow function",
    ],
    1,
    "Memoization trades memory for speed by caching previously computed results.",
    "hard",
    ["memoization"]
  ),

  // ── Module 1-4: Data Structures ──────────────────────────────────────────
  q(
    "1-4-q1",
    "1-4",
    "multiple-choice",
    "What is the index of the first element in a JavaScript array?",
    ["1", "0", "-1", "It depends"],
    1,
    "Arrays are zero-indexed.",
    "easy",
    ["array", "index"]
  ),
  q(
    "1-4-q2",
    "1-4",
    "multiple-choice",
    "Which method adds an element to the end of an array?",
    ["unshift", "push", "concat", "splice"],
    1,
    "push adds to the end; unshift adds to the front.",
    "easy",
    ["array", "push"]
  ),
  q(
    "1-4-q3",
    "1-4",
    "multiple-choice",
    "Which returns an array of an object's property names?",
    ["Object.values()", "Object.keys()", "Object.entries()", "Object.from()"],
    1,
    "Object.keys() returns the keys as an array of strings.",
    "easy",
    ["object", "keys"]
  ),
  q(
    "1-4-q4",
    "1-4",
    "code-output",
    "What does this print?\n```js\nconst { a, b = 5 } = { a: 1 };\nconsole.log(b);\n```",
    ["undefined", "null", "5", "Error"],
    2,
    "b defaults to 5 because the property is missing.",
    "easy",
    ["destructuring", "default"]
  ),
  q(
    "1-4-q5",
    "1-4",
    "multiple-choice",
    "What does adding a duplicate to a Set do?",
    ["Throws an error", "Overwrites the value", "Silently ignores it", "Adds it twice"],
    2,
    "Sets only hold unique values. Duplicates are silently ignored.",
    "medium",
    ["set"]
  ),
  q(
    "1-4-q6",
    "1-4",
    "multiple-choice",
    "What happens when you JSON.parse invalid JSON?",
    ["Returns null", "Returns undefined", "Throws a SyntaxError", "Returns {}"],
    2,
    "JSON.parse throws on invalid input.",
    "medium",
    ["json", "parse"]
  ),
  q(
    "1-4-q7",
    "1-4",
    "multiple-choice",
    "Why should you avoid `for...in` on arrays?",
    [
      "It is slower",
      "It gives string keys and may include inherited properties",
      "It doesn't work in strict mode",
      "It reverses the order",
    ],
    1,
    "for...in iterates enumerable string keys, including inherited ones.",
    "medium",
    ["for-in", "array"]
  ),
  q(
    "1-4-q8",
    "1-4",
    "multiple-choice",
    "Which array method returns the first element that passes a test?",
    ["filter", "find", "some", "indexOf"],
    1,
    "find returns the first matching element or undefined.",
    "medium",
    ["find", "array"]
  ),
  q(
    "1-4-q9",
    "1-4",
    "code-output",
    "What does this print?\n```js\nconsole.log([...new Set([1,2,2,3,3])]);\n```",
    ["[1,2,2,3,3]", "[1,2,3]", "[2,3]", "Error"],
    1,
    "Set removes duplicates; spreading into an array gives [1,2,3].",
    "hard",
    ["set", "spread"]
  ),
  q(
    "1-4-q10",
    "1-4",
    "multiple-choice",
    "What does `flatMap` do?",
    ["Flattens deeply", "Maps then flattens one level", "Sorts and flattens", "Filters then maps"],
    1,
    "flatMap applies the callback then flattens the result by one level.",
    "hard",
    ["flatMap", "array"]
  ),

  // ── Module 1-5: Debugging ────────────────────────────────────────────────
  q(
    "1-5-q1",
    "1-5",
    "multiple-choice",
    "Which error type means you used a variable that doesn't exist?",
    ["TypeError", "ReferenceError", "SyntaxError", "RangeError"],
    1,
    "ReferenceError means the name was never declared.",
    "easy",
    ["error", "reference"]
  ),
  q(
    "1-5-q2",
    "1-5",
    "multiple-choice",
    "In a stack trace, which position shows where the error was thrown?",
    ["The last line", "The first line after the message", "The middle", "Random"],
    1,
    "Stack traces list the most recent call first.",
    "easy",
    ["stack-trace"]
  ),
  q(
    "1-5-q3",
    "1-5",
    "multiple-choice",
    "Which console method displays data as a formatted table?",
    ["console.log", "console.table", "console.group", "console.dir"],
    1,
    "console.table renders arrays of objects as a formatted table.",
    "easy",
    ["console"]
  ),
  q(
    "1-5-q4",
    "1-5",
    "true-false",
    "True or false: rubber duck debugging means explaining code line by line to reveal bugs.",
    ["True", "False"],
    0,
    "Explaining forces precision and reveals mismatches between intent and reality.",
    "easy",
    ["rubber-duck"]
  ),
  q(
    "1-5-q5",
    "1-5",
    "multiple-choice",
    "What does 'Step Over' do in a debugger?",
    [
      "Skips the function entirely",
      "Runs the line and pauses on the next line in the same function",
      "Enters the called function",
      "Resumes to the end",
    ],
    1,
    "Step Over runs the line (including function calls) and pauses on the next.",
    "medium",
    ["debugger", "step"]
  ),
  q(
    "1-5-q6",
    "1-5",
    "multiple-choice",
    "What is an off-by-one error?",
    [
      "Using the wrong variable",
      "A loop that runs one too many or few times",
      "A syntax error on line 1",
      "A network timeout",
    ],
    1,
    "Off-by-one means the boundary is wrong by exactly one.",
    "medium",
    ["bug-pattern"]
  ),
  q(
    "1-5-q7",
    "1-5",
    "multiple-choice",
    "What does a linter do?",
    [
      "Compiles code",
      "Flags suspicious patterns before runtime",
      "Formats whitespace",
      "Deploys the app",
    ],
    1,
    "A linter scans for potential bugs and bad practices statically.",
    "medium",
    ["linting", "eslint"]
  ),
  q(
    "1-5-q8",
    "1-5",
    "multiple-choice",
    "What is the first step in the debugging workflow?",
    ["Fix the bug", "Reproduce the bug reliably", "Refactor surrounding code", "Add a test"],
    1,
    "You cannot fix what you cannot reliably reproduce.",
    "medium",
    ["debugging-workflow"]
  ),
  q(
    "1-5-q9",
    "1-5",
    "multiple-choice",
    "Which tool auto-formats your code so style arguments never happen?",
    ["ESLint", "Prettier", "TypeScript", "webpack"],
    1,
    "Prettier handles formatting. ESLint handles logic.",
    "hard",
    ["prettier", "formatting"]
  ),
  q(
    "1-5-q10",
    "1-5",
    "code-output",
    "What does this print?\n```js\nconst a = { x: 1 };\nconst b = a;\nb.x = 99;\nconsole.log(a.x);\n```",
    ["1", "99", "undefined", "Error"],
    1,
    "b is a reference to the same object. Changing b.x also changes a.x.",
    "hard",
    ["reference", "mutation"]
  ),

  // ── Module 1-6: First Projects ───────────────────────────────────────────
  q(
    "1-6-q1",
    "1-6",
    "multiple-choice",
    "What should you build first in a project?",
    ["The user interface", "The core logic", "The CSS styling", "The deployment pipeline"],
    1,
    "Core logic first, then interface.",
    "easy",
    ["planning", "project"]
  ),
  q(
    "1-6-q2",
    "1-6",
    "multiple-choice",
    "What does CRUD stand for?",
    [
      "Copy, Read, Undo, Delete",
      "Create, Read, Update, Delete",
      "Create, Run, Update, Deploy",
      "Compile, Read, Update, Debug",
    ],
    1,
    "Create, Read, Update, Delete — the four basic data operations.",
    "easy",
    ["crud"]
  ),
  q(
    "1-6-q3",
    "1-6",
    "true-false",
    "True or false: separating data from logic makes both easier to test and reuse.",
    ["True", "False"],
    0,
    "Data and logic should be separate so each can be changed independently.",
    "easy",
    ["design", "separation"]
  ),
  q(
    "1-6-q4",
    "1-6",
    "multiple-choice",
    "What is continuous deployment?",
    [
      "Deploying once a year",
      "Automatically deploying on every push",
      "Manually uploading files",
      "Running tests locally",
    ],
    1,
    "Continuous deployment auto-builds and deploys on every push to main.",
    "easy",
    ["deployment", "ci"]
  ),
  q(
    "1-6-q5",
    "1-6",
    "multiple-choice",
    "What does the 'Arrange, Act, Assert' pattern describe?",
    [
      "Three deployment stages",
      "The structure of a test",
      "Three variable types",
      "The Git workflow",
    ],
    1,
    "Arrange inputs, Act by calling the function, Assert the outputs.",
    "medium",
    ["testing", "pattern"]
  ),
  q(
    "1-6-q6",
    "1-6",
    "multiple-choice",
    "What should code review feedback include?",
    ["Just 'looks good'", "Specific observations with reasoning", "A full rewrite", "Only praise"],
    1,
    "Specific, reasoned feedback helps the author learn.",
    "medium",
    ["code-review"]
  ),
  q(
    "1-6-q7",
    "1-6",
    "multiple-choice",
    "Where should API keys and secrets be stored?",
    ["In the source code", "In environment variables", "In the README", "In the HTML"],
    1,
    "Secrets go in environment variables, never in committed code.",
    "medium",
    ["security", "env"]
  ),
  q(
    "1-6-q8",
    "1-6",
    "multiple-choice",
    "Why validate user input before using it?",
    [
      "It makes code slower",
      "Invalid input causes bugs, crashes, or security holes",
      "JavaScript requires it",
      "It improves SEO",
    ],
    1,
    "Unvalidated input is the root cause of most application bugs and security vulnerabilities.",
    "medium",
    ["validation", "input"]
  ),
  q(
    "1-6-q9",
    "1-6",
    "multiple-choice",
    "What is the developer workflow loop?",
    [
      "Code → Ship → Hope",
      "Write → Test → Commit → Push → Deploy",
      "Plan → Code → Plan → Code",
      "Read → Watch → Repeat",
    ],
    1,
    "The professional development loop: write, test, commit, push, deploy.",
    "hard",
    ["workflow"]
  ),
  q(
    "1-6-q10",
    "1-6",
    "multiple-choice",
    "Which array method pattern creates a composable data pipeline?",
    ["for loop", "while loop", "Chaining .filter().map().sort()", "switch statement"],
    2,
    "Chained array methods read like a pipeline and each step is independently testable.",
    "hard",
    ["composition", "array-methods"]
  ),
];
