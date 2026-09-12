import { NextResponse, type NextRequest } from "next/server";
import { AssessmentRequestError, ASSESSMENT_SESSION_COOKIE } from "@/lib/verify/assessment-server";

/** Bound request bodies before JSON parsing, including chunked requests without Content-Length. */
export async function readAssessmentBody(request: NextRequest, maxBytes: number): Promise<unknown> {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      throw new AssessmentRequestError("Please submit from this DURA site.", 403);
    if (Number(request.headers.get("content-length")) > maxBytes)
      throw new AssessmentRequestError("The request is too large.", 413);
    const reader = request.body?.getReader();
    if (!reader) throw new AssessmentRequestError("A JSON request body is required.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.length;
        if (size > maxBytes) {
          await reader.cancel();
          throw new AssessmentRequestError("The request is too large.", 413);
        }
        chunks.push(next.value);
      }
    } finally {
      reader.releaseLock();
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
    } catch {
      throw new AssessmentRequestError("The request must contain valid JSON.", 400);
    }
  } catch (error: unknown) {
    if (error instanceof AssessmentRequestError) throw error;
    console.error("[assessment] Request read failed", error);
    throw new AssessmentRequestError("The request could not be read.", 400);
  }
}

/** Read the opaque HttpOnly browser binding without accepting request-body identity claims. */
export function readAssessmentSession(request: NextRequest): string | null {
  const session = request.cookies.get(ASSESSMENT_SESSION_COOKIE)?.value;
  return session && /^[a-f0-9]{64}$/.test(session) ? session : null;
}

/** Return a non-cacheable public result; tokens must not enter shared caches. */
export function assessmentResponse(body: unknown, status: number = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}

/** Map expected input errors to useful statuses while keeping internal details private. */
export function assessmentError(error: unknown): NextResponse {
  if (error instanceof AssessmentRequestError)
    return assessmentResponse({ error: error.message }, error.status);
  console.error("[assessment] Server assessment failed", error);
  return assessmentResponse(
    { error: "The assessment could not be processed. Please try again." },
    500
  );
}
