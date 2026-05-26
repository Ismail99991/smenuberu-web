"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { TaskType } from "@/lib/task-types";
import { TASK_TYPES } from "@/lib/task-types";
import {
  uiOverlay,
  uiModal,
  uiCard,
  uiButtonGhost,
  uiButtonPrimary,
  uiTransition,
} from "@/lib/ui";
import { cn } from "@/lib/cn";

export type SortKey =
  | "relevance"
  | "pay_desc"
  | "pay_asc"
  | "premium_first"
  | "near";

export type TaskFilters = {
  onlyHot: boolean;
  onlyPremium: boolean;
  types: TaskType[];
  sort: SortKey;
};

export default function SortFilterModal({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: TaskFilters;
  onChange: (next: TaskFilters) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener(
        "keydown",
        handleEscape
      );
  }, [open, onClose]);

  const toggleType = (t: TaskType) => {
    const has = value.types.includes(t);

    onChange({
      ...value,
      types: has
        ? value.types.filter((x) => x !== t)
        : [...value.types, t],
    });
  };

  const reset = () => {
    onChange({
      onlyHot: false,
      onlyPremium: false,
      types: [],
      sort: "relevance",
    });
  };

  if (!open || !mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999]">

      <div
        className={cn(uiOverlay, "touch-none")}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">

        <div
          data-open="true"
          className={cn(
            uiCard,
            uiModal,

            "w-full max-w-[560px]",
            "flex flex-col",

            "max-h-[85dvh]",
            "min-h-0",

            "overflow-hidden",

            "rounded-[28px]",
            "shadow-2xl"
          )}
          onClick={(e) => e.stopPropagation()}
        >

          {/* HEADER */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 bg-white p-5">

            <div>
              <div className="text-sm text-zinc-500">
                Задания
              </div>

              <div className="text-lg font-semibold text-zinc-900">
                Сортировка и фильтры
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Закрыть"
              className={cn(
                uiButtonGhost,

                "rounded-2xl",
                "border border-zinc-200",

                "p-2",

                "hover:bg-zinc-50",
                "active:scale-[0.96]"
              )}
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* SCROLL */}
          <div
            ref={contentRef}
            className="
              flex-1
              min-h-0

              overflow-y-auto

              touch-pan-y
              overscroll-contain

              p-5 pb-8

              [-webkit-overflow-scrolling:touch]
            "
          >

            <div className="space-y-5">

              {/* SORT */}
              <div className="rounded-3xl border border-zinc-200 p-4">

                <div className="text-sm font-semibold">
                  Сортировка
                </div>

                <div className="mt-3 grid gap-2">

                  {[
                    {
                      k: "relevance",
                      label: "По умолчанию",
                    },

                    {
                      k: "pay_desc",
                      label:
                        "По цене: сначала дороже",
                    },

                    {
                      k: "pay_asc",
                      label:
                        "По цене: сначала дешевле",
                    },

                    {
                      k: "premium_first",
                      label:
                        "Сначала высокий тариф",
                    },

                    {
                      k: "near",
                      label: "По близости",
                    },

                  ].map((x) => {

                    const active =
                      value.sort === x.k;

                    return (
                      <button
                        key={x.k}
                        onClick={() =>
                          onChange({
                            ...value,
                            sort:
                              x.k as SortKey,
                          })
                        }
                        className={cn(
                          uiTransition,

                          "rounded-2xl",
                          "border",

                          "px-4 py-3",

                          "text-left text-sm",

                          active
                            ? "border-[#c29cf2] bg-[#c29cf2] text-white"
                            : "border-zinc-200 bg-white hover:bg-zinc-50"
                        )}
                      >
                        {x.label}
                      </button>
                    );
                  })}

                </div>

              </div>

              {/* FILTERS */}
              <div className="rounded-3xl border border-zinc-200 p-4">

                <div className="text-sm font-semibold">
                  Фильтры
                </div>

                <div className="mt-3 grid gap-2">

                  {[
                    {
                      label:
                        "Только горячие",

                      checked:
                        value.onlyHot,

                      onChange:
                        (
                          v: boolean
                        ) =>
                          onChange({
                            ...value,
                            onlyHot: v,
                          }),
                    },

                    {
                      label:
                        "Только высокий тариф",

                      checked:
                        value.onlyPremium,

                      onChange:
                        (
                          v: boolean
                        ) =>
                          onChange({
                            ...value,
                            onlyPremium:
                              v,
                          }),
                    },

                  ].map((f) => (

                    <label
                      key={f.label}
                      className="
                        flex
                        items-center
                        justify-between

                        rounded-2xl

                        border
                        border-zinc-200

                        px-4 py-3
                      "
                    >

                      <span className="text-sm">
                        {f.label}
                      </span>

                      <input
                        type="checkbox"
                        checked={
                          f.checked
                        }
                        onChange={(
                          e
                        ) =>
                          f.onChange(
                            e.target
                              .checked
                          )
                        }
                        className="
                          h-4 w-4
                          accent-[#c29cf2]
                        "
                      />

                    </label>

                  ))}

                </div>

                <div className="mt-5 text-sm font-semibold">
                  Тип задания
                </div>

                <div className="mt-3 flex flex-wrap gap-2">

                  {TASK_TYPES.map((t) => {

                    const active =
                      value.types.includes(
                        t.value
                      );

                    return (
                      <button
                        key={t.value}
                        onClick={() =>
                          toggleType(
                            t.value
                          )
                        }
                        className={cn(
                          uiTransition,

                          "rounded-full px-4 py-2 text-sm border",

                          active
                            ? "bg-[#c29cf2] border-[#c29cf2] text-white"
                            : "border-zinc-200 bg-white hover:bg-zinc-50"
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div className="
            sticky
            bottom-0

            shrink-0

            border-t
            border-zinc-100

            bg-white

            p-4
          ">

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={reset}
                className={cn(
                  uiButtonGhost,

                  "rounded-2xl",

                  "border border-zinc-200",

                  "py-3"
                )}
              >
                Сбросить
              </button>

              <button
                onClick={onClose}
                className={cn(
                  uiButtonPrimary,

                  "rounded-2xl",

                  "py-3"
                )}
              >
                Применить
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );

  return createPortal(
    modal,
    document.body
  );
}
