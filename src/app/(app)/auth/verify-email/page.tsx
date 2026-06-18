import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify your email — DURA",
};

export default function VerifyEmailPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
          <Mail className="h-6 w-6 text-[var(--color-accent)]" />
        </div>

        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Check your email</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          We sent a confirmation link to your email address. Click it to activate your account and
          start learning.
        </p>
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          Didn&apos;t get it? Check your spam folder or{" "}
          <Link
            href="/auth/sign-up"
            className="text-[var(--color-accent)] underline underline-offset-2 hover:opacity-80"
          >
            try signing up again
          </Link>
          .
        </p>

        <div className="mt-6">
          <Link
            href="/auth/sign-in"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
