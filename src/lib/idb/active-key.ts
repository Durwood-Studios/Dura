/**
 * Active encryption key holder for the IDB encryption wrapper (P5-A.2).
 *
 * The wrapper is called from synchronous-feeling APIs (getCard, putCard, sync
 * pull-side merges) that already manage their own promises but don't pass an
 * encryption key around. This module is the bridge: the AuthProvider calls
 * setActiveKey() on every auth state change; the wrapper calls
 * peekActiveKey() at read/write time.
 *
 * Holding the key in module scope is safe because:
 *   - The CryptoKey is non-extractable (Web Crypto enforces).
 *   - Module scope is per-worker; service worker + main thread don't share.
 *   - On sign-out, AuthProvider calls clearActiveKey() so the next read
 *     fails closed if the wrapper is set to require a key.
 */

import type { EncryptionKeyResolution } from "./encryption-key";

let active: EncryptionKeyResolution | null = null;

/** Set by AuthProvider on auth state change (or device-tier first mount). */
export function setActiveKey(resolution: EncryptionKeyResolution | null): void {
  active = resolution;
}

/** Read the current key resolution. Returns null if none is set yet. */
export function peekActiveKey(): EncryptionKeyResolution | null {
  return active;
}

/** Hard-clear the in-memory key. Used on sign-out. */
export function clearActiveKey(): void {
  active = null;
}
