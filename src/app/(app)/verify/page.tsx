import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verify — DURA" };

export default function VerifyPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Skills Verification</h1>
      <p className="mt-2 text-neutral-600">Hardened assessments. Verifiable certificates.</p>
    </main>
  );
}
