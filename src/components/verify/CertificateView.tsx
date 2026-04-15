"use client";

import { useState } from "react";
import { Award, Check, Copy, Download } from "lucide-react";
import { ShareButton } from "@/components/seo/ShareButton";
import { copyToClipboard } from "@/lib/share";
import { SITE_URL } from "@/lib/og";
import { getPhase } from "@/content/phases";
import type { Certificate } from "@/types/assessment";

interface CertificateViewProps {
  certificate: Certificate;
}

export function CertificateView({ certificate }: CertificateViewProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const phase = getPhase(certificate.phaseId);
  const url = `${SITE_URL}/verify/${certificate.verificationHash}`;
  const shortHash = certificate.verificationHash.slice(0, 12);

  const copyHash = async () => {
    const ok = await copyToClipboard(certificate.verificationHash);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const phaseColor = phase?.color ?? "#10b981";

  return (
    <article
      id="certificate-printable"
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-lg"
    >
      <header
        className="px-8 py-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${phaseColor}55 0%, ${phaseColor}22 100%)`,
        }}
      >
        <Award className="mx-auto h-14 w-14 text-[var(--color-text-primary)]" aria-hidden />
        <p className="mt-3 font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
          DURA · Verified
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">
          {certificate.phaseTitle}
        </h1>
      </header>

      <div className="px-8 py-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">This certifies that</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
          {certificate.displayName}
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          demonstrated mastery of {certificate.phaseTitle} through verified assessment
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">Score</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {Math.round(certificate.score * 100)}%
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">
              Questions
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
              {certificate.totalQuestions}
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-[var(--color-border)] p-3 sm:col-span-1">
            <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">Date</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              {new Date(certificate.completedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {certificate.standards.length > 0 && (
          <div className="mt-6 rounded-lg bg-[var(--color-bg-subtle)] p-4 text-left">
            <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">
              Standards covered
            </p>
            <p className="mt-1 flex flex-wrap gap-1.5 text-xs text-[var(--color-text-secondary)]">
              {certificate.standards.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-0.5"
                >
                  {s}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      <footer className="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-8 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => void copyHash()}
          className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)]"
          aria-label="Copy verification hash"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          <span className="font-mono">{shortHash}…</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)]"
          >
            <Download className="h-3 w-3" />
            Download PDF
          </button>
          <ShareButton
            url={url}
            title={`${certificate.phaseTitle} — Verified on DURA`}
            text="I just verified my mastery on DURA."
          />
        </div>
      </footer>
      <p className="mt-2 text-center text-[10px] text-[var(--color-text-muted)] print:hidden">
        Choose &ldquo;Save as PDF&rdquo; in the print dialog
      </p>
    </article>
  );
}
