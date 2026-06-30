"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Camera, Check, AlertCircle, LogIn, Link2, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

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
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setUserId(user.id);
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

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = e.target.files?.[0];
      if (!file || !draft || !userId) return;

      // Reset input so selecting the same file again triggers onChange
      e.target.value = "";

      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMsg("Only JPEG, PNG, WebP, and GIF images are supported.");
        setStatus("error");
        return;
      }
      if (file.size > MAX_BYTES) {
        setErrorMsg("Image must be under 2 MB.");
        setStatus("error");
        return;
      }

      // Optimistic preview so the user sees feedback immediately
      const previewUrl = URL.createObjectURL(file);
      setDraft((d) => d && { ...d, avatarUrl: previewUrl });
      setIsUploading(true);
      setStatus("idle");
      setErrorMsg("");

      try {
        const ext = file.type.split("/")[1] ?? "png";
        const path = `${userId}/avatar.${ext}`;
        const supabase = createClient();

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        // Bust the CDN cache with a timestamp so the browser doesn't serve a stale image
        const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        URL.revokeObjectURL(previewUrl);
        setDraft((d) => d && { ...d, avatarUrl: publicUrl });
      } catch (err) {
        URL.revokeObjectURL(previewUrl);
        // Roll back to previous avatar on failure
        setDraft((d) => d && { ...d, avatarUrl: profile?.avatarUrl ?? "" });
        const msg = err instanceof Error ? err.message : "Upload failed";
        setErrorMsg(msg);
        setStatus("error");
      } finally {
        setIsUploading(false);
      }
    },
    [draft, userId, profile]
  );

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
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              aria-label="Upload avatar image"
              onChange={(e) => void handleFileSelect(e)}
            />

            {/* Clickable avatar circle */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Click to upload a new avatar"
              className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-emerald-500/10 transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait"
            >
              {draft.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Initials name={draft.displayName} email={profile.email} />
              )}

              {/* Hover / uploading overlay */}
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition",
                  isUploading ? "bg-black/50" : "group-hover:bg-black/40"
                )}
              >
                {isUploading ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Camera className="h-5 w-5 text-transparent transition group-hover:text-white" />
                )}
              </span>

              {/* Camera badge — bottom-right corner on hover */}
              {!isUploading && (
                <span className="absolute right-0 bottom-0 flex h-7 w-7 translate-x-1 translate-y-1 items-center justify-center rounded-full bg-[var(--color-accent)] opacity-0 shadow transition group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100">
                  <Camera className="h-3.5 w-3.5 text-white" />
                </span>
              )}
            </button>

            {/* Secondary controls */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setShowUrlInput((v) => !v)}
                className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition hover:text-[var(--color-text-secondary)]"
              >
                <Link2 className="h-3 w-3" />
                {showUrlInput ? "Hide URL input" : "Paste URL instead"}
              </button>

              {draft.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setDraft((d) => d && { ...d, avatarUrl: "" })}
                  className="flex items-center gap-1 text-xs text-rose-500 transition hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                  Clear avatar
                </button>
              )}
            </div>

            {/* Collapsible URL input */}
            {showUrlInput && (
              <div className="w-full min-w-[14rem]">
                <input
                  type="url"
                  value={draft.avatarUrl}
                  onChange={(e) => setDraft((d) => d && { ...d, avatarUrl: e.target.value })}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
                />
              </div>
            )}
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
