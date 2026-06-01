/**
 * Server-side HMAC signing for certificate verification hashes.
 *
 * Threat model: the existing SHA-256 verification hash defeats casual URL
 * forging in DevTools but the salt is in the JS bundle, so a determined
 * attacker who reads the bundle can compute hashes for arbitrary cert
 * payloads. This module adds the layer that the bundle salt cannot
 * provide — a signature anchored to a secret that NEVER leaves the
 * server.
 *
 * Algorithm: HMAC-SHA-256 of the verification hash. The signature is
 * 32 bytes → 64 hex chars. Verification compares signatures with a
 * timing-safe equal so the server doesn't leak signature bytes via the
 * response time.
 *
 * This file is server-only. Calling it from a client component fails at
 * import time because `node:crypto` is unavailable in the browser bundle.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const HEX_RE = /^[a-f0-9]{32,64}$/i;

function getSecret(): string | null {
  const secret = process.env.VERIFICATION_HMAC_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

/** True when the server is provisioned with a usable HMAC secret. */
export function isSigningConfigured(): boolean {
  return getSecret() !== null;
}

/**
 * Sign a verification hash. Returns null when the server is not
 * provisioned with a secret — caller must handle that as a soft failure
 * (the certificate is still valid, it just has no math-anchored badge).
 */
export function signHash(hash: string): string | null {
  if (!HEX_RE.test(hash)) return null;
  const secret = getSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(hash).digest("hex");
}

/**
 * Verify a (hash, signature) pair. Returns false on any error — invalid
 * format, server not provisioned, signature mismatch. Constant-time
 * comparison so the server does not leak signature bytes via the response
 * time channel.
 */
export function verifyHash(hash: string, signature: string): boolean {
  if (!HEX_RE.test(hash)) return false;
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = signHash(hash);
  if (!expected) return false;
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
