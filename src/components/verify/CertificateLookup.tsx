"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CertificateView } from "@/components/verify/CertificateView";
import { lookupCertificate, type CertificateSource } from "@/lib/verify/lookup";
import { Spinner } from "@/components/ui/Spinner";
import type { Certificate } from "@/types/assessment";

interface CertificateLookupProps {
  hash: string;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "found"; certificate: Certificate; source: CertificateSource }
  | { kind: "missing" };

export function CertificateLookup({ hash }: CertificateLookupProps): React.ReactElement {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await lookupCertificate(hash);
        if (cancelled) return;
        if (result) {
          setState({ kind: "found", certificate: result.certificate, source: result.source });
        } else {
          setState({ kind: "missing" });
        }
      } catch (error) {
        console.error("[CertificateLookup] Failed to load:", error);
        if (!cancelled) setState({ kind: "missing" });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  if (state.kind === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (state.kind === "missing") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Certificate not found
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          We could not find a certificate with this hash on this device or in the public registry.
          If you earned it, sign in and let your local data sync — published certificates are
          resolvable from any device.
        </p>
        <p className="mt-4 font-mono text-xs text-[var(--color-text-muted)]">
          Hash: {hash.slice(0, 24)}…
        </p>
        <Link
          href="/verify"
          className="mt-6 inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Your certificates
        </Link>
      </div>
    );
  }

  const sourceLabel =
    state.source === "local" ? "Verified on this device" : "Verified via DURA public registry";

  return (
    <>
      <Link
        href="/verify"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-emerald-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Your certificates
      </Link>
      <CertificateView certificate={state.certificate} />
      <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">{sourceLabel}</p>
    </>
  );
}
