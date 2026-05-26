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
    filters.types.length >
      0 ||
    filters.sort !==
      "relevance";

  return (
    <div className="space-y-2">

      <div className="
        flex
        items-center
        justify-between
        gap-2
      ">

        {!showSearch ? (

          <div className="
            text-base
            font-semibold
            text-zinc-900
          ">
            Задания
          </div>

        ) : (

          <div className="flex-1">

            <div className="relative">

              <Search
                className="
                  absolute
                  left-3
                  top-1/2

                  h-4 w-4

                  -translate-y-1/2

                  text-zinc-400
                "
              />

              <input
                value={q}
                onChange={(e) =>
                  onSearchChange(
                    e.target.value
                  )
                }
                placeholder="
                  Поиск:
                  профессия,
                  компания,
                  город…
                "
                autoFocus
                className="
                  w-full

                  rounded-2xl

                  border
                  border-zinc-200

                  bg-white

                  py-2
                  pl-9
                  pr-8

                  text-sm

                  outline-none

                  focus:border-[#c29cf2]

                  focus:ring-2
                  focus:ring-[#c29cf2]/20
                "
              />

              {q && (

                <button
                  onClick={() =>
                    onSearchChange(
                      ""
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2

                    -translate-y-1/2
                  "
                >

                  <X
                    className="
                      h-4 w-4
                      text-zinc-400
                    "
                  />

                </button>

              )}

            </div>

          </div>

        )}

        <div className="
          flex
          items-center
          gap-2
          shrink-0
        ">

          <button
            onClick={
              onToggleSearch
            }
            className="
              flex
              h-11
              w-11

              items-center
              justify-center

              rounded-2xl

              border
              border-zinc-200

              bg-white

              text-zinc-600

              transition-colors

              hover:text-zinc-900
            "
            aria-label="
              Поиск
            "
          >

            <Search
              className="
                h-5 w-5
              "
            />

          </button>

          <button
            onClick={onNear}
            className="
              flex
              h-11

              items-center
              gap-2

              rounded-2xl

              bg-[#c29cf2]

              px-4

              text-sm
              font-medium

              text-white

              transition-all

              hover:bg-[#b68ce8]

              active:scale-[0.97]
            "
          >

            <MapPin
              className="
                h-4 w-4
              "
            />

            <span>
              Рядом
            </span>

          </button>

          <button
            onClick={
              onOpenFilters
            }
            className={`
              flex
              h-11
              w-11

              items-center
              justify-center

              rounded-2xl

              border
              border-zinc-200

              bg-white

              transition-colors

              ${
                hasActiveFilters
                  ? "text-[#c29cf2]"
                  : "text-zinc-600 hover:text-zinc-900"
              }
            `}
            aria-label="
              Фильтры
            "
          >

            <SlidersHorizontal
              className="
                h-5 w-5
              "
            />

          </button>

        </div>

      </div>

      {hasActiveFilters && (

        <div className="
          flex
          flex-wrap
          gap-1.5
        ">

          {filters.onlyHot && (

            <span className="
              rounded-full

              bg-[#c29cf2]/10

              px-2
              py-0.5

              text-xs

              text-[#c29cf2]
            ">
              Горящие
            </span>

          )}

          {filters.onlyPremium && (

            <span className="
              rounded-full

              bg-[#c29cf2]/10

              px-2
              py-0.5

              text-xs

              text-[#c29cf2]
            ">
              Высокий тариф
            </span>

          )}

        </div>

      )}

    </div>
  );
}