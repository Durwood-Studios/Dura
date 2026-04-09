"use client";

import { Menu, Search } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { SprintTimer } from "@/components/study/SprintTimer";

export function TopBar(): React.ReactElement {
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E5E5E5] bg-white/80 px-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-neutral-700 hover:bg-[#F5F5F4] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="ml-auto flex items-center gap-2">
        <SprintTimer />
      </div>
      <button
        type="button"
        onClick={toggleCommandPalette}
        className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-1.5 text-sm text-neutral-500 transition hover:bg-[#F5F5F4]"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-2 hidden rounded border border-[#E5E5E5] px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 sm:inline">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
