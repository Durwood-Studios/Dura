import Link from "next/link";
import type { Metadata } from "next";
import { AssessmentRequestError, verifyIssuedCredential } from "@/lib/verify/assessment-server";
import type { IssuedCredential } from "@/lib/verify/assessment-contract";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Verify server-scored assessment — DURA",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Verify the signature over every displayed claim; never substitute local or registry data. */
export default async function IssuedCredentialPage({
  searchParams,
}: {
  searchParams: Promise<{ credential?: string }>;
}): Promise<React.ReactElement> {
  let credential: IssuedCredential | null = null;
  let error = "This credential could not be verified.";
  try {
    const params = await searchParams;
    if (typeof params.credential !== "string")
      throw new AssessmentRequestError("Open the complete credential link to verify it.", 400);
    credential = verifyIssuedCredential(params.credential);
  } catch (cause: unknown) {
    if (cause instanceof AssessmentRequestError) error = cause.message;
    else console.error("[assessment] Credential page failed", cause);
  }
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
        Server-scored assessment
      </h1>
      {credential ? (
        <article className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <p className="text-sm font-semibold text-[var(--color-celebration)]">
            DURA signature verified
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{credential.phaseTitle}</h2>
          <p className="mt-3 text-base">Self-reported name: {credential.selfReportedName}</p>
          <p className="mt-2 text-base">
            {credential.correctCount} of {credential.totalQuestions} answers correct ·{" "}
            {Math.round(credential.score * 100)}%
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Attempt started {new Date(credential.attemptStartedAt).toISOString()}. Passing
            threshold: 80%.
          </p>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            DURA&apos;s server checked these submitted answers against its question bank. This was
            an unproctored assessment with unlimited practice. The name and independent knowledge
            were not verified; this is not an accredited credential.
          </p>
          <p className="mt-4 font-mono text-sm break-all text-[var(--color-text-secondary)]">
            Record ID: {credential.id}
          </p>
        </article>
      ) : (
        <p role="alert" className="mt-6 text-base text-[var(--color-error)]">
          {error}
        </p>
      )}
      <Link
        href="/verify"
        className="mt-6 inline-flex min-h-12 items-center text-[var(--color-accent)] underline"
      >
        Your learning certificates
      </Link>
    </main>
  );
}
