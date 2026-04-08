import type { Metadata } from "next";
import { CertificateLookup } from "@/components/verify/CertificateLookup";

type Params = Promise<{ hash: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hash } = await params;
  return {
    title: "Verified Certificate — DURA",
    description: "Engineering education verified through hardened skills testing.",
    openGraph: {
      title: "DURA Verification",
      description: "This learner demonstrated mastery through DURA's verification system.",
      url: `/verify/${hash}`,
    },
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { hash } = await params;
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <CertificateLookup hash={hash} />
    </main>
  );
}
