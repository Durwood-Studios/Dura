import { NextResponse } from "next/server";

export const API_VERSION = "v1";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function jsonResponse<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(
    { ok: true, version: API_VERSION, data },
    {
      ...init,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        ...init?.headers,
      },
    }
  );
}

export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { ok: false, version: API_VERSION, error: message },
    { status, headers: CORS_HEADERS }
  );
}

export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
