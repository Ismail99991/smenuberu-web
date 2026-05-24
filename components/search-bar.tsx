"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import type { TaskFilters } from "./sort-filter-modal";

interface SearchBarProps {
  q: string;
  onSearchChange: (value: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  onOpenFilters: () => void;
  filters: TaskFilters;
}

export default function SearchBar({
  q,
  onSearchChange,
  showSearch,
  onToggleSearch,
  onOpenFilters,
  filters,
}: SearchBarProps) {
  const hasActiveFilters = filters.onlyHot || filters.onlyPremium || filters.types.length > 0 || filters.sort !== "relevance";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {!showSearch ? (
          <div className="text-base font-semibold text-zinc-900">Задания</div>
        ) : (
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                value={q}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Поиск: профессия, компания, город…"
                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-[#c29cf2] focus:ring-2 focus:ring-[#c29cf2]/20"
                autoFocus
              />
              {q && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSearch}
            className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
            aria-label="Поиск"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={onOpenFilters}
            className={`p-2 transition-colors ${
              hasActiveFilters ? "text-[#c29cf2]" : "text-zinc-600 hover:text-zinc-900"
            }`}
            aria-label="Фильтры"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Активные фильтры (чипы) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {filters.onlyHot && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#c29cf2]/10 text-[#c29cf2]">Горящие</span>
          )}
          {filters.onlyPremium && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#c29cf2]/10 text-[#c29cf2]">Высокий тариф</span>
          )}
          {filters.types.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#c29cf2]/10 text-[#c29cf2]">
              {filters.types.length} типа
            </span>
          )}
          {filters.sort !== "relevance" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
              {filters.sort === "pay_desc" ? "По убыванию" :
               filters.sort === "pay_asc" ? "По возрастанию" :
               filters.sort === "premium_first" ? "Premium сначала" : "По близости"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}