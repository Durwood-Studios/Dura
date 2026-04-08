import type { Certificate } from "@/types/assessment";

/**
 * SHA-256 hash via Web Crypto. Returns hex-encoded string.
 *
 * Falls back to a non-cryptographic hash when crypto.subtle is
 * unavailable (typically: insecure context, very old browsers). The
 * fallback is collision-prone — useful for offline scenarios but should
 * not be relied on for tamper resistance.
 *
 * TODO(security): server-side HMAC signing for true tamper-proof
 * verification. This client-only hash is "honest-but-curious" — it
 * prevents URL forgery from casual inspection but a determined forger
 * could read the salt from the bundle.
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
  return simpleHash(input);
}

const VERIFICATION_SALT = "dura-verify-v1";

/**
 * Build a verification hash for a certificate.
 * Stable across re-renders for the same certificate inputs.
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

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}
