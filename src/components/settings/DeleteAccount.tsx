"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteOwnAccount } from "@/lib/account/deletion";

/** Explicit, recent-authenticated account deletion, with honest partial-failure reporting. */
export function DeleteAccount(): React.ReactElement {
  const { user } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(): Promise<void> {
    if (!user || confirmation !== "DELETE") return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteOwnAccount(user.id);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Discard deleted account state from every mounted store.
      window.location.href = "/";
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Deletion did not finish. Reload to retry."
      );
      setIsDeleting(false);
    }
  }

  if (!user)
    return (
      <p className="text-sm">
        Account deletion requires{" "}
        <Link className="underline" href="/auth/sign-in">
          signing in
        </Link>
        . Clear local data removes device-only records.
      </p>
    );
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="min-h-12 rounded-lg border border-[var(--color-border)] px-4 text-sm"
        onClick={() => setIsConfirming(true)}
      >
        Delete account
      </button>
      {isConfirming && (
        <div className="space-y-3 rounded-lg border border-[var(--color-border)] p-4">
          <h3 className="font-semibold">Permanently delete {user.email ?? "this account"}?</h3>
          <p className="text-sm">
            This removes your profile, synced learning records, public certificate listings and
            uploaded files. Export your progress first. Guest records on this device remain.
            Anonymous feedback, downloaded files, and copies on other devices are not removed.
          </p>
          <p className="text-sm">
            Sign in again using your usual sign-in method, then return here within five minutes. A
            refreshed session is insufficient. Uploaded files are removed first; if a later step
            fails, those files cannot be recovered.
          </p>
          <label className="block text-sm">
            Type DELETE to confirm
            <input
              className="mt-1 block min-h-12 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              disabled={isDeleting}
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isDeleting || confirmation !== "DELETE"}
              onClick={() => void remove()}
              className="min-h-12 rounded-lg border border-[var(--color-error)] px-4 text-sm disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Permanently delete account"}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsConfirming(false)}
              className="min-h-12 px-4 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
