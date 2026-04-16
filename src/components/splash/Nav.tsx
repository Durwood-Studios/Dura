"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/open-source", label: "Open Source" },
  { href: "/install", label: "Install" },
  { href: "/tracks", label: "Career Tracks" },
] as const;

export function Nav(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E5E5]/60 bg-[#FAFAFA]/80 backdrop-blur-md dark:border-white/5 dark:bg-[#08080d]/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="bg-gradient-to-r from-[#10B981] to-[#06B6D4] bg-clip-text text-lg font-semibold tracking-tight text-transparent"
          onClick={() => setIsOpen(false)}
        >
          DURA
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-6 text-sm text-[#525252] sm:flex dark:text-[#a0a0a8]">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#171717] dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#10B981] px-5 text-sm font-medium text-white transition hover:bg-[#059669]"
          >
            Start Learning
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#171717] transition hover:bg-[#F0F0F0] sm:hidden dark:text-white dark:hover:bg-white/10"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu — clean, vertical, no redundancy */}
      {isOpen && (
        <div className="border-t border-[#E5E5E5]/60 bg-[#FAFAFA] sm:hidden dark:border-white/5 dark:bg-[#08080d]">
          <nav className="flex flex-col px-6 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex h-12 items-center text-base text-[#525252] transition-colors hover:text-[#171717] dark:text-[#a0a0a8] dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-[#E5E5E5]/60 pt-4 dark:border-white/5">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex h-12 items-center justify-center rounded-lg bg-[#10B981] text-base font-medium text-white transition hover:bg-[#059669]"
              >
                Start Learning
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
