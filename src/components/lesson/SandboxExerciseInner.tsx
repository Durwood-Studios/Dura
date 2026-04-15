"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  useSandpack,
  useSandpackConsole,
} from "@codesandbox/sandpack-react";
import { Play, RotateCcw, Eye, Check, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface SandboxExerciseInnerProps {
  language: "javascript" | "typescript";
  instructions: string;
  initialCode: string;
  solution: string;
  testCases: string[];
}

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
  const [verdict, setVerdict] = useState<"idle" | "pass" | "fail">("idle");
  const [verdictMessage, setVerdictMessage] = useState("");
  const pendingCheck = useRef(false);

  // Check verdict when logs update after a run
  useEffect(() => {
    if (!pendingCheck.current || logs.length === 0) return;

    // Wait a tick for all console output to flush
    const timer = setTimeout(() => {
      if (!pendingCheck.current) return;
      pendingCheck.current = false;

      // Collect all console.log output lines
      const output = logs
        .filter((l) => l.method === "log" || l.method === "info")
        .map((l) => extractLogText(l.data))
        .filter(Boolean);

      const hasErrors = logs.some((l) => l.method === "error");

      if (testCases.length === 0) {
        // No expected output — pass if no errors, show neutral message
        if (hasErrors) {
          setVerdict("fail");
          setVerdictMessage("Check the errors above");
        } else {
          setVerdict("pass");
          setVerdictMessage("Code ran successfully");
        }
      } else {
        // Compare output against expected test cases
        const allPassed = testCases.every((expected) => {
          const trimmed = expected.trim();
          return output.some((line) => line.trim() === trimmed || line.includes(trimmed));
        });

        if (allPassed) {
          setVerdict("pass");
          setVerdictMessage("Correct!");
        } else {
          setVerdict("fail");
          const got = output.length > 0 ? output.join(", ") : "(no output)";
          setVerdictMessage(`Expected "${testCases[0]}" — got ${got}`);
        }
      }

      void track("sandbox_executed", {
        language,
        success: verdict === "pass",
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [logs, testCases, language, verdict]);

  const run = useCallback(() => {
    setHasAttempted(true);
    setVerdict("idle");
    setVerdictMessage("");
    resetLogs();
    pendingCheck.current = true;
    sandpack.runSandpack();
  }, [sandpack, resetLogs]);

  const reset = () => {
    sandpack.updateFile("/index.js", initialCode);
    setVerdict("idle");
    setVerdictMessage("");
    resetLogs();
  };

  const showSolution = () => {
    sandpack.updateFile("/index.js", solution);
    setVerdict("idle");
    setVerdictMessage("");
    resetLogs();
  };

  return (
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
            verdict === "pass" ? "text-emerald-600" : "text-rose-600"
          )}
        >
          {verdict === "pass" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {verdictMessage}
        </span>
      )}
    </div>
  );
}

export default function SandboxExerciseInner({
  language,
  instructions,
  initialCode,
  solution,
  testCases,
}: SandboxExerciseInnerProps): React.ReactElement {
  return (
    <SandpackProvider
      template="vanilla"
      theme={SANDPACK_THEME}
      files={{ "/index.js": initialCode }}
      options={{ recompileMode: "delayed", recompileDelay: 500 }}
    >
      <figure className="my-8 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
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
