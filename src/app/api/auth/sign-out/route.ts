import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Server-side sign-out endpoint.
 *
 * Client-side signOut() clears local session state but cannot revoke the
 * server-side refresh token. This route verifies the session exists, calls
 * Supabase server-side to sign out (which invalidates the refresh token and
 * clears the httpOnly session cookie), then redirects to sign-in.
 *
 * Used by the sidebar sign-out button. Using a POST prevents CSRF-triggered
 * sign-outs via img/link tags (GET endpoints can be triggered cross-origin).
 */
export async function POST(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Verify a session exists before attempting sign-out
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // scope: "global" revokes all refresh tokens for this user (all devices).
      // scope: "local" revokes only the current session token.
      // "local" is the safer default — doesn't kick out the user's other devices.
      await supabase.auth.signOut({ scope: "local" });
    }
  } catch (error) {
    console.error("[api/auth/sign-out] Sign-out error:", error);
    // Still redirect to sign-in even on error — client state will be stale
  }

  return NextResponse.redirect(
    new URL("/auth/sign-in", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    {
      status: 303, // 303 See Other — correct for POST → GET redirect
    }
  );
}
