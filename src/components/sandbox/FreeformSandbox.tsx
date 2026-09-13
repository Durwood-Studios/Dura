"use client";

import { ExternalSandboxConsent } from "@/components/sandbox/ExternalSandboxConsent";
import dynamic from "next/dynamic";
import { FreeformSandboxSkeleton } from "@/components/sandbox/FreeformSandboxSkeleton";

const FreeformSandboxInner = dynamic(() => import("@/components/sandbox/FreeformSandboxInner"), {
  ssr: false,
  loading: () => <FreeformSandboxSkeleton />,
});

export function FreeformSandbox(): React.ReactElement {
  return (
    <ExternalSandboxConsent>
      <FreeformSandboxInner />
    </ExternalSandboxConsent>
  );
}
