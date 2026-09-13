"use client";

import { useState } from "react";

/** Mount the external-origin preview only after the learner chooses to share source with it. */
export function ExternalSandboxConsent({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [hasConsent, setHasConsent] = useState(false);
  if (hasConsent)
    return (
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <span>
            External web preview enabled. Source is available to the CodeSandbox-origin runtime.
          </span>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Close the external preview? Save or download your work first; unsaved editor changes will be lost."
                )
              )
                setHasConsent(false);
            }}
            className="min-h-12 underline"
          >
            Close external preview
          </button>
        </div>
        {children}
      </div>
    );
  return (
    <section className="my-4 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <h3 className="font-semibold">Enable the web sandbox?</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">
        This preview loads a CodeSandbox-origin runtime and sends your sandbox source to that
        iframe. Packages may load from third-party CDNs. It needs a connection and must not contain
        passwords, API keys, or private code. Your saved snippets remain in DURA’s local storage.
      </p>
      <button
        type="button"
        onClick={() => setHasConsent(true)}
        className="min-h-12 rounded-lg bg-[var(--color-accent)] px-4 text-sm text-white"
      >
        Enable external web sandbox
      </button>
    </section>
  );
}
