"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/**
 * Allows a user with an active recovery session (arrived via the
 * password-reset email link) to set a new password.
 */
export default function ResetPasswordForm(): React.ReactElement {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Sign out all other sessions so the new password takes effect everywhere
      await supabase.auth.signOut({ scope: "others" });

      router.push("/dashboard?notice=password_updated");
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Set new password</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Choose a strong password for your DURA account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Minimum 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Repeat your new password"
          />
        </div>

        {/* Live match indicator */}
        {confirm.length > 0 && (
          <p
            className={`text-xs font-medium ${password === confirm ? "text-emerald-400" : "text-[var(--color-accent-rose)]"}`}
          >
            {password === confirm ? "✓ Passwords match" : "Passwords don't match yet"}
          </p>
        )}

        {error && (
          <p className="text-sm text-[var(--color-accent-rose)]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || password !== confirm || password.length < 8}
          className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
