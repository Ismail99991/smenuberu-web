"use client";

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
  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className={uiOverlay} onClick={onClose} />

      {/* container */}
      <div className="absolute left-1/2 top-6 w-[min(560px,calc(100%-16px))] -translate-x-1/2">
        <div className={cn(uiCard, uiModal)} data-open>
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4">
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
                "p-2 border border-zinc-200 rounded-xl"
              )}
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* content */}
          <div className="space-y-4 p-4">
            {/* Сортировка */}
            <div className="rounded-2xl border border-zinc-200 p-4">
              <div className="text-sm font-semibold">Сортировка</div>

              <div className="mt-3 grid gap-2">
                {[
                  { k: "relevance", label: "По умолчанию" },
                  { k: "pay_desc", label: "По цене: сначала дороже" },
                  { k: "pay_asc", label: "По цене: сначала дешевле" },
                  { k: "premium_first", label: "Сначала высокий тариф" },
                  { k: "near", label: "По близости (пока заглушка)" },
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
                        "w-full rounded-xl border px-3 py-2 text-left text-sm",
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
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
                      "flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                    )}
                  >
                    <span>{f.label}</span>
                    <input
                      type="checkbox"
                      checked={f.checked}
                      onChange={(e) => f.onChange(e.target.checked)}
                      className="h-4 w-4"
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
                        "rounded-full border px-3 py-1 text-sm",
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
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

            {/* actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={reset}
                className={cn(
                  uiButtonGhost,
                  "border border-zinc-200 px-4 py-3 text-sm font-medium"
                )}
              >
                Сбросить
              </button>
              <button
                onClick={onClose}
                className={cn(uiButtonPrimary, "px-4 py-3 text-sm font-medium")}
              >
                Применить
              </button>
            </div>

            <div className="text-xs text-zinc-500">
              UI-only: “близость” сейчас считается условно.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
