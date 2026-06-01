/**
 * Cross-device certificate lookup.
 *
 * The Supabase queries layer already exposes a public `getCertificateByHash`
 * RPC (see supabase/migrations/006-functions.sql) and the sync flow already
 * publishes earned certs to that table when the learner is signed in
 * (src/lib/supabase/sync.ts). This helper composes the two so a verifier
 * who lands on /verify/{hash} can resolve it whether they earned it locally,
 * own a different device, or are an outside party clicking a link.
 *
 * Resolution order — local first because it's instant and authoritative for
 * the earner's own browser, then public registry for everyone else:
 *
 *   1. Local IndexedDB (the earner's own device, no network)
 *   2. Supabase public registry (whoever published it)
 *   3. Not found
 *
 * The remote step degrades silently: if Supabase isn't configured or the
 * call throws, the function returns null and the UI shows the not-found
 * state. The lookup is intentionally tolerant — a missing registry is a
 * recoverable condition, not an error to bubble up.
 */

import { getCertificateByHash as getLocalCertificate } from "@/lib/db/certificates";
import { getCertificateByHash as getRemoteCertificate } from "@/lib/supabase/queries/certificates";
import type { Certificate } from "@/types/assessment";

export type CertificateSource = "local" | "registry";

export interface CertificateLookupResult {
  certificate: Certificate;
  source: CertificateSource;
}

function isRegistryConfigured(): boolean {
  return (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0
  );
}

export async function lookupCertificate(hash: string): Promise<CertificateLookupResult | null> {
  const local = await getLocalCertificate(hash);
  if (local) return { certificate: local, source: "local" };

  if (!isRegistryConfigured()) return null;

  try {
    const remote = await getRemoteCertificate(hash);
    if (remote) return { certificate: remote, source: "registry" };
  } catch (error) {
    console.error("[verify/lookup] Registry lookup failed", error);
  }

  return null;
}
