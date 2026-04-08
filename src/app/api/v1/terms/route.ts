import { searchTerms } from "@/lib/dictionary";
import { errorResponse, jsonResponse, optionsResponse } from "../_lib";
import type { NextRequest } from "next/server";

const MAX_LIMIT = 200;

export function GET(request: NextRequest): Response {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const phaseId = searchParams.get("phase") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(MAX_LIMIT, Math.max(1, Number(limitRaw))) : 50;

  if (limitRaw && Number.isNaN(Number(limitRaw))) {
    return errorResponse("limit must be a number", 400);
  }

  const results = searchTerms({ query, phaseId, category, limit });
  return jsonResponse({
    count: results.length,
    query: query ?? null,
    filters: { phaseId: phaseId ?? null, category: category ?? null },
    terms: results.map((t) => ({
      slug: t.slug,
      term: t.term,
      category: t.category,
      phaseIds: t.phaseIds,
      definition: t.definitions.intermediate,
    })),
  });
}

export function OPTIONS(): Response {
  return optionsResponse();
}
