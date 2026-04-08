"use client";

import { useState } from "react";
import { Share2, Check, Copy, Mail, ExternalLink } from "lucide-react";
import {
  buildShareUrl,
  canNativeShare,
  copyToClipboard,
  nativeShare,
  type ShareOptions,
} from "@/lib/share";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ShareButtonProps extends ShareOptions {
  className?: string;
}

export function ShareButton({ className, ...options }: ShareButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleNative = async () => {
    const ok = await nativeShare(options);
    if (ok) void track("share_clicked", { method: "native" });
    else setOpen(true);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(options.url);
    if (ok) {
      setCopied(true);
      void track("share_clicked", { method: "copy" });
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const onLink = (method: "x" | "linkedin" | "email") => () => {
    void track("share_clicked", { method });
    setOpen(false);
  };

  if (canNativeShare()) {
    return (
      <button
        type="button"
        onClick={() => void handleNative()}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]",
          className
        )}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </button>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 flex w-44 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-1 shadow-lg"
        >
          <a
            href={buildShareUrl("x", options)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLink("x")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
          >
            <ExternalLink className="h-4 w-4" aria-hidden /> X
          </a>
          <a
            href={buildShareUrl("linkedin", options)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLink("linkedin")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
          >
            <ExternalLink className="h-4 w-4" aria-hidden /> LinkedIn
          </a>
          <a
            href={buildShareUrl("email", options)}
            onClick={onLink("email")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
          >
            <Mail className="h-4 w-4" aria-hidden /> Email
          </a>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" aria-hidden /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden /> Copy link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
