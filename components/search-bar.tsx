"use client";

import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
} from "lucide-react";

import type { TaskFilters } from "./sort-filter-modal";

interface SearchBarProps {
  q: string;
  onSearchChange: (
    value: string
  ) => void;

  showSearch: boolean;

  onToggleSearch: () => void;

  onOpenFilters: () => void;

  onNear: () => void;

  filters: TaskFilters;
}

export default function SearchBar({
  q,
  onSearchChange,

  showSearch,

  onToggleSearch,

  onOpenFilters,

  onNear,

  filters,
}: SearchBarProps) {
  const hasActiveFilters =
    filters.onlyHot ||
    filters.onlyPremium ||
    filters.types.length > 0 ||
    filters.sort !==
      "relevance";

  return (
    <div className="space-y-3">

      {/* HERO BAR */}
      <div className="flex items-center gap-2">

        {/* Заголовок / поиск */}
        <div className="flex-1 overflow-hidden">

          <div
            className={`
              flex
              items-center

              rounded-2xl

              transition-all
              duration-300

              ${
                showSearch
                  ? `
                    border
                    border-zinc-200

                    bg-white

                    px-3 py-2

                    shadow-sm
                  `
                  : `
                    bg-transparent
                    px-0 py-0
                  `
              }
            `}
          >

            {showSearch ? (
              <>

                <Search className="
                  h-4
                  w-4

                  shrink-0

                  text-zinc-400
                " />

                <input
                  value={q}
                  onChange={(e) =>
                    onSearchChange(
                      e.target.value
                    )
                  }

                  autoFocus

                  placeholder="
                    Поиск:
                    профессия,
                    компания,
                    город...
                  "

                  className="
                    ml-2

                    flex-1

                    bg-transparent

                    text-sm

                    outline-none

                    placeholder:text-zinc-400
                  "
                />

                <button
                  onClick={() => {
                    onSearchChange(
                      ""
                    );

                    onToggleSearch();
                  }}

                  className="
                    ml-2

                    shrink-0

                    text-zinc-400
                  "
                >
                  <X className="
                    h-4
                    w-4
                  " />
                </button>

              </>
            ) : (

              <div className="
                text-base
                font-semibold

                text-zinc-900
              ">
                Задания
              </div>

            )}

          </div>

        </div>

        {/* ACTIONS */}
        {!showSearch && (

          <div className="
            flex
            items-center
            gap-2
          ">

            {/* Поиск */}
            <button
              onClick={
                onToggleSearch
              }

              className="
                p-2

                rounded-xl

                text-zinc-600

                hover:bg-zinc-100

                transition-colors
              "

              aria-label="
                Поиск
              "
            >
              <Search className="
                h-5
                w-5
              " />
            </button>

            {/* Смены рядом */}
            <button
              onClick={onNear}

              className="
                flex
                items-center
                gap-1.5

                rounded-xl

                bg-[#c29cf2]

                px-3 py-2

                text-white

                font-medium
                text-sm

                shadow-sm

                active:scale-[0.97]

                transition-transform
              "

              aria-label="
                Смены рядом
              "
            >

              <MapPin className="
                h-4
                w-4
              " />

              <span>
                Рядом
              </span>

            </button>

            {/* Фильтры */}
            <button
              onClick={
                onOpenFilters
              }

              className={`
                p-2

                rounded-xl

                transition-colors

                ${
                  hasActiveFilters
                    ? `
                      bg-[#c29cf2]/10
                      text-[#c29cf2]
                    `
                    : `
                      text-zinc-600
                      hover:bg-zinc-100
                    `
                }
              `}

              aria-label="
                Фильтры
              "
            >

              <SlidersHorizontal
                className="
                  h-5
                  w-5
                "
              />

            </button>

          </div>

        )}

      </div>

      {/* ЧИПЫ ФИЛЬТРОВ */}
      {hasActiveFilters && (

        <div className="
          flex
          flex-wrap
          gap-1.5
        ">

          {filters.onlyHot && (
            <span
              className="
                rounded-full

                bg-[#c29cf2]/10

                px-2 py-0.5

                text-xs

                text-[#c29cf2]
              "
            >
              Горящие
            </span>
          )}

          {filters.onlyPremium && (
            <span
              className="
                rounded-full

                bg-[#c29cf2]/10

                px-2 py-0.5

                text-xs

                text-[#c29cf2]
              "
            >
              Высокий тариф
            </span>
          )}

          {filters.types.length >
            0 && (
            <span
              className="
                rounded-full

                bg-[#c29cf2]/10

                px-2 py-0.5

                text-xs

                text-[#c29cf2]
              "
            >
              {
                filters.types
                  .length
              }{" "}
              типа
            </span>
          )}

          {filters.sort !==
            "relevance" && (
            <span
              className="
                rounded-full

                bg-zinc-100

                px-2 py-0.5

                text-xs

                text-zinc-600
              "
            >
              {filters.sort ===
              "pay_desc"
                ? "Сначала дороже"
                : filters.sort ===
                  "pay_asc"
                ? "Сначала дешевле"
                : filters.sort ===
                  "premium_first"
                ? "Высокий тариф"
                : "По близости"}
            </span>
          )}

        </div>

      )}

    </div>
  );
}