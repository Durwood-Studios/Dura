import { getTerm } from "@/lib/dictionary";
import { errorResponse, jsonResponse, optionsResponse } from "../../_lib";

type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, { params }: { params: Params }): Promise<Response> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) {
    return errorResponse(`term "${slug}" not found`, 404);
  }
  return jsonResponse(term);
}

export function OPTIONS(): Response {
  return optionsResponse();
}
