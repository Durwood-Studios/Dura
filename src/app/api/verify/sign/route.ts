import { NextResponse } from "next/server";

/**
 * Public client hashes are not evidence of an earned assessment. Issuance stays
 * unavailable until a trusted server-side assessment authority can authorize it.
 * Historical hash receipts remain checkable through /api/verify/check.
 */
export function POST(): NextResponse {
  return NextResponse.json(
    {
      error: "trusted-issuance-unavailable",
      message:
        "Certificate signing requires trusted assessment issuance, which is not available. Local learning certificates remain available.",
    },
    { status: 503 }
  );
}
