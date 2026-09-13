import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";

type AuthAction = "sign-in" | "sign-up" | "forgot-password";
const email = z.string().trim().email().max(254);
const schemas = {
  "sign-in": z.object({ email, password: z.string().min(1).max(1024) }).strict(),
  "sign-up": z
    .object({ email, password: z.string().min(8).max(1024), ageAttested: z.literal(true) })
    .strict(),
  "forgot-password": z.object({ email }).strict(),
};

function response(body: object, status: number = 200, retryAfter?: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
    },
  });
}

async function boundedBody(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json")
    throw new Error("JSON required");
  if (Number(request.headers.get("content-length")) > 8192) throw new Error("Body too large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(next.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } finally {
    reader.releaseLock();
  }
}

/** Browser auth attempts pass the distributed budget before calling Supabase. */
export async function handleAuthAction(
  action: AuthAction,
  request: Request
): Promise<NextResponse> {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return response({ error: "Submit this form from Dura." }, 403);
  const budget =
    action === "sign-in" ? { limit: 5, windowMs: 900_000 } : { limit: 3, windowMs: 3_600_000 };
  const limited = await rateLimit(`${action}:${getClientIp(request)}`, budget);
  if (!limited.success)
    return response(
      {
        error:
          limited.reason === "unavailable"
            ? "Account services are temporarily unavailable. Your local learning is still available."
            : "Too many attempts. Please wait before trying again.",
      },
      limited.reason === "unavailable" ? 503 : 429,
      limited.retryAfter
    );
  let body: unknown;
  try {
    body = await boundedBody(request);
  } catch {
    return response({ error: "A valid, small JSON request is required." }, 400);
  }
  const parsed = schemas[action].safeParse(body);
  if (!parsed.success)
    return response({ error: "Check the form fields and age confirmation, then try again." }, 400);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return response(
      { error: "Account services are not configured. You can continue learning locally." },
      503
    );
  try {
    const client = await createClient();
    if (
      action === "sign-in" &&
      "password" in parsed.data &&
      typeof parsed.data.password === "string"
    ) {
      const { error } = await client.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      return error
        ? response({ error: "Invalid email or password. Please try again." }, 401)
        : response({ ok: true });
    }
    if (
      action === "sign-up" &&
      "password" in parsed.data &&
      typeof parsed.data.password === "string"
    ) {
      const { error } = await client.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
          data: { dura_age_attested: true },
        },
      });
      return error
        ? response({ error: "Account creation could not be completed. Please try again." }, 400)
        : response({ ok: true });
    }
    const { error } = await client.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`,
    });
    // Provider account-existence results stay generic; genuine service outages remain visible.
    if (error && (error.status === undefined || error.status >= 500 || error.status === 429))
      return response(
        { error: "Reset email could not be requested right now. Please try again later." },
        503
      );
    return response({ ok: true });
  } catch {
    return response(
      { error: "Account services are temporarily unavailable. Please try again later." },
      503
    );
  }
}
