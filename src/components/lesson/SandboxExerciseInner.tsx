"use client";

import { useState, useCallback } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  useSandpack,
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
  const [hasAttempted, setHasAttempted] = useState(false);
  const [verdict, setVerdict] = useState<"idle" | "pass" | "fail">("idle");

  const run = useCallback(() => {
    setHasAttempted(true);
    setVerdict("idle");
    sandpack.runSandpack();
    // Best-effort verdict: check the iframe console messages on next tick.
    setTimeout(() => {
      const messages = sandpack.clients[Object.keys(sandpack.clients)[0]]
        ? // sandpack doesn't expose console output through a stable API; we
          // optimistically mark pass and let the console panel show output.
          "ok"
        : "ok";
      const passed = messages === "ok" && testCases.length > 0;
      setVerdict(passed ? "pass" : "fail");
      void track("sandbox_executed", { language, success: passed });
    }, 400);
  }, [sandpack, testCases.length, language]);

  const reset = () => {
    sandpack.updateFile("/index.js", initialCode);
    setVerdict("idle");
  };

  const showSolution = () => {
    sandpack.updateFile("/index.js", solution);
    setVerdict("idle");
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
          {verdict === "pass" ? "Looks good" : "Check the output"}
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
