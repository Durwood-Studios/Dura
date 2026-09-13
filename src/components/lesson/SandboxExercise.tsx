"use client";

import { ExternalSandboxConsent } from "@/components/sandbox/ExternalSandboxConsent";
import type { ActivityProps } from "@/hooks/useActivityEvidence";
import { WrittenExercise } from "@/components/lesson/WrittenExercise";

import { Component, type ErrorInfo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { SandboxExerciseSkeleton } from "@/components/lesson/SandboxExerciseSkeleton";

interface SandboxExerciseProps extends ActivityProps {
  language?: "javascript" | "typescript" | "react" | "html";
  instructions: string;
  initialCode: string;
  solution: string;
  testCases?: string[];
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Catches dynamic import failures and Sandpack runtime errors. */
class SandboxErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[SandboxExercise] Render failed:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const SandboxExerciseInner = dynamic(() => import("@/components/lesson/SandboxExerciseInner"), {
  ssr: false,
  loading: () => <SandboxExerciseSkeleton />,
});

/** Fallback when the interactive sandbox can't load. */
function SandboxFallback({
  initialCode,
  onRetry,
}: {
  initialCode: string;
  onRetry: () => void;
}): React.ReactElement {
  return (
    <section className="my-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="mb-3 text-sm font-medium text-amber-800">
        Interactive sandbox unavailable. Code shown in read-only mode.
      </p>
      <pre className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-sm leading-relaxed">
        <code>{initialCode}</code>
      </pre>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg border border-amber-300 bg-[var(--color-bg-surface)] px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
      >
        Retry
      </button>
    </section>
  );
}

export function SandboxExercise({
  activityId,
  activityLessonId,
  language = "javascript",
  instructions,
  initialCode,
  solution,
  testCases = [],
}: SandboxExerciseProps): React.ReactElement {
  const fallback = (
    <SandboxFallback initialCode={initialCode} onRetry={() => window.location.reload()} />
  );

  return (
    <>
      <SandboxErrorBoundary fallback={fallback}>
        <ExternalSandboxConsent>
          <SandboxExerciseInner
            activityId={activityId}
            activityLessonId={activityLessonId}
            language={language}
            instructions={instructions}
            initialCode={initialCode}
            solution={solution}
            testCases={testCases}
          />
        </ExternalSandboxConsent>
      </SandboxErrorBoundary>
      {activityId && (
        <WrittenExercise
          activityId={activityId}
          activityLessonId={activityLessonId}
          title="Record a code review or offline solution"
          instructions={instructions}
          rubric={[
            "Explain how your solution meets the exercise instructions",
            "Record the checks you performed, their results, and any untested assumptions",
          ]}
          modelAnswer={solution}
        />
      )}
    </>
  );
}
