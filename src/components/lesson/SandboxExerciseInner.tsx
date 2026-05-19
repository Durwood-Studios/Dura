"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  useSandpack,
  useSandpackConsole,
} from "@codesandbox/sandpack-react";
import { Play, RotateCcw, Eye, Check, X, Circle } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { buildHarnessJs, INDEX_HTML, PASS_MARKER, FAIL_MARKER } from "@/lib/sandbox/harness";

interface SandboxExerciseInnerProps {
  language: "javascript" | "typescript";
  instructions: string;
  initialCode: string;
  solution: string;
  testCases: string[];
}

type TestState = "pending" | "pass" | "fail";
type Verdict = "idle" | "pass" | "fail" | "partial";

const SANDPACK_THEME = {
  colors: {
    surface1: "#ffffff",
    surface2: "#f5f5f4",
    surface3: "#f0f0f0",
    clickable: "#525252",
    base: "#171717",
    disabled: "#a3a3a3",
    hover: "#10b981",
    accent: "#10b981",
  },
  syntax: {
    plain: "#171717",
    comment: { color: "#a3a3a3", fontStyle: "italic" },
    keyword: "#10b981",
    tag: "#06b6d4",
    punctuation: "#525252",
    definition: "#171717",
    property: "#525252",
    static: "#8b5cf6",
    string: "#f59e0b",
  },
  font: {
    body: "var(--font-sans)",
    mono: "var(--font-mono)",
    size: "13px",
    lineHeight: "1.6",
  },
} as const;

/** Extract printable text from a console log data entry. */
function extractLogText(data: Array<string | Record<string, string>> | undefined): string {
  if (!data) return "";
  return data
    .map((d) => (typeof d === "string" ? d : JSON.stringify(d)))
    .join(" ")
    .trim();
}

