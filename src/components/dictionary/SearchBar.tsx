"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { debounce } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps): React.ReactElement {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  // Debounce 300ms
  useEffect(() => {
    const handler = debounce((next: string) => onChange(next), 300);
    handler(local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-emerald-500/70"
        aria-hidden
      />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="dura-glass w-full rounded-2xl px-12 py-4 text-base text-[var(--color-text-primary)] shadow-sm placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:shadow-none"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-secondary)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
