"use client";

import { ActivitySaveStatus } from "@/components/lesson/ActivitySaveStatus";
import { useActivityEvidence, type ActivityProps } from "@/hooks/useActivityEvidence";

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
import {
  buildHarnessJs,
  INDEX_HTML,
  PASS_MARKER,
  FAIL_MARKER,
  MANUAL_MARKER,
} from "@/lib/sandbox/harness";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { usePlayOnMount } from "@/components/celebration/usePlayOnMount";

type SandboxLanguage = "javascript" | "typescript" | "react" | "html";

interface SandboxExerciseInnerProps extends ActivityProps {
  language: SandboxLanguage;
  instructions: string;
  initialCode: string;
  solution: string;
  testCases: string[];
}

/** Maps lesson language prop to the Sandpack template id. */
const LANGUAGE_TEMPLATE_MAP = {
  javascript: "vanilla",
  typescript: "vanilla-ts",
  react: "react",
  html: "static",
} as const satisfies Record<SandboxLanguage, string>;

/**
 * Maps lesson language to the primary editable file inside Sandpack.
 * Must match the template's expected entry-point name.
 */
const LANGUAGE_FILE_MAP = {
  javascript: "/index.js",
  typescript: "/index.ts",
  react: "/index.js",
  html: "/index.html",
} as const satisfies Record<SandboxLanguage, string>;

import { gradeExercise, type TestState, type Verdict } from "@/lib/sandbox/verdict";

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
    size: "14px",
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
  activityId,
  activityLessonId,
  initialCode,
  solution,
  testCases,
  language,
  mainFile,
}: ActivityProps & {
  initialCode: string;
  solution: string;
  testCases: string[];
  language: SandboxLanguage;
  mainFile: string;
}): React.ReactElement {
  const activity = useActivityEvidence({ activityId, activityLessonId });
  const { saveEvidence } = activity;
  const { sandpack } = useSandpack();
  const { logs, reset: resetLogs } = useSandpackConsole({
    resetOnPreviewRestart: true,
    maxMessageCount: 200,
    showSyntaxError: true,
  });
  const [hasAttempted, setHasAttempted] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
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
      } else if (text.startsWith(MANUAL_MARKER)) {
        map.set(text.slice(MANUAL_MARKER.length), "manual");
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
      setTestStates(new Map(markers));
      const result = gradeExercise(testCases, markers, hasErrors);
      setVerdict(result.verdict);
      if (result.verdict === "pass" && markers.size > 0 && !hasRevealed) {
        void saveEvidence({
          kind: "automatic",
          updatedAt: Date.now(),
          completedAt: Date.now(),
          score: 1,
        }).catch((error: unknown): void => console.error("[sandbox] Evidence save failed", error));
      }
      setVerdictMessage(result.message);
      void track("sandbox_executed", { language, success: result.success });
    }, 800);

    return () => clearTimeout(timer);
  }, [logs, markers, testCases, language, saveEvidence, hasRevealed]);

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
    setHasRevealed(false);
    pendingCheck.current = false;
    sandpack.updateFile(mainFile, initialCode);
    setVerdict("idle");
    setVerdictMessage("");
    setTestStates(new Map());
    resetLogs();
  };

  const showSolution = () => {
    setHasRevealed(true);
    pendingCheck.current = false;
    sandpack.updateFile(mainFile, solution);
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

  // The Sandpack console echoes each statement's return value, so plain
  // console.log lines are followed by "undefined" — learners read that
  // as breakage. Coach it away once a run shows repeated echoes.
  const undefinedEchoes = logs.filter((l) => extractLogText(l.data) === "undefined").length;

  // Animate the verdict icon only on a genuine pass with at least one
  // evaluated test (so the celebration earns its mount). Replays on the
  // verdict transition so a learner re-running gets a fresh confirmation.
  const verdictIconRef = usePlayOnMount(verdict);
  const showAnimatedPass = verdict === "pass" && testStates.size > 0;

  return (
    <>
      <ActivitySaveStatus state={activity} />
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2">
        <button
          type="button"
          onClick={run}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <Play className="h-3 w-3" />
          Run
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
        {hasAttempted && (
          <button
            type="button"
            onClick={showSolution}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          >
            <Eye className="h-3 w-3" />
            Show solution
          </button>
        )}
        {verdict !== "idle" && (
          <span
            role="status"
            aria-live="polite"
            className={cn(
              "inline-flex w-full items-center gap-1 text-xs font-medium sm:ml-auto sm:w-auto",
              verdictColor
            )}
          >
            {showAnimatedPass ? (
              <CircleCheckIcon ref={verdictIconRef} size={14} className="text-emerald-600" />
            ) : verdict === "pass" ? (
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
      {verdict !== "idle" && undefinedEchoes >= 2 && (
        <p className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-xs text-[var(--color-text-muted)]">
          Seeing <code className="font-mono">undefined</code> in the console? That&apos;s the
          console echoing each statement&apos;s return value —{" "}
          <code className="font-mono">console.log</code> returns undefined. It&apos;s not an error.
        </p>
      )}
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
  activityId,
  activityLessonId,
  language,
  instructions,
  initialCode,
  solution,
  testCases,
}: SandboxExerciseInnerProps): React.ReactElement {
  // Build harness + custom HTML once per testCases set. They're static
  // per-lesson, so this needn't react to user edits in the main file.
  const harnessJs = useMemo(() => buildHarnessJs(testCases), [testCases]);

  const template = LANGUAGE_TEMPLATE_MAP[language];
  const mainFile = LANGUAGE_FILE_MAP[language];

  return (
    <SandpackProvider
      template={template}
      theme={SANDPACK_THEME}
      files={{
        "/index.html": { code: INDEX_HTML, hidden: true },
        [mainFile]: initialCode,
        "/harness.js": { code: harnessJs, hidden: true },
      }}
      options={{
        recompileMode: "delayed",
        recompileDelay: 500,
        activeFile: mainFile,
        visibleFiles: [mainFile],
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
          activityId={activityId}
          activityLessonId={activityLessonId}
          initialCode={initialCode}
          solution={solution}
          testCases={testCases}
          language={language}
          mainFile={mainFile}
        />
        <SandpackLayout className="!flex-col sm:!flex-row">
          <SandpackCodeEditor showLineNumbers showTabs={false} wrapContent />
        </SandpackLayout>
        <SandpackConsole standalone />
      </figure>
    </SandpackProvider>
  );
}
