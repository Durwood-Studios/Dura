import { handleAuthAction } from "@/lib/auth/actions";
import type { NextResponse } from "next/server";

/** Password-reset email request with a generic account-existence response. */
export function POST(request: Request): Promise<NextResponse> {
  return handleAuthAction("forgot-password", request);
}
