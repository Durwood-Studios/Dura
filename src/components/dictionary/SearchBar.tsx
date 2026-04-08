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
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
        aria-hidden
      />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-9 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-emerald-400 focus:outline-none"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
