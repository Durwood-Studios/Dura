import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { buildHarnessJs, PASS_MARKER, FAIL_MARKER, MANUAL_MARKER } from "@/lib/sandbox/harness";
import { gradeExercise, type TestState } from "@/lib/sandbox/verdict";

function runChecks(checks: string[]): Map<string, TestState> {
  const results = new Map<string, TestState>();
  runInNewContext(buildHarnessJs(checks), {
    console: {
      log(message: string): void {
        for (const [prefix, state] of [
          [PASS_MARKER, "pass"],
          [FAIL_MARKER, "fail"],
          [MANUAL_MARKER, "manual"],
        ] as const) {
          if (message.startsWith(prefix)) results.set(message.slice(prefix.length), state);
        }
      },
    },
  });
  return results;
}

describe("exercise correctness", (): void => {
  it("fails a missing function even when another check passes", (): void => {
    const checks = ["true", "missingFunction() === 1"];
    const markers = runChecks(checks);
    expect(markers.get(checks[1])).toBe("fail");
    expect(gradeExercise(checks, markers, false).success).toBe(false);
  });
  it("does not celebrate prose, absent results, non-booleans, or zero checks", (): void => {
    for (const checks of [["echo returns its input"], ["42"], []]) {
      expect(gradeExercise(checks, runChecks(checks), false).success).toBe(false);
    }
    expect(gradeExercise(["true", "false"], new Map([["true", "pass"]]), false).success).toBe(
      false
    );
  });
  it("passes only a complete successful run and rejects runtime errors", (): void => {
    const checks = ['typeof 42 === "number"', '2 + "3" === "23"'];
    expect(gradeExercise(checks, runChecks(checks), false).success).toBe(true);
    expect(gradeExercise(checks, runChecks(checks), true).success).toBe(false);
  });
});