function SandboxControls({
  initialCode,
  solution,
  testCases,
  language,
}: {
  initialCode: string;
  solution: string;
  testCases: string[];
  language: SandboxExerciseInnerProps["language"];
}): React.ReactElement {
  const { sandpack } = useSandpack();
  const { logs, reset: resetLogs } = useSandpackConsole({
    resetOnPreviewRestart: true,
    maxMessageCount: 200,
    showSyntaxError: true,
  });
  const [hasAttempted, setHasAttempted] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>("idle");
  const [verdictMessage, setVerdictMessage] = useState("");
  const [testStates, setTestStates] = useState<Map<string, TestState>>(new Map());
  const pendingCheck = useRef(false);

  // Parse the auto-grader sentinel markers out of console output.
  const markers = useMemo(() => {
    const map = new Map<string, TestState>();
    for (const log of logs) {
      if (log.method !== "log") continue;
      const text = extractLogText(log.data);
      if (text.startsWith(PASS_MARKER)) {
        map.set(text.slice(PASS_MARKER.length), "pass");
      } else if (text.startsWith(FAIL_MARKER)) {
        map.set(text.slice(FAIL_MARKER.length), "fail");
      }
    }
    return map;
  }, [logs]);

  // After a run, compute the aggregate verdict from markers + error state.
  useEffect(() => {
    if (!pendingCheck.current || logs.length === 0) return;

    const timer = setTimeout(() => {
      if (!pendingCheck.current) return;
      pendingCheck.current = false;

      const hasErrors = logs.some((l) => l.method === "error");
      const hasOutput = logs.some(
        (l) => (l.method === "log" || l.method === "info") && extractLogText(l.data).length > 0
      );

      // Lock the per-testcase state from this run.
      setTestStates(new Map(markers));

      const evaluable = Array.from(markers.values());
      const failed = evaluable.filter((s) => s === "fail").length;
      const passed = evaluable.filter((s) => s === "pass").length;

      if (hasErrors) {
        setVerdict("fail");
        setVerdictMessage("Check the errors above");
      } else if (evaluable.length > 0) {
        if (failed === 0) {
          setVerdict("pass");
          setVerdictMessage(
            `${passed} of ${evaluable.length} check${passed === 1 ? "" : "s"} passed`
          );
        } else if (passed > 0) {
          setVerdict("partial");
          setVerdictMessage(`${passed} of ${evaluable.length} checks passed`);
        } else {
          setVerdict("fail");
          setVerdictMessage(`0 of ${evaluable.length} checks passed`);
        }
      } else if (!hasOutput) {
        setVerdict("fail");
        setVerdictMessage("No output — did your code run?");
      } else {
        setVerdict("pass");
        setVerdictMessage(testCases.length > 0 ? "Ran — verify the checks below" : "Ran cleanly");
      }

      void track("sandbox_executed", {
        language,
        success: !hasErrors && (evaluable.length === 0 ? hasOutput : failed === 0),
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [logs, markers, testCases, language]);

  const run = useCallback(() => {
    setHasAttempted(true);
    setVerdict("idle");
    setVerdictMessage("");
    setTestStates(new Map());
    resetLogs();
    pendingCheck.current = true;
    sandpack.runSandpack();
  }, [sandpack, resetLogs]);

  const reset = () => {
    sandpack.updateFile("/index.js", initialCode);
    setVerdict("idle");
    setVerdictMessage("");
    setTestStates(new Map());
    resetLogs();
  };

  const showSolution = () => {
    sandpack.updateFile("/index.js", solution);
    setVerdict("idle");
    setVerdictMessage("");
    setTestStates(new Map());
    resetLogs();
  };

  const verdictColor =
    verdict === "pass"
      ? "text-emerald-600"
      : verdict === "partial"
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2">
        <button
          type="button"
          onClick={run}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          <Play className="h-3 w-3" />
          Run
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
        {hasAttempted && (
          <button
            type="button"
            onClick={showSolution}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          >
            <Eye className="h-3 w-3" />
            Show solution
          </button>
        )}
        {verdict !== "idle" && (
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-1 text-xs font-medium",
              verdictColor
            )}
          >
            {verdict === "pass" ? (
              <Check className="h-3 w-3" />
            ) : verdict === "partial" ? (
              <Circle className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {verdictMessage}
          </span>
        )}
      </div>
      {testCases.length > 0 && (
        <ul className="flex flex-col gap-1 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-xs">
          {testCases.map((tc) => {
            const state = testStates.get(tc) ?? "pending";
            return (
              <li key={tc} className="flex items-start gap-2">
                {state === "pass" ? (
                  <Check className="mt-[2px] h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                ) : state === "fail" ? (
                  <X className="mt-[2px] h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden />
                ) : (
                  <Circle
                    className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "font-mono",
                    state === "pass" && "text-emerald-700",
                    state === "fail" && "text-rose-700",
                    state === "pending" && "text-[var(--color-text-secondary)]"
                  )}
                >
                  {tc}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function SandboxExerciseInner({
  language,
  instructions,
  initialCode,
  solution,
  testCases,
}: SandboxExerciseInnerProps): React.ReactElement {
  // Build harness + custom HTML once per testCases set. They're static
  // per-lesson, so this needn't react to user edits in /index.js.
  const harnessJs = useMemo(() => buildHarnessJs(testCases), [testCases]);

  return (
    <SandpackProvider
      template="vanilla"
      theme={SANDPACK_THEME}
      files={{
        "/index.html": { code: INDEX_HTML, hidden: true },
        "/index.js": initialCode,
        "/harness.js": { code: harnessJs, hidden: true },
      }}
      options={{
        recompileMode: "delayed",
        recompileDelay: 500,
        activeFile: "/index.js",
        visibleFiles: ["/index.js"],
      }}
    >
      <figure
        data-lenis-prevent
        className="my-8 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
      >
        <figcaption className="border-b border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          {instructions}
        </figcaption>
        <SandboxControls
          initialCode={initialCode}
          solution={solution}
          testCases={testCases}
          language={language}
        />
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers showTabs={false} wrapContent />
        </SandpackLayout>
        <SandpackConsole standalone />
      </figure>
    </SandpackProvider>
  );
}
