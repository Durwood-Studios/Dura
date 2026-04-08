"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";
import { getAllCertificates } from "@/lib/db/certificates";
import { getPhase } from "@/content/phases";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Certificate } from "@/types/assessment";

export function CertificateList(): React.ReactElement {
  const [state, setState] = useState<"loading" | "ready">("loading");
  const [certs, setCerts] = useState<Certificate[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const all = await getAllCertificates();
      if (cancelled) return;
      setCerts(all.sort((a, b) => b.completedAt - a.completedAt));
      setState("ready");
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (certs.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center">
        <Award className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
          No certificates yet
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Complete a phase verification test to earn your first certificate.
        </p>
        <Link
          href="/paths/0"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Start Phase 0
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {certs.map((cert) => {
        const phase = getPhase(cert.phaseId);
        const color = phase?.color ?? "#10b981";
        return (
          <li key={cert.id}>
            <Link
              href={`/verify/${cert.verificationHash}`}
              className="block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm transition hover:shadow-md"
            >
              <div
                className="px-5 py-4"
                style={{
                  background: `linear-gradient(135deg, ${color}55 0%, ${color}22 100%)`,
                }}
              >
                <Award className="h-5 w-5 text-[var(--color-text-primary)]" aria-hidden />
                <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)] uppercase">
                  Phase {cert.phaseId} · Verified
                </p>
                <h3 className="mt-1 text-base font-semibold text-[var(--color-text-primary)]">
                  {cert.phaseTitle}
                </h3>
              </div>
              <div className="flex items-center justify-between px-5 py-3 text-xs text-[var(--color-text-secondary)]">
                <span>{Math.round(cert.score * 100)}% score</span>
                <span>{new Date(cert.completedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
