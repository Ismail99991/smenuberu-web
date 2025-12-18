"use client";

import { X } from "lucide-react";
import type { TaskType } from "@/lib/task-types";
import { TASK_TYPES } from "@/lib/task-types";

export type SortKey = "relevance" | "pay_desc" | "pay_asc" | "premium_first" | "near";

export type TaskFilters = {
  onlyHot: boolean;
  onlyPremium: boolean;
  types: TaskType[]; // пусто = все
  sort: SortKey;
};

export default function SortFilterModal({
  open,
  onClose,
  value,
  onChange
}: {
  open: boolean;
  onClose: () => void;
  value: TaskFilters;
  onChange: (next: TaskFilters) => void;
}) {
  if (!open) return null;

  const toggleType = (t: TaskType) => {
    const has = value.types.includes(t);
    const nextTypes = has ? value.types.filter((x) => x !== t) : [...value.types, t];
    onChange({ ...value, types: nextTypes });
  };

  const reset = () => {
    onChange({
      onlyHot: false,
      onlyPremium: false,
      types: [],
      sort: "relevance"
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-6 w-[min(560px,calc(100%-16px))] -translate-x-1/2">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4">
            <div>
              <div className="text-sm text-zinc-500">Задания</div>
              <div className="text-base font-semibold">Сортировать и фильтровать</div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white p-2"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
                  { k: "near", label: "По близости (пока заглушка)" }
                ].map((x) => (
                  <button
                    key={x.k}
                    onClick={() => onChange({ ...value, sort: x.k as SortKey })}
                    className={[
                      "w-full rounded-xl border px-3 py-2 text-left text-sm",
                      value.sort === x.k
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    ].join(" ")}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Быстрые фильтры */}
            <div className="rounded-2xl border border-zinc-200 p-4">
              <div className="text-sm font-semibold">Фильтры</div>

              <div className="mt-3 grid gap-2">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                  <span>Только “горящие”</span>
                  <input
                    type="checkbox"
                    checked={value.onlyHot}
                    onChange={(e) => onChange({ ...value, onlyHot: e.target.checked })}
                    className="h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                  <span>Только “высокий тариф”</span>
                  <input
                    type="checkbox"
                    checked={value.onlyPremium}
                    onChange={(e) => onChange({ ...value, onlyPremium: e.target.checked })}
                    className="h-4 w-4"
                  />
                </label>
              </div>

              <div className="mt-4 text-sm font-semibold">Тип задания</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {TASK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => toggleType(t.value)}
                    className={[
                      "rounded-full border px-3 py-1 text-sm",
                      value.types.includes(t.value)
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-2 text-xs text-zinc-500">
                Если типы не выбраны — показываем все.
              </div>
            </div>

            {/* Действия */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
              >
                Сбросить
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
              >
                Применить
              </button>
            </div>

            <div className="text-xs text-zinc-500">
              UI-only: “близость” сейчас считается условно (детерминированно по городу/адресу).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
