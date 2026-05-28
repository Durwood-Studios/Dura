/**
 * Anthropic API key — local-only storage.
 *
 * The key lives in `localStorage` under `dura:ai:anthropic-key`. It is
 * never sent to Durwood servers, never written to IndexedDB, never
 * included in any sync payload, never named in any analytics event.
 * The request goes browser → api.anthropic.com directly.
 *
 * Validation is regex-only at set time. A live API ping is performed by
 * the Settings UI (AIFeaturesPanel) so an obviously-malformed key
 * fails fast before it ever leaves the input.
 */
const KEY_STORAGE_KEY = "dura:ai:anthropic-key";

/**
 * Anthropic console keys are prefixed `sk-ant-` followed by Base64URL
 * characters. The exact length has drifted over time; we accept any
 * length ≥ 8 after the prefix. The regex is a sanity gate, not a
 * security boundary — the live ping is the real check.
 */
const ANTHROPIC_KEY_PATTERN = /^sk-ant-[A-Za-z0-9_-]{8,}$/;

export function getAnthropicKey(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function hasAnthropicKey(): boolean {
  return getAnthropicKey() !== null;
}

export type SetKeyResult = { ok: true } | { ok: false; error: string };

export function setAnthropicKey(rawKey: string): SetKeyResult {
  const key = rawKey.trim();
  if (!key) return { ok: false, error: "Key is empty." };
  if (!ANTHROPIC_KEY_PATTERN.test(key)) {
    return {
      ok: false,
      error: "Doesn't look like an Anthropic key (expected `sk-ant-…`).",
    };
  }
  if (typeof localStorage === "undefined") {
    return { ok: false, error: "Local storage unavailable in this browser." };
  }
  try {
    localStorage.setItem(KEY_STORAGE_KEY, key);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Couldn't save the key: ${(err as Error).message}` };
  }
}

export function clearAnthropicKey(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(KEY_STORAGE_KEY);
  } catch {
    // ignore — defensive against quota or storage-disabled contexts
  }
}
