import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Public paths that do not require authentication.
 * Everything else is protected — unauthenticated requests are redirected
 * to /auth/sign-in at the middleware layer (before any page renders).
 */
const PUBLIC_PREFIXES = [
  "/auth", // sign-in, sign-up, OAuth callback
  "/about",
  "/diagnostic-demo",
  "/discover",
  "/how-it-works",
  "/install",
  "/open-source",
  "/prescription-demo",
  "/privacy",
  "/standards-watch",
  "/standards",
  "/terms",
  "/offline", // PWA offline fallback
  "/api",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Refresh the Supabase auth session and enforce the auth gate in one
 * round-trip. Industry-standard middleware approach: runs at the edge
 * before any page HTML is sent, so unauthenticated users are redirected
 * immediately without seeing a flash of protected content.
 *
 * Supabase is optional in DURA (CLAUDE.md Rule 3). When env vars are
 * absent the request passes through untouched — self-hosters without
 * Supabase get full access.
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

  // getUser() refreshes the token if needed AND gives us the session state —
  // one network call does both jobs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth gate: redirect unauthenticated users to sign-in for protected paths.
  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    // Preserve the intended destination so sign-in can redirect back.
    signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Email confirmation gate: if Supabase email confirmation is enabled,
  // require the user to verify their email before accessing protected routes.
  // OAuth users (GitHub, Google, Apple) have email confirmed automatically.
  if (
    user &&
    !isPublicPath(request.nextUrl.pathname) &&
    // email_confirmed_at is null/undefined for unconfirmed email accounts
    user.email_confirmed_at === null &&
    // Only enforce for email/password users (identities[0].provider === "email")
    user.identities?.some((id) => id.provider === "email") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    return NextResponse.redirect(new URL("/auth/verify-email", request.url));
  }

  return response;
}
