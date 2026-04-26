/**
 * AES-256-GCM at-rest encryption for IndexedDB learner records.
 *
 * OWASP A02 / GDPR Art. 5(1)(f) Compliance Sprint Phase 5-A.
 *
 * Cryptographic contract:
 *   - Algorithm: AES-256-GCM (authenticated encryption — integrity + confidentiality)
 *   - Key derivation: PBKDF2-SHA-256, 100,000 iterations, salt = "dura-idb-v1"
 *   - IV: 12 fresh random bytes per record (NIST SP 800-38D minimum)
 *   - Wire format: [12-byte IV][ciphertext+tag]
 *
 * Key material lifecycle:
 *   - Keys are non-extractable CryptoKey handles (Web Crypto enforces).
 *   - Keys are held in a module-scoped Map keyed by their derivation seed,
 *     never persisted, never written to localStorage.
 *   - On sign-out, callers must invalidate the key cache via
 *     forgetEncryptionKeys() so a subsequent read fails closed.
 *
 * Threat model:
 *   - Defends against: other web apps sharing the IDB, browser extensions
 *     enumerating IndexedDB, malware reading IDB blob files at rest,
 *     accidental sync of unencrypted blobs to a different account.
 *   - Does NOT defend against: a local attacker who has both (a) the IDB
 *     contents AND (b) the derivation seed — for anonymous users that's
 *     localStorage, for auth users it's an active Supabase session.
 *     This is honest and inherent — at-rest encryption without an HSM
 *     can never be stronger than the seed's secrecy.
 *
 * This module ships the primitives + key derivation. Wiring the wrapper
 * into the live db.ts read/write paths happens in a follow-up commit so
 * the cryptographic surface gets reviewed independently.
 */

const SALT_BYTES = new TextEncoder().encode("dura-idb-v1");
const PBKDF2_ITERATIONS = 100_000;
const AES_KEY_LENGTH = 256;
const IV_LENGTH = 12;

/** Sentinel embedded as the first 4 bytes of every encrypted record so the
 *  wrapped IDB read path can distinguish encrypted blobs from legacy
 *  plaintext JSON during the migration window. ASCII "DURA" = 44 55 52 41. */
export const ENCRYPTED_MAGIC = new Uint8Array([0x44, 0x55, 0x52, 0x41]);

const keyCache = new Map<string, Promise<CryptoKey>>();

/**
 * Derive a non-extractable AES-256-GCM key from a seed string. The seed
 * is the auth UID for signed-in users or the device secret for anonymous
 * users — see encryption-key.ts. Cached per-seed so we don't re-derive on
 * every read.
 */
export function deriveEncryptionKey(seed: string): Promise<CryptoKey> {
  if (!seed || typeof seed !== "string") {
    throw new Error("deriveEncryptionKey: seed must be a non-empty string");
  }
  const cached = keyCache.get(seed);
  if (cached) return cached;

  const promise = (async () => {
    const subtle = getSubtle();
    const seedBytes = new TextEncoder().encode(seed);
    const keyMaterial = await subtle.importKey("raw", seedBytes, "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: SALT_BYTES,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: AES_KEY_LENGTH },
      /* extractable */ false,
      ["encrypt", "decrypt"]
    );
  })();

  keyCache.set(seed, promise);
  return promise;
}

/** Drop all cached keys. Call on sign-out so encrypted records become
 *  unreadable until the user authenticates again. */
export function forgetEncryptionKeys(): void {
  keyCache.clear();
}

/** Encrypt a JSON-serializable record. Output: MAGIC + IV + ciphertext+tag. */
export async function encryptRecord(data: unknown, key: CryptoKey): Promise<ArrayBuffer> {
  const subtle = getSubtle();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  const out = new Uint8Array(ENCRYPTED_MAGIC.length + iv.length + ciphertext.byteLength);
  out.set(ENCRYPTED_MAGIC, 0);
  out.set(iv, ENCRYPTED_MAGIC.length);
  out.set(new Uint8Array(ciphertext), ENCRYPTED_MAGIC.length + iv.length);
  return out.buffer;
}

/** Test whether a buffer was produced by encryptRecord(). Used by the
 *  wrapped IDB read path to distinguish encrypted blobs from legacy
 *  plaintext records during the best-effort migration. */
export function isEncryptedRecord(buffer: ArrayBuffer | Uint8Array): boolean {
  const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (view.byteLength < ENCRYPTED_MAGIC.length + IV_LENGTH) return false;
  for (let i = 0; i < ENCRYPTED_MAGIC.length; i++) {
    if (view[i] !== ENCRYPTED_MAGIC[i]) return false;
  }
  return true;
}

/** Decrypt a record produced by encryptRecord(). Throws on tampering or
 *  wrong key (AES-GCM authenticated decryption). */
export async function decryptRecord(buffer: ArrayBuffer, key: CryptoKey): Promise<unknown> {
  if (!isEncryptedRecord(buffer)) {
    throw new Error("decryptRecord: buffer is not an encrypted record");
  }
  const subtle = getSubtle();
  const iv = new Uint8Array(buffer, ENCRYPTED_MAGIC.length, IV_LENGTH);
  const ciphertext = new Uint8Array(buffer, ENCRYPTED_MAGIC.length + IV_LENGTH);
  const plaintext = await subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

function getSubtle(): SubtleCrypto {
  // Node 20+ exposes crypto.subtle on the global crypto; older Node and
  // Edge runtimes need the WebCrypto polyfill. Either way we read it
  // through the standard global so test setups can stub it.
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error(
      "Web Crypto SubtleCrypto unavailable. AES-GCM requires a secure context (https://) or a Node 20+ test runner."
    );
  }
  return crypto.subtle;
}
