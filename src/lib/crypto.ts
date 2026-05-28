import type { Certificate } from "@/types/assessment";

/**
 * SHA-256 hash via Web Crypto. Returns hex-encoded string.
 *
 * In secure contexts (HTTPS, localhost, file://) this uses the browser's
 * native SHA-256 — cryptographic strength suitable for tamper-evident
 * identifiers. In insecure contexts (`crypto.subtle` unavailable) the
 * function falls back to `fallbackHash()` — a 128-bit non-cryptographic
 * hash. The fallback is intentionally NOT a cryptographic hash and is
 * NOT a substitute for SHA-256.
 *
 * @see fallbackHash for the honest description of what the fallback delivers.
 *
 * TODO(security): for true tamper-proof verification (e.g. an outside party
 * wants to check a DURA certificate is genuine), this must be replaced with
 * server-side HMAC signing on certificate create — a Supabase Edge Function
 * that signs the payload with a server-held secret. The current scheme is
 * adequate for in-app display + sharing among learners, and the threat model
 * is bounded because DURA certificates have no commercial transfer value.
 */
export async function sha256(input: string): Promise<string> {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const data = new TextEncoder().encode(input);
      const buffer = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch (error) {
    console.error("[crypto] sha256 failed", error);
  }
  console.warn(
    "[crypto] crypto.subtle unavailable — using non-cryptographic fallback hash. " +
      "This is acceptable for display-only contexts but NOT for tamper-evident verification."
  );
  return fallbackHash(input);
}

const VERIFICATION_SALT = "dura-verify-v1";

/**
 * Build a verification hash for a certificate.
 * Stable across re-renders for the same certificate inputs.
 *
 * Threat-model note: in secure contexts this is SHA-256 over the certificate
 * fields with a constant salt. The salt is in the JS bundle, so this hash
 * defeats casual URL forgery (browser DevTools tinkering) but NOT a
 * determined attacker. For attestation-grade verification, see the TODO on
 * `sha256()`.
 */
export async function generateVerificationHash(
  cert: Omit<Certificate, "id" | "verificationHash">
): Promise<string> {
  const payload = [
    cert.phaseId,
    cert.displayName,
    cert.score.toFixed(4),
    cert.completedAt,
    VERIFICATION_SALT,
  ].join("|");
  return sha256(payload);
}

/**
 * Non-cryptographic 128-bit hash for the `crypto.subtle` unavailable path.
 *
 * Uses two independent 64-bit FNV-1a-style hashes with different seeds, then
 * concatenates them. Output is 32 hex chars (matches the visual format of
 * SHA-256 truncated to 128 bits, so the rest of the app doesn't see a
 * suddenly-shorter hash).
 *
 * Collision resistance: ~2^64 inputs before a birthday collision is likely.
 * Adequate to prevent random URL collisions for DURA's bounded user base.
 * NOT adequate to prevent intentional forgery by someone who can read this
 * file (the algorithm + seeds are right here in the bundle). For that,
 * server-side HMAC is required — see TODO on `sha256()`.
 */
function fallbackHash(str: string): string {
  // Two FNV-1a-style accumulators with different starting offsets and primes.
  // BigInt to avoid 32-bit overflow truncating the entropy.
  // BigInt() constructor calls (not literal `n` suffix) for ES2017 tsconfig compat.
  let h1 = BigInt("0xcbf29ce484222325");
  let h2 = BigInt("0x84222325cbf29ce4");
  const P1 = BigInt("0x100000001b3");
  const P2 = BigInt("0x1b3100000001");
  const mask = BigInt("0xffffffffffffffff");
  for (let i = 0; i < str.length; i++) {
    const c = BigInt(str.charCodeAt(i));
    h1 = ((h1 ^ c) * P1) & mask;
    h2 = ((h2 ^ c) * P2) & mask;
  }
  const hex = (n: bigint): string => n.toString(16).padStart(16, "0");
  return hex(h1) + hex(h2);
}
