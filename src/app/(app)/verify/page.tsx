import Link from "next/link";
import type { Metadata } from "next";
import { CertificateList } from "@/components/verify/CertificateList";

export const metadata: Metadata = {
  title: "Verification — DURA",
  description: "Your earned certificates and verification history.",
};

export default function VerifyPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-3xl font-semibold">Skills Verification</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Local learning certificates and optional server-scored assessment results.
      </p>
      <Link
        href="/verify/assessment"
        className="mb-6 inline-flex min-h-12 items-center rounded-lg bg-[var(--color-accent)] px-5 py-3 font-semibold text-white"
      >
        Take a server-scored assessment
      </Link>
      <CertificateList />
    </main>
  );
}
