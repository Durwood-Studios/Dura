"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CertificateView } from "@/components/verify/CertificateView";
import { getCertificateByHash } from "@/lib/db/certificates";
import { Spinner } from "@/components/ui/Spinner";
import type { Certificate } from "@/types/assessment";

interface CertificateLookupProps {
  hash: string;
}

export function CertificateLookup({ hash }: CertificateLookupProps): React.ReactElement {
  const [state, setState] = useState<"loading" | "found" | "missing">("loading");
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const cert = await getCertificateByHash(hash);
      if (cancelled) return;
      if (cert) {
        setCertificate(cert);
        setState("found");
      } else {
        setState("missing");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (state === "missing" || !certificate) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Certificate not found
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          This certificate is stored locally on the device that earned it. Cross-device verification
          is coming soon.
        </p>
        <p className="mt-4 font-mono text-[10px] text-[var(--color-text-muted)]">
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

  return (
    <>
      <Link
        href="/verify"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-emerald-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Your certificates
      </Link>
      <CertificateView certificate={certificate} />
      <p className="mt-6 text-center text-[10px] text-[var(--color-text-muted)]">
        This certificate is stored locally. Cross-device verification coming soon.
      </p>
    </>
  );
}
