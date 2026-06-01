/**
 * Client-side helpers for the HMAC signing layer.
 *
 *   requestSignature(hash)        — earner-side, called when a cert is created
 *   checkSignature(hash, sig)     — verifier-side, called when the URL has ?sig=
 *   buildSignedShareUrl(...)      — earner-side, build the URL with ?sig=
 *   readSignatureFromUrl()        — verifier-side, read ?sig= from the location
 *
 * All four functions degrade silently — the cert + verify flows work without
 * signatures, the math-anchored badge just doesn't appear.
 */

import type { Certificate } from "@/types/assessment";

const SIGN_ENDPOINT = "/api/verify/sign";
const CHECK_ENDPOINT = "/api/verify/check";
const SIG_PARAM = "sig";

export async function requestSignature(hash: string): Promise<string | null> {
  try {
    const res = await fetch(SIGN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { signature?: unknown };
    return typeof data.signature === "string" ? data.signature : null;
  } catch {
    return null;
  }
}

export async function checkSignature(hash: string, signature: string): Promise<boolean> {
  try {
    const res = await fetch(CHECK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash, signature }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { valid?: unknown };
    return data.valid === true;
  } catch {
    return false;
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
