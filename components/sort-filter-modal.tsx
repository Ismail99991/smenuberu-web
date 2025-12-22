"use client";

import { useEffect, useState } from "react";
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
  // ✅ чтобы портал работал только на клиенте
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ✅ lock scroll body на время открытой модалки (особенно важно на iOS)
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = (document.body.style as any).touchAction;

    document.body.style.overflow = "hidden";
    (document.body.style as any).touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      (document.body.style as any).touchAction = prevTouchAction;
    };
  }, [open]);

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
      {/* overlay */}
      <div className={cn(uiOverlay, "touch-none")} onClick={onClose} />

      {/* container */}
      <div className="absolute left-1/2 top-6 w-[min(560px,calc(100%-16px))] -translate-x-1/2">
        {/* panel */}
        <div
          className={cn(
            uiCard,
            uiModal,
            // ✅ added: делаем колонку, чтобы body мог занять остаток высоты и скроллиться
            "flex flex-col", // ✅ added
            // ✅ чтобы модалка нормально скроллилась на мобиле
            "max-h-[calc(100dvh-48px)] overflow-hidden"
          )}
          data-open
          // ✅ чтобы клики/свайпы внутри не уходили на overlay
          onClick={(e) => e.stopPropagation()}
        >
          {/* header (не скроллится) */}
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4">
            <div>
              <div className="text-sm text-zinc-500">Задания</div>
              <div className="text-base font-semibold">
                Сортировать и фильтровать
              </div>
            </div>

            {/* ❗фикс “лупы” — без scale/transform */}
            <button
              onClick={onClose}
              className={cn(
                uiButtonGhost,
                "p-2 border border-zinc-200 rounded-xl transform-none active:scale-100"
              )}
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* content (СКРОЛЛИТСЯ) */}
          <div
            className={cn(
              // ✅ added: flex-1 + min-h-0 критично для overflow внутри flex-колонки
              "p-4 overflow-y-auto overscroll-contain touch-pan-y flex-1 min-h-0" // ✅ added
            )}
            style={{ WebkitOverflowScrolling: "touch" }}
            // ✅ чтобы тачи/скролл не “проваливались” в фон
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
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
    </div>
  );

  return createPortal(modal, document.body);
}
