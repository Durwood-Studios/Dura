import { optionsResponse } from "../_lib";

export const runtime = "edge";

// wttr.in sniffs the User-Agent: curl-like agents get a compact text line
// ("+86°F Sunny"), browsers get a full styled HTML page. A browser fetch()
// cannot override User-Agent (it's a forbidden header), so the only reliable
// way to get the text form is to request it server-side with a curl UA.
// Fetching browser-side dumped the entire HTML document into the footer.
const WTTR_URL = "https://wttr.in/Aiken,SC?format=%t+%C";
const WTTR_HEADERS = { "User-Agent": "curl/8.4.0" } as const;
const CORS = { "Access-Control-Allow-Origin": "*" } as const;

export async function GET(): Promise<Response> {
  try {
    const res = await fetch(WTTR_URL, {
      headers: WTTR_HEADERS,
      signal: AbortSignal.timeout(5000),
      // Let Vercel's edge cache absorb traffic; wttr.in is rate-limited.
      next: { revalidate: 1800 },
    });
    if (!res.ok) return new Response("", { status: 502, headers: CORS });

    const text = (await res.text()).trim();
    // Guard against wttr.in serving HTML anyway (UA changes, error pages).
    if (!text || text.length > 60 || text.includes("<") || text.includes("Unknown")) {
      return new Response("", { status: 502, headers: CORS });
    }

    return new Response(text.replace(/^\+/, ""), {
      status: 200,
      headers: {
        ...CORS,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("weather proxy failed", error);
    return new Response("", { status: 502, headers: CORS });
  }
}

export function OPTIONS(): Response {
  return optionsResponse();
}
