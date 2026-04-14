"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

const LINKS: ReadonlyArray<NavLink> = [
  { href: "/paths", label: "Paths" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/about", label: "About" },
];

export function Nav(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E5E5]/60 bg-[#FAFAFA]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[#171717]"
          onClick={() => setIsOpen(false)}
        >
          DURA
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[#525252] sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#171717]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/paths"
            className="hidden h-9 items-center justify-center rounded-lg bg-[#10B981] px-4 text-sm font-medium text-white transition-all hover:bg-[#059669] sm:inline-flex"
          >
            Start
          </Link>
          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg text-[#171717] transition-colors hover:bg-[#F0F0F0] sm:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-nav-panel"
        className={`overflow-hidden border-t border-[#E5E5E5]/60 bg-[#FAFAFA] transition-[max-height,opacity] duration-300 ease-out sm:hidden ${
          isOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex h-12 items-center rounded-lg px-3 text-base text-[#525252] transition-colors hover:bg-white hover:text-[#171717]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/paths"
            onClick={() => setIsOpen(false)}
            className="mt-2 flex h-12 items-center justify-center rounded-lg bg-[#10B981] px-4 text-base font-medium text-white transition-all hover:bg-[#059669]"
          >
            Start Learning
          </Link>
        </nav>
      </div>
    </header>
  );
}
