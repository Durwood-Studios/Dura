import { jsonResponse, optionsResponse } from "../_lib";

export const runtime = "edge";

export function GET(): Response {
  return jsonResponse({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: typeof process !== "undefined" ? (process.uptime?.() ?? null) : null,
  });
}

export function OPTIONS(): Response {
  return optionsResponse();
}
