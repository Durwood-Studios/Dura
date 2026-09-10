export type TestState = "pending" | "pass" | "fail" | "manual";
export type Verdict = "idle" | "pass" | "fail" | "partial";

interface GradingResult {
  verdict: Exclude<Verdict, "idle">;
  message: string;
  success: boolean;
}

/** A successful run requires every authored check to explicitly pass. */
export function gradeExercise(
  testCases: string[],
  markers: ReadonlyMap<string, TestState>,
  hasErrors: boolean
): GradingResult {
  const passed = testCases.filter((test: string): boolean => markers.get(test) === "pass").length;
  const failed = testCases.some((test: string): boolean => markers.get(test) === "fail");
  if (hasErrors || failed) {
    return {
      verdict: "fail",
      message: hasErrors
        ? "Check the errors above"
        : `${passed} of ${testCases.length} checks passed`,
      success: false,
    };
  }
  if (testCases.length > 0 && passed === testCases.length) {
    return {
      verdict: "pass",
      message: `${passed} of ${testCases.length} checks passed`,
      success: true,
    };
  }
  return {
    verdict: "partial",
    message:
      testCases.length === 0
        ? "No automated checks — compare your result with the instructions"
        : `${passed} of ${testCases.length} checks passed — remaining checks need verification`,
    success: false,
  };
}
