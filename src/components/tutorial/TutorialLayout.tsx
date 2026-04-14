"use client";

import { ProgressBar } from "./ProgressBar";
import { StepCounter } from "./StepCounter";

interface TutorialLayoutProps {
  /** Tutorial title */
  title: string;
  /** Brief description */
  description?: string;
  /** Current step (1-based) */
  currentStep: number;
  /** Total steps */
  totalSteps: number;
  /** Navigation callbacks */
  onPrev?: () => void;
  onNext?: () => void;
  /** Whether the next button is enabled */
  canAdvance?: boolean;
  children: React.ReactNode;
}

/** Full-page tutorial wrapper with header, progress, and nav. */
export function TutorialLayout({
  title,
  description,
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  canAdvance = true,
  children,
}: TutorialLayoutProps): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
              )}
            </div>
            <StepCounter current={currentStep} total={totalSteps} />
          </div>
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>

      {/* Navigation footer */}
      <footer className="border-t border-[var(--color-border)] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={onPrev}
            disabled={currentStep <= 1}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] disabled:opacity-40 disabled:hover:bg-transparent"
          >
            ← Previous
          </button>
          <button
            onClick={onNext}
            disabled={!canAdvance || currentStep >= totalSteps}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600"
          >
            Next →
          </button>
        </div>
      </footer>
    </div>
  );
}
