import { handleAuthAction } from "@/lib/auth/actions";
import type { NextResponse } from "next/server";

/** Password sign-in with an atomic distributed request budget. */
export function POST(request: Request): Promise<NextResponse> {
  return handleAuthAction("sign-in", request);
}
