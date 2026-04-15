import { z } from "zod";
import { searchTerms } from "@/lib/dictionary";
import { DICTIONARY } from "@/content/dictionary";
import { errorResponse, jsonResponse, optionsResponse } from "../_lib";
import type { NextRequest } from "next/server";

const querySchema = z.object({
  q: z.string().max(200).optional(),
  phase: z.string().regex(/^\d$/).optional(),
  category: z.string().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export function GET(request: NextRequest): Response {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    phase: searchParams.get("phase") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400);
  }

  const { q: query, phase: phaseId, category, limit } = parsed.data;
  const results = searchTerms({ query, phaseId, category, limit });

  return jsonResponse({
    count: results.length,
    total: DICTIONARY.length,
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
