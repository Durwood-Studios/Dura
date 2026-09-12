import type { NextRequest, NextResponse } from "next/server";
import { AssessmentRequestError, submitServerAssessment } from "@/lib/verify/assessment-server";
import {
  assessmentError,
  assessmentResponse,
  readAssessmentBody,
  readAssessmentSession,
} from "@/lib/verify/assessment-http";

export const runtime = "nodejs";

/** Compute the score on the server and issue immutable claims only for a passing submission. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = readAssessmentSession(request);
    if (!session)
      throw new AssessmentRequestError(
        "The assessment session is missing. Start a new assessment.",
        403
      );
    const body = await readAssessmentBody(request, 32768);
    return assessmentResponse(submitServerAssessment(body, session));
  } catch (error: unknown) {
    return assessmentError(error);
  }
}
