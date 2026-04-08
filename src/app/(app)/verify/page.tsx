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
        Hardened assessments. Verifiable certificates. Stored locally on your device.
      </p>
      <CertificateList />
    </main>
  );
}
