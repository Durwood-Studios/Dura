import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handle the OAuth callback from Supabase.
 * Exchanges the authorization code for a session, then redirects
 * to the requested destination (defaults to /dashboard).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[auth/callback] Code exchange failed:", error.message);
        return NextResponse.redirect(
          new URL(`/auth/sign-in?error=${encodeURIComponent(error.message)}`, origin)
        );
      }
    } catch (err) {
      console.error("[auth/callback] Unexpected error:", err);
      return NextResponse.redirect(new URL("/auth/sign-in?error=callback_failed", origin));
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
