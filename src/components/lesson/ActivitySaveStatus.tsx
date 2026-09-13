"use client";
import type { ActivityPersistence } from "@/hooks/useActivityEvidence";

/** Distinguish a correct local answer from a durably recorded activity result. */
export function ActivitySaveStatus({
  state,
}: {
  state: ActivityPersistence;
}): React.ReactElement | null {
  if (!state.hasContext) return null;
  if (state.saveError)
    return (
      <p role="alert" className="my-2 text-sm text-[var(--color-text-primary)]">
        {state.saveError}
        {state.isReady && (
          <button
            type="button"
            disabled={state.isSaving}
            className="ml-2 min-h-12 underline"
            onClick={(): void => {
              void state
                .retryEvidence()
                .catch((error: unknown): void => console.error("[activity] Retry failed", error));
            }}
          >
            Retry saving result
          </button>
        )}
      </p>
    );
  if (state.isSaving)
    return (
      <p role="status" className="my-2 text-sm">
        Saving activity result…
      </p>
    );
  return null;
}
