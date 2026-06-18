"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Camera, Check, AlertCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ProfileData {
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}

/** Initials avatar — shown when no avatar URL is set */
function Initials({ name, email }: { name: string; email: string }): React.ReactElement {
  const text = name.trim() || email;
  const initials = text
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">{initials}</span>
  );
}

export function ProfileClient(): React.ReactElement {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState<Omit<ProfileData, "email"> | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setIsGuest(true);
          return;
        }
        const meta = user.user_metadata ?? {};
        const data: ProfileData = {
          email: user.email ?? "",
          displayName: (meta.full_name as string | undefined) ?? "",
          bio: (meta.bio as string | undefined) ?? "",
          avatarUrl: (meta.avatar_url as string | undefined) ?? "",
        };
        setProfile(data);
        setDraft({ displayName: data.displayName, bio: data.bio, avatarUrl: data.avatarUrl });
      } catch {
        setIsGuest(true);
      }
    }
    void load();
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!draft || !profile) return;
    setStatus("saving");
    setErrorMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: draft.displayName.trim(),
          bio: draft.bio.trim(),
          avatar_url: draft.avatarUrl.trim(),
        },
      });
      if (error) throw error;
      setProfile((p) => (p ? { ...p, ...draft } : p));
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setErrorMsg(msg);
      setStatus("error");
    }
  }, [draft, profile]);

  if (isGuest) {
    return (
      <div className="dura-card flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)]">
          <LogIn className="h-7 w-7 text-[var(--color-text-muted)]" />
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">
            Sign in to edit your profile
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Your learning progress is always local. Signing in lets you sync across devices and set
            your public profile.
          </p>
        </div>
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!profile || !draft) {
    return (
      <div className="dura-card flex animate-pulse flex-col gap-4 p-6">
        <div className="h-20 w-20 rounded-full bg-[var(--color-bg-subtle)]" />
        <div className="h-4 w-40 rounded bg-[var(--color-bg-subtle)]" />
        <div className="h-4 w-64 rounded bg-[var(--color-bg-subtle)]" />
      </div>
    );
  }

  const isDirty =
    draft.displayName !== profile.displayName ||
    draft.bio !== profile.bio ||
    draft.avatarUrl !== profile.avatarUrl;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Avatar + identity ─────────────────────────────────────────── */}
      <div className="dura-card p-6">
        <h2 className="mb-5 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          Identity
        </h2>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-emerald-500/10">
              {draft.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Initials name={draft.displayName} email={profile.email} />
              )}
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 transition hover:bg-black/30 hover:opacity-100">
                <Camera className="h-5 w-5 text-transparent transition group-hover:text-white" />
              </div>
            </div>
            <p className="text-center text-xs text-[var(--color-text-muted)]">
              {draft.avatarUrl ? "Avatar from account" : "Using initials"}
            </p>
          </div>

          {/* Fields */}
          <div className="flex flex-1 flex-col gap-4">
            <Field label="Display name" hint="How you appear across DURA">
              <input
                type="text"
                value={draft.displayName}
                onChange={(e) => setDraft((d) => d && { ...d, displayName: e.target.value })}
                placeholder="Your name"
                maxLength={80}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
              />
            </Field>

            <Field label="Email" hint="Managed by your authentication provider">
              <input
                type="email"
                value={profile.email}
                disabled
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] opacity-70"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Bio ────────────────────────────────────────────────────────── */}
      <div className="dura-card p-6">
        <h2 className="mb-5 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          About
        </h2>
        <Field
          label="Bio"
          hint="A short note about yourself — shown on certificates and verify pages"
        >
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft((d) => d && { ...d, bio: e.target.value })}
            placeholder="Software engineer, lifelong learner…"
            maxLength={280}
            rows={3}
            className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-[var(--color-text-muted)]">
            {draft.bio.length}/280
          </p>
        </Field>
      </div>

      {/* ── Avatar URL ─────────────────────────────────────────────────── */}
      <div className="dura-card p-6">
        <h2 className="mb-5 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          Avatar
        </h2>
        <Field
          label="Avatar URL"
          hint="Paste a direct image URL. Leave blank to use your initials."
        >
          <div className="flex gap-2">
            <input
              type="url"
              value={draft.avatarUrl}
              onChange={(e) => setDraft((d) => d && { ...d, avatarUrl: e.target.value })}
              placeholder="https://…"
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
            />
            {draft.avatarUrl && (
              <button
                type="button"
                onClick={() => setDraft((d) => d && { ...d, avatarUrl: "" })}
                className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-xs text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)]"
              >
                Clear
              </button>
            )}
          </div>
        </Field>
      </div>

      {/* ── Save bar ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "sticky bottom-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]/95 px-5 py-3.5 shadow-xl backdrop-blur-md transition-all duration-300",
          isDirty || status !== "idle" ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {status === "error" ? (
          <div className="flex items-center gap-2 text-sm text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        ) : status === "saved" ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            Profile saved
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">You have unsaved changes</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setDraft({
                displayName: profile.displayName,
                bio: profile.bio,
                avatarUrl: profile.avatarUrl,
              })
            }
            disabled={!isDirty || status === "saving"}
            className="rounded-xl px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!isDirty || status === "saving"}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {status === "saving" ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {hint && (
          <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}
