/**
 * Encryption-key resolver for IDB at-rest encryption (P5-A).
 *
 * DURA is offline-first per CLAUDE.md Rule 3 — auth is optional, sync is
 * optional, the app must work without Supabase. That makes the build
 * prompt's "key derives from Supabase Auth UID; logout destroys access"
 * design partially incompatible: anonymous learners would have NO at-rest
 * protection.
 *
 * This module provides a dual-tier key derivation:
 *
 *   Tier 1 — Authenticated:   seed = `auth:<supabase-uid>`
 *   Tier 2 — Anonymous:       seed = `device:<random-256-bit-secret>`
 *                             (random secret persisted in localStorage,
 *                             generated once on first launch)
 *
 * The anonymous tier is honestly weaker — a local attacker with the IDB
 * blob AND localStorage gets the seed for free. It's not theatre: it
 * defends against (a) other web apps that share IndexedDB but not
 * localStorage origin, (b) blind exfiltration of an IDB dump without the
 * paired localStorage entry, (c) accidentally syncing an IDB snapshot to
 * cloud backups while localStorage is excluded. The threat model is
 * documented in src/lib/idb/encryption.ts.
 *
 * On sign-in, an anonymous learner's seed is "upgraded" to the auth seed
 * for new writes; old records remain readable through the device-secret
 * key until the migration pass rewrites them. The migration is owed to
 * the wiring commit that lands after this one.
 */

import { deriveEncryptionKey, forgetEncryptionKeys } from "./encryption";

const DEVICE_SECRET_KEY = "dura:idb:device-secret";

export type EncryptionKeyTier = "auth" | "device" | "unavailable";

export interface EncryptionKeyResolution {
  tier: EncryptionKeyTier;
  key: CryptoKey | null;
  seed: string | null;
}

/**
 * Resolve a key for the current session. `authUserId` is the Supabase
 * auth UID when the learner is signed in; pass null for anonymous mode.
 * Returns `tier: "unavailable"` only when running outside the browser
 * (server-rendering path) — the caller must short-circuit IDB access in
 * that case.
 */
export async function resolveEncryptionKey(
  authUserId: string | null
): Promise<EncryptionKeyResolution> {
  if (typeof window === "undefined") {
    return { tier: "unavailable", key: null, seed: null };
  }

  if (authUserId) {
    const seed = `auth:${authUserId}`;
    const key = await deriveEncryptionKey(seed);
    return { tier: "auth", key, seed };
  }

  const deviceSecret = readOrCreateDeviceSecret();
  const seed = `device:${deviceSecret}`;
  const key = await deriveEncryptionKey(seed);
  return { tier: "device", key, seed };
}

/**
 * Drop the cached key set. Call on sign-out so the next encrypted read
 * fails closed. Does NOT clear the device secret in localStorage —
 * anonymous-tier reads continue to work after sign-out, which is the
 * correct behavior (signing out should not destroy a learner's local
 * data; only signing out from a session that minted records under the
 * auth tier needs the migration story).
 */
export function clearKeyCache(): void {
  forgetEncryptionKeys();
}

/**
 * Reset the device secret. Used by clearAllData() so a fresh anonymous
 * session can't read the previous one's IDB. Encrypted records keyed
 * to the prior device secret become permanently unreadable — which is
 * the desired effect of "clear all data".
 */
export function resetDeviceSecret(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEVICE_SECRET_KEY);
  forgetEncryptionKeys();
}

function readOrCreateDeviceSecret(): string {
  const existing = window.localStorage.getItem(DEVICE_SECRET_KEY);
  if (existing && existing.length >= 32) return existing;

  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  window.localStorage.setItem(DEVICE_SECRET_KEY, hex);
  return hex;
}
