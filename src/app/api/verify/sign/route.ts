import { NextResponse } from "next/server";
import { isSigningConfigured, signHash } from "@/lib/verify/hmac";

/**
 * POST /api/verify/sign — issue an HMAC signature for a certificate
 * verification hash.
 *
 * Body: { hash: string }     // 32–64 hex chars
 * 200:  { signature: string } // 64 hex chars (HMAC-SHA-256)
 * 400:  invalid hash format
 * 503:  signing is not provisioned on this deployment
 *
 * The secret never leaves the server. The client gets back only the
 * derived signature, which it persists with the cert + uses to build
 * the shareable URL.
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

  if (!body || typeof body !== "object" || !("hash" in body)) {
    return NextResponse.json({ error: "missing-hash" }, { status: 400 });
  }
  const hash = (body as { hash: unknown }).hash;
  if (typeof hash !== "string") {
    return NextResponse.json({ error: "invalid-hash" }, { status: 400 });
  }

  const signature = signHash(hash);
  if (!signature) {
    return NextResponse.json({ error: "invalid-hash" }, { status: 400 });
  }

  return NextResponse.json({ signature });
}
