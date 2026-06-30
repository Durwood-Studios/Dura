"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

/**
 * Sends a Supabase password-reset email. Always shows the same success
 * message regardless of whether the address is registered — prevents
 * email enumeration (OWASP A07).
 */
export default function ForgotPasswordForm(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      // Route through the existing callback handler which exchanges the
      // PKCE code for a session, then forwards to the reset-password page.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`,
      });
    } catch {
      // Intentionally swallowed — success state shown regardless to
      // prevent leaking whether the address is registered.
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <svg
            className="h-6 w-6 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Check your email</h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          If an account exists for{" "}
          <strong className="text-[var(--color-text-primary)]">{email}</strong>, you&apos;ll receive
          a reset link shortly. Check your spam folder if it doesn&apos;t arrive.
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-2 inline-block text-sm text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Reset your password</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="reset-email"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        <Link
          href="/auth/sign-in"
          className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
