import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase auth session on every matched request.
 * Must be called from Next middleware so cookies can be written
 * back onto the outgoing response.
 *
 * Supabase is optional in DURA — the app must work fully without it
 * (CLAUDE.md Rule 3). When the env vars are missing (fresh clone with
 * no `.env.local`, or self-hosters who don't want auth), pass the
 * request through untouched rather than crashing the middleware.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touching getUser() forces a token refresh if needed.
  await supabase.auth.getUser();

  return response;
}
