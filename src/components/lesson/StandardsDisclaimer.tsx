import Link from "next/link";
import { Info } from "lucide-react";

interface StandardsDisclaimerProps {
  /** Canonical anchor for this lesson, e.g. "ISO 9001:2015". Omit for the
   *  generic form shown on lessons with no single primary standard. */
  anchor?: string;
  /** ISO date the standards registry was last reviewed for currency. */
  reviewedAt: string;
}

function formatDate(iso: string): string {
  // Parse as UTC calendar date to avoid TZ drift on a date-only string.
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Standards-currency disclaimer shown on lessons that cite a formal industry
 * standard. States the "as of" review date and directs learners to verify
 * against the official publication — the currency-liability shield that lets
 * the curriculum reference third-party standards without warranting they are
 * still the latest revision. Full notice lives at /standards-currency.
 */
export function StandardsDisclaimer({
  anchor,
  reviewedAt,
}: StandardsDisclaimerProps): React.ReactElement {
  return (
    <aside
      role="note"
      aria-label="Standards currency notice"
      className="mt-4 flex gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-3 text-xs leading-relaxed text-[var(--color-text-secondary)]"
    >
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
      <p>
        {anchor ? (
          <>
            This lesson is anchored to <span className="font-medium">{anchor}</span>. Standards
            references were last reviewed for currency on{" "}
          </>
        ) : (
          <>Standards references in this lesson were last reviewed for currency on </>
        )}
        <span className="font-medium text-[var(--color-text-primary)]">
          {formatDate(reviewedAt)}
        </span>
        . Editions and clause numbers change — always confirm against the official published
        standard before relying on this professionally. Educational content, not compliance,
        certification, or legal advice.{" "}
        <Link
          href="/standards-currency"
          className="text-[var(--color-accent)] underline underline-offset-2 hover:opacity-80"
        >
          Standards currency &amp; disclaimer
        </Link>
      </p>
    </aside>
  );
}
