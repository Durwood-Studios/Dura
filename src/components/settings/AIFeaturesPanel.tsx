"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, KeyRound, Trash2, Check, Loader2, ExternalLink } from "lucide-react";
import {
  getAIConsentState,
  grantAIConsent,
  revokeAIConsent,
  subscribeAIConsentChanges,
  type AIConsentState,
} from "@/lib/ai/consent-gate";
import { setAnthropicKey, clearAnthropicKey, hasAnthropicKey } from "@/lib/ai/key-storage";
import { chat, AIInvalidKeyError } from "@/lib/ai/anthropic-client";

/**
 * Settings → AI Features panel. The opt-in surface for AI Tutor + Code
 * Review (which ship in follow-up commits). Three states:
 *
 *  1. No consent yet → consent card with what-this-does explainer +
 *     BYOK cost acknowledgement checkbox.
 *  2. Consented but no key → key entry + "test" button.
 *  3. Consented + key on file → status + "test" + "remove key" +
 *     "revoke consent".
 *
 * All state lives in localStorage (consent + key). No Supabase, no IDB,
 * no analytics events from this panel.
 */
export function AIFeaturesPanel(): React.ReactElement {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<AIConsentState>(() => ({
    aiConsented: false,
    consentedAt: null,
    byokAcknowledged: false,
  }));
  const [keyOnFile, setKeyOnFile] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setConsent(getAIConsentState());
    setKeyOnFile(hasAnthropicKey());
    const unsubscribe = subscribeAIConsentChanges(() => {
      setConsent(getAIConsentState());
      setKeyOnFile(hasAnthropicKey());
    });
    return unsubscribe;
  }, []);

  // Render a stable shell pre-hydration so SSR + first client render
  // agree even though the actual state depends on localStorage.
  if (!hydrated) {
    return <PanelShell />;
  }

  return (
    <PanelShell>
      {!consent.aiConsented ? (
        <ConsentCard onGrant={() => setConsent(getAIConsentState())} />
      ) : (
        <ConfiguredPanel
          keyOnFile={keyOnFile}
          onKeyChange={() => setKeyOnFile(hasAnthropicKey())}
        />
      )}
    </PanelShell>
  );
}

function PanelShell({ children }: { children?: React.ReactNode }): React.ReactElement {
  return (
    <section className="dura-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
        <h2 className="text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          AI features
        </h2>
        <span className="ml-auto rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">
          Optional · BYOK
        </span>
      </div>
      {children ?? <p className="text-xs text-[var(--color-text-muted)]">Loading preference…</p>}
    </section>
  );
}

