// components/SortFilterModal.tsx
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
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Блокировка скролла body
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const toggleType = (t: TaskType) => {
    const has = value.types.includes(t);
    onChange({
      ...value,
      types: has ? value.types.filter((x) => x !== t) : [...value.types, t],
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

  if (!open) return null;
  if (!mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999]">
      <div className={cn(uiOverlay, "touch-none")} onClick={onClose} />

      <div className="absolute left-1/2 top-[10vh] w-[min(560px,calc(100%-32px))] -translate-x-1/2">
        <div
          ref={modalRef}
          className={cn(
            uiCard,
            uiModal,
            "flex flex-col",
            "max-h-[80vh] overflow-hidden"
          )}
          data-open
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — не скроллится */}
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4 shrink-0">
            <div>
              <div className="text-sm text-zinc-500">Задания</div>
              <div className="text-base font-semibold">
                Сортировать и фильтровать
              </div>
            </div>

            <button
              onClick={onClose}
              className={cn(
                uiButtonGhost,
                "p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 active:scale-[0.96]"
              )}
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content — скроллится */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-contain p-4"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="space-y-4">
              {/* Сортировка */}
              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-sm font-semibold">Сортировка</div>

                <div className="mt-3 grid gap-2">
                  {[
                    { k: "relevance", label: "По умолчанию" },
                    { k: "pay_desc", label: "По цене: сначала дороже" },
                    { k: "pay_asc", label: "По цене: сначала дешевле" },
                    { k: "premium_first", label: "Сначала высокий тариф" },
                    { k: "near", label: "По близости" },
                  ].map((x) => {
                    const active = value.sort === x.k;
                    return (
                      <button
                        key={x.k}
                        onClick={() =>
                          onChange({ ...value, sort: x.k as SortKey })
                        }
                        className={cn(
                          uiTransition,
                          "w-full rounded-xl border px-3 py-2 text-left text-sm active:scale-[0.98]",
                          active
                            ? "border-[#c29cf2] bg-[#c29cf2] text-white"
                            : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                        )}
                      >
                        {x.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Фильтры */}
              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-sm font-semibold">Фильтры</div>

                <div className="mt-3 grid gap-2">
                  {[
                    {
                      label: "Только “горящие”",
                      checked: value.onlyHot,
                      onChange: (v: boolean) =>
                        onChange({ ...value, onlyHot: v }),
                    },
                    {
                      label: "Только “высокий тариф”",
                      checked: value.onlyPremium,
                      onChange: (v: boolean) =>
                        onChange({ ...value, onlyPremium: v }),
                    },
                  ].map((f) => (
                    <label
                      key={f.label}
                      className={cn(
                        uiTransition,
                        "flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm",
                        "cursor-pointer"
                      )}
                    >
                      <span>{f.label}</span>
                      <input
                        type="checkbox"
                        checked={f.checked}
                        onChange={(e) => f.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 accent-[#c29cf2]"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-4 text-sm font-semibold">Тип задания</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TASK_TYPES.map((t) => {
                    const active = value.types.includes(t.value);
                    return (
                      <button
                        key={t.value}
                        onClick={() => toggleType(t.value)}
                        className={cn(
                          uiTransition,
                          "rounded-full border px-3 py-1 text-sm active:scale-[0.96]",
                          active
                            ? "border-[#c29cf2] bg-[#c29cf2] text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                  Если типы не выбраны — показываем все.
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={reset}
                  className={cn(
                    uiButtonGhost,
                    "rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium",
                    "hover:bg-zinc-50 active:scale-[0.97]"
                  )}
                >
                  Сбросить
                </button>
                <button
                  onClick={onClose}
                  className={cn(
                    uiButtonPrimary,
                    "rounded-xl px-4 py-3 text-sm font-medium",
                    "active:scale-[0.97]"
                  )}
                >
                  Применить
                </button>
              </div>

              <div className="text-xs text-zinc-500 text-center">
                UI-only: “близость” сейчас считается условно.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}