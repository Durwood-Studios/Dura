import { handleAuthAction } from "@/lib/auth/actions";
import type { NextResponse } from "next/server";

/** Email signup requires the Dura age self-attestation and request budget. */
export function POST(request: Request): Promise<NextResponse> {
  return handleAuthAction("sign-up", request);
}