function ConsentCard({ onGrant }: { onGrant: () => void }): React.ReactElement {
  const [ackBYOK, setAckBYOK] = useState(false);

  return (
    <div className="flex flex-col gap-4 text-sm text-[var(--color-text-secondary)]">
      <p className="leading-relaxed">
        DURA can connect to Claude (Anthropic&rsquo;s AI) for two optional surfaces:{" "}
        <strong className="text-[var(--color-text-primary)]">Ask about this lesson</strong> and{" "}
        <strong className="text-[var(--color-text-primary)]">Code review</strong>. Both are off by
        default and are <strong>supplementary</strong> — DURA&rsquo;s core curriculum (lessons,
        sandboxes, FSRS, dictionary, certificates) stays 100% free without them.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed">
        <li>
          <strong>What gets sent.</strong> Your typed question + the current lesson&rsquo;s title,
          concept tags, and body. Never your name, email, progress, or other lessons.
        </li>
        <li>
          <strong>Where it goes.</strong> Directly from your browser to{" "}
          <code>api.anthropic.com</code>. Durwood Studios doesn&rsquo;t see or log the conversation.
        </li>
        <li>
          <strong>Training.</strong> Anthropic doesn&rsquo;t train models on API requests by default
          (see their{" "}
          <a
            className="text-[var(--color-accent)] underline"
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noreferrer noopener"
          >
            privacy policy
          </a>
          ).
        </li>
        <li>
          <strong>Cost.</strong> You bring your own Anthropic API key. Each question costs ~1–3
          cents on Anthropic&rsquo;s metered billing. Set a spend cap in your{" "}
          <a
            className="text-[var(--color-accent)] underline"
            href="https://console.anthropic.com/settings/limits"
            target="_blank"
            rel="noreferrer noopener"
          >
            Anthropic console
          </a>
          .
        </li>
      </ul>
      <label className="flex items-start gap-2 text-xs leading-relaxed">
        <input
          type="checkbox"
          checked={ackBYOK}
          onChange={(e) => setAckBYOK(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
        />
        <span>
          I understand each question is billed to my Anthropic account by Anthropic, not Durwood
          Studios.
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!ackBYOK}
          onClick={() => {
            grantAIConsent({ byokAcknowledged: true });
            onGrant();
          }}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Turn on AI features
        </button>
      </div>
    </div>
  );
}

function ConfiguredPanel({
  keyOnFile,
  onKeyChange,
}: {
  keyOnFile: boolean;
  onKeyChange: () => void;
}): React.ReactElement {
  const [draftKey, setDraftKey] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const saveKey = useCallback(() => {
    setSaveError(null);
    setTestStatus("idle");
    const result = setAnthropicKey(draftKey);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setDraftKey("");
    onKeyChange();
  }, [draftKey, onKeyChange]);

  const testKey = useCallback(async () => {
    setTestStatus("testing");
    setTestError(null);
    try {
      // Smallest possible request — costs a fraction of a cent.
      await chat({
        messages: [{ role: "user", content: "ping" }],
        maxTokens: 4,
      });
      setTestStatus("ok");
    } catch (err) {
      setTestStatus("fail");
      if (err instanceof AIInvalidKeyError) {
        setTestError("Anthropic rejected this key. Double-check it on the Anthropic console.");
      } else if (err instanceof Error) {
        setTestError(err.message);
      } else {
        setTestError("Unknown error.");
      }
    }
  }, []);

  const removeKey = useCallback(() => {
    clearAnthropicKey();
    setTestStatus("idle");
    setTestError(null);
    onKeyChange();
  }, [onKeyChange]);

  const revoke = useCallback(() => {
    revokeAIConsent();
    setShowRevokeConfirm(false);
  }, []);

  return (
    <div className="flex flex-col gap-5 text-sm text-[var(--color-text-secondary)]">
      <div className="flex items-start gap-2">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
        <p className="text-xs leading-relaxed">
          AI features are on. Your conversations stay between your browser and{" "}
          <code>api.anthropic.com</code>.
        </p>
      </div>

      {!keyOnFile ? (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-primary)]">
            <KeyRound className="h-3.5 w-3.5" aria-hidden />
            Anthropic API key
          </label>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            placeholder="sk-ant-…"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
          />
          {saveError && <p className="text-xs text-rose-600 dark:text-rose-400">{saveError}</p>}
          <p className="text-xs text-[var(--color-text-muted)]">
            Create one at{" "}
            <a
              className="text-[var(--color-accent)] underline"
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer noopener"
            >
              console.anthropic.com
              <ExternalLink className="ml-0.5 inline h-3 w-3" aria-hidden />
            </a>
            . Stored only in this browser.
          </p>
          <div>
            <button
              type="button"
              onClick={saveKey}
              disabled={!draftKey.trim()}
              className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save key
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs">
            Key on file. <code className="font-mono">sk-ant-…</code> (hidden)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void testKey()}
              disabled={testStatus === "testing"}
              className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-progress"
            >
              {testStatus === "testing" ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : null}
              Test key
            </button>
            <button
              type="button"
              onClick={removeKey}
              className="flex items-center gap-1.5 rounded-md border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              Remove key
            </button>
            {testStatus === "ok" && (
              <span className="text-xs text-emerald-700 dark:text-emerald-400">✓ Key is live.</span>
            )}
            {testStatus === "fail" && (
              <span className="text-xs text-rose-700 dark:text-rose-400">{testError}</span>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-[var(--color-border)] pt-4">
        {!showRevokeConfirm ? (
          <button
            type="button"
            onClick={() => setShowRevokeConfirm(true)}
            className="text-xs text-[var(--color-text-muted)] underline hover:text-rose-700 dark:hover:text-rose-400"
          >
            Turn off AI features + delete key
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-[var(--color-text-secondary)]">
              This deletes your key from this browser and disables AI features. You can re-enable
              anytime.
            </p>
            <button
              type="button"
              onClick={() => setShowRevokeConfirm(false)}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={revoke}
              className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
