import {
  createBrowserClient,
  parseCookieHeader,
  serializeCookieHeader,
  type CookieOptions,
} from "@supabase/ssr";
import { assertCurrentStorageGeneration } from "@/lib/storage/reset-coordination";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Whether optional cloud sync is configured for this build. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

interface AuthCookieWrite {
  name: string;
  value: string;
  options: CookieOptions;
}

/** Stable session namespace shared with Supabase SSR's default project naming. */
export function getSessionCookieName(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Cloud sync is not configured");
  return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
}

/** Prevent stale refresh responses in another tab from restoring a cleared session. */
export function writeAuthCookies(cookies: AuthCookieWrite[]): void {
  for (const cookie of cookies) {
    if (cookie.value) assertCurrentStorageGeneration();
    document.cookie = serializeCookieHeader(cookie.name, cookie.value, cookie.options);
  }
}

/** Remove this device's session without requiring network token revocation. */
export async function clearLocalSession(): Promise<void> {
  try {
    await createClient().auth.stopAutoRefresh();
  } catch (error) {
    console.error("[auth] Could not stop session refresh", error);
  }
  const prefix = getSessionCookieName();
  for (const { name } of parseCookieHeader(document.cookie)) {
    if (name === prefix || name.startsWith(`${prefix}.`) || name === `${prefix}-code-verifier`) {
      document.cookie = serializeCookieHeader(name, "", { path: "/", maxAge: 0, sameSite: "lax" });
    }
  }
}

/**
 * Browser-side Supabase client. Safe to call from Client Components.
 * Reads the public URL + anon key from environment — both are designed
 * to be exposed to the browser. Data access is protected by RLS.
 */
export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: getSessionCookieName() },
      cookies: {
        getAll: (): { name: string; value: string }[] =>
          parseCookieHeader(document.cookie).map((cookie): { name: string; value: string } => ({
            name: cookie.name,
            value: cookie.value ?? "",
          })),
        setAll: writeAuthCookies,
      },
    }
  );
}
