import { NextResponse } from "next/server";
import { isSigningConfigured, verifyHash } from "@/lib/verify/hmac";

/**
 * POST /api/verify/check — verify an HMAC signature against the hash.
 *
 * Body: { hash: string, signature: string }
 * 200:  { valid: boolean }
 * 400:  invalid format
 * 503:  signing is not provisioned on this deployment
 *
 * Public endpoint — anyone with a shared URL can call it. Constant-time
 * comparison happens inside verifyHash() so the response timing does not
 * leak signature bytes.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isSigningConfigured()) {
    return NextResponse.json({ error: "signing-not-configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("hash" in body) || !("signature" in body)) {
    return NextResponse.json({ error: "missing-fields" }, { status: 400 });
  }

  const { hash, signature } = body as { hash: unknown; signature: unknown };
  if (typeof hash !== "string" || typeof signature !== "string") {
    return NextResponse.json({ error: "invalid-fields" }, { status: 400 });
  }

  return NextResponse.json({ valid: verifyHash(hash, signature) });
}
