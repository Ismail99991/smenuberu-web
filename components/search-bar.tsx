"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  q: string;
  onSearchChange: (value: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
}

export default function SearchBar({
  q,
  onSearchChange,
  showSearch,
  onToggleSearch,
}: SearchBarProps) {
  if (!showSearch) return null;

  return (
    <div className="rounded-3xl bg-white p-3">
      <div className="flex items-center rounded-2xl bg-zinc-50 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-zinc-400" />

        <input
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
          placeholder="Поиск: профессия, компания, город..."
          className="ml-2 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />

        <button
          onClick={() => {
            onSearchChange("");
            onToggleSearch();
          }}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 active:scale-[0.95]"
          aria-label="Закрыть поиск"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
