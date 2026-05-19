/**
 * SandboxExercise auto-grader harness.
 *
 * Test cases authored as JS expressions (e.g. "kbToBytes(1) === 1024")
 * are evaluated against the user's code at run time. Cases that aren't
 * evaluable as expressions (e.g. "echo returns its input") fall through
 * as descriptive checklist items.
 *
 * Architecture: a custom /index.html in the Sandpack files loads the
 * user's /index.js AND a hidden /harness.js as sibling script tags, so
 * both run in the same global scope. The harness then `eval`s each
 * test case — top-level function declarations in /index.js are attached
 * to window, so the eval can reference them.
 *
 * Results are emitted to the console using sentinel markers, which the
 * SandboxExercise verdict logic parses out.
 */

export const PASS_MARKER = "__DURA_PASS__:";
export const FAIL_MARKER = "__DURA_FAIL__:";

/**
 * Build the harness JavaScript for a given test-case set. Test cases are
 * embedded via JSON.stringify so any quotes, backslashes, or newlines in
 * them are escaped correctly.
 */
export function buildHarnessJs(testCases: string[]): string {
  const serialized = JSON.stringify(testCases);
  return `// DURA auto-grader harness — runs after your code. Do not edit.
(function () {
  var TESTS = ${serialized};
  TESTS.forEach(function (tc) {
    try {
      // Indirect eval — evaluates in global scope so top-level function
      // declarations from /index.js are visible.
      var result = (0, eval)(tc);
      if (typeof result === "boolean") {
        if (result) {
          console.log("${PASS_MARKER}" + tc);
        } else {
          console.log("${FAIL_MARKER}" + tc);
        }
      }
    } catch (e) {
      // Not evaluable as a boolean expression — leave as descriptive checklist item.
    }
  });
})();
`;
}

/**
 * Custom HTML that loads /index.js and /harness.js as sibling script
 * tags so they share global scope. Used as the Sandpack entry.
 */
export const INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="app"></div>
    <script src="./index.js"></script>
    <script src="./harness.js"></script>
  </body>
</html>
`;
