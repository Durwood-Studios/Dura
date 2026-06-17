"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface InstallButtonProps {
  /** Classes for the rendered control (button or link share the same shell). */
  className?: string;
  /** Visible label. Defaults to "Install". */
  label?: string;
  /** Hide the download glyph (e.g. in dense text navs). */
  hideIcon?: boolean;
  /** Called after the native dialog resolves (analytics / UI dismissal). */
  onResult?: (outcome: "accepted" | "dismissed" | "unavailable") => void;
}

/**
 * One-press PWA install.
 *
 * - Chromium (Chrome/Edge/Android): a single click opens the native install
 *   dialog via the captured `beforeinstallprompt` event.
 * - iOS Safari / Firefox (no install API): one click routes to `/install`,
 *   which shows the platform's Add-to-Home-Screen steps.
 * - Already installed (standalone): renders nothing.
 */
export function InstallButton({
  className,
  label = "Install",
  hideIcon = false,
  onResult,
}: InstallButtonProps): React.ReactElement | null {
  const { canInstall, isStandalone, promptInstall } = useInstallPrompt();

  if (isStandalone) return null;

  const icon = hideIcon ? null : <Download className="h-4 w-4" aria-hidden />;

  if (canInstall) {
    return (
      <button
        type="button"
        onClick={() => {
          void promptInstall().then((outcome) => onResult?.(outcome));
        }}
        className={className}
      >
        {icon}
        {label}
      </button>
    );
  }

  // No native prompt on this platform — send to the guided instructions.
  return (
    <Link href="/install" className={className}>
      {icon}
      {label}
    </Link>
  );
}
