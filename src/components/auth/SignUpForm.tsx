"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import AgeGate from "@/components/auth/AgeGate";
import type { Provider } from "@supabase/supabase-js";

/**
 * Client-side sign-up form. Shows AgeGate first, then email/password form
 * after age verification passes.
 */
export default function SignUpForm(): React.ReactElement {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check sessionStorage for prior age verification in this session
  useState(() => {
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem("dura-age-verified") === "true") {
        setIsAgeVerified(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  });

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (authError) {
        // Generic message prevents email enumeration (OWASP A07)
        setError("Account creation failed. Please try a different email or contact support.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Account creation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(provider: Provider): Promise<void> {
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (authError) {
        setError("OAuth sign in failed. Please try again.");
      }
    } catch {
      setError("OAuth sign in failed. Please try again.");
    }
  }

  // Step 1: Age verification
  if (!isAgeVerified) {
    return <AgeGate onVerified={() => setIsAgeVerified(true)} />;
  }

  // Success state — email confirmation sent
  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center shadow-sm backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <svg
            className="h-6 w-6 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Check your email</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          We sent a confirmation link to{" "}
          <strong className="text-[var(--color-text-primary)]">{email}</strong>. Click the link to
          activate your account.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text-secondary)]"
        >
          Continue without account
        </Link>
      </div>
    );
  }

  // Step 2: Sign-up form
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Create your account</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Sync your progress across devices. Always free.
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleOAuth("github")}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface-hover)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          Continue with GitHub
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--color-bg-surface)] px-3 text-[var(--color-text-muted)]">
            or sign up with email
          </span>
        </div>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="sign-up-email"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            Email
          </label>
          <input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="sign-up-password"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            Password
          </label>
          <input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-accent-rose)]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <p className="text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Legal links */}
      <p className="mt-6 text-center text-xs leading-relaxed text-[var(--color-text-muted)]">
        By creating an account you agree to our{" "}
        <Link
          href="/legal/terms"
          className="underline underline-offset-2 hover:text-[var(--color-text-secondary)]"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy"
          className="underline underline-offset-2 hover:text-[var(--color-text-secondary)]"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
