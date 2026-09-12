import type { NextRequest, NextResponse } from "next/server";
import {
  ASSESSMENT_SESSION_COOKIE,
  createAssessmentSession,
  startServerAssessment,
} from "@/lib/verify/assessment-server";
import {
  assessmentError,
  assessmentResponse,
  readAssessmentBody,
  readAssessmentSession,
} from "@/lib/verify/assessment-http";

export const runtime = "nodejs";

/** Issue a cookie-bound question challenge; public clients cannot choose scores or questions. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await readAssessmentBody(request, 1024);
    const session = readAssessmentSession(request) ?? createAssessmentSession();
    const result = startServerAssessment(body, session);
    const response = assessmentResponse(result);
    response.cookies.set(ASSESSMENT_SESSION_COOKIE, session, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "strict",
      path: "/api/verify/assessment",
      maxAge: 7200,
    });
    return response;
  } catch (error: unknown) {
    return assessmentError(error);
  }
}
