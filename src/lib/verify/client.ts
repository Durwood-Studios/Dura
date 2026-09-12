/** Helpers for sharing certificates and checking historical hash receipts.
 * A receipt is not evidence of assessment completion or learner identity.
 */

import type { Certificate } from "@/types/assessment";

const CHECK_ENDPOINT = "/api/verify/check";
const SIG_PARAM = "sig";

/** Return null when verification is unavailable, distinct from a rejected signature. */
export async function checkSignature(hash: string, signature: string): Promise<boolean | null> {
  const controller = new AbortController();
  const timeout = setTimeout((): void => controller.abort(), 10_000);
  try {
    const res = await fetch(CHECK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash, signature }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { valid?: unknown };
    return typeof data.valid === "boolean" ? data.valid : null;
  } catch (error: unknown) {
    console.error("[verify] Signature check unavailable:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildSignedShareUrl(
  baseUrl: string,
  certificate: Pick<Certificate, "verificationHash" | "signature">
): string {
  const path = `${baseUrl}/verify/${certificate.verificationHash}`;
  return certificate.signature
    ? `${path}?${SIG_PARAM}=${encodeURIComponent(certificate.signature)}`
    : path;
}

/** Reads the `?sig=` query parameter, validating it as a hex string. Returns
 *  null when no parameter is present or the value is malformed. */
export function readSignatureFromUrl(searchParams: URLSearchParams): string | null {
  const raw = searchParams.get(SIG_PARAM);
  if (!raw) return null;
  if (!/^[a-f0-9]{64}$/i.test(raw)) return null;
  return raw;
}
