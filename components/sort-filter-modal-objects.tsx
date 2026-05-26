"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  uiOverlay,
  uiModal,
  uiCard,
  uiButtonGhost,
  uiButtonPrimary,
  uiTransition,
} from "@/lib/ui";
import { cn } from "@/lib/cn";

export type ObjectSortKey =
  | "relevance"
  | "name_asc"
  | "name_desc"
  | "pay_desc"
  | "near";

export type ObjectFilters = {
  onlyWithBus: boolean;
  objectTypes: string[];
  sort: ObjectSortKey;
};

interface SortFilterModalObjectsProps {
  open: boolean;
  onClose: () => void;
  value: ObjectFilters;
  onChange: (next: ObjectFilters) => void;
}

const OBJECT_TYPES = [
  { value: "warehouse", label: "Склад" },
  { value: "store", label: "Магазин" },
  { value: "restaurant", label: "Ресторан" },
  { value: "factory", label: "Завод" },
  { value: "office", label: "Офис" },
];

export default function SortFilterModalObjects({
  open,
  onClose,
  value,
  onChange,
}: SortFilterModalObjectsProps) {
  const [mounted, setMounted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // нормальная блокировка body для iOS
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  const toggleObjectType = (type: string) => {
    const has = value.objectTypes.includes(type);

    onChange({
      ...value,
      objectTypes: has
        ? value.objectTypes.filter((x) => x !== type)
        : [...value.objectTypes, type],
    });
  };

  const reset = () => {
    onChange({
      onlyWithBus: false,
      objectTypes: [],
      sort: "relevance",
    });
  };

  if (!open || !mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999]">

      <div
        className={cn(uiOverlay)}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">

        <div
          data-open="true"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            uiCard,
            uiModal,

            "w-full max-w-[560px]",

            "flex flex-col",

            "max-h-[85dvh]",

            "overflow-hidden",

            "rounded-[28px]",

            "shadow-2xl"
          )}
        >

          {/* HEADER */}

          <div className="shrink-0 border-b border-zinc-200 bg-white/95 backdrop-blur px-5 py-4">

            <div className="flex items-start justify-between gap-3">

              <div>

                <div className="text-sm text-zinc-500">
                  Объекты
                </div>

                <div className="text-lg font-semibold">
                  Сортировка и фильтры
                </div>

              </div>

              <button
                onClick={onClose}
                aria-label="Закрыть"
                className={cn(
                  uiButtonGhost,

                  "h-10 w-10",

                  "rounded-2xl",

                  "border border-zinc-200",

                  "active:scale-95"
                )}
              >
                <X className="h-5 w-5" />
              </button>

            </div>

          </div>

          {/* CONTENT */}

          <div
            ref={scrollRef}
            className="
              flex-1
              overflow-y-auto
              overscroll-contain
              touch-pan-y
              p-5
            "
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >

            <div className="space-y-5">

              <div className="rounded-3xl border border-zinc-200 p-4">

                <div className="text-sm font-semibold">
                  Сортировка
                </div>

                <div className="mt-3 grid gap-2">

                  {[
                    { k: "relevance", label: "По умолчанию" },
                    { k: "name_asc", label: "По названию: А-Я" },
                    { k: "name_desc", label: "По названию: Я-А" },
                    { k: "pay_desc", label: "По ставке: сначала выше" },
                    { k: "near", label: "По близости" },
                  ].map((x) => {

                    const active = value.sort === x.k;

                    return (
                      <button
                        key={x.k}
                        onClick={() =>
                          onChange({
                            ...value,
                            sort: x.k as ObjectSortKey,
                          })
                        }
                        className={cn(
                          uiTransition,

                          "rounded-2xl",

                          "border",

                          "px-4 py-3",

                          "text-left text-sm",

                          "active:scale-[0.98]",

                          active
                            ? "border-[#c29cf2] bg-[#c29cf2] text-white"
                            : "border-zinc-200 bg-white"
                        )}
                      >
                        {x.label}
                      </button>
                    );

                  })}

                </div>

              </div>

              <div className="rounded-3xl border border-zinc-200 p-4">

                <div className="text-sm font-semibold">
                  Фильтры
                </div>

                <label className="
                  mt-3
                  flex
                  items-center
                  justify-between

                  rounded-2xl

                  border

                  border-zinc-200

                  px-4 py-3
                ">

                  <span>
                    🚌 Есть автобусы
                  </span>

                  <input
                    type="checkbox"
                    checked={value.onlyWithBus}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        onlyWithBus: e.target.checked,
                      })
                    }
                    className="
                      h-4 w-4
                      accent-[#c29cf2]
                    "
                  />

                </label>

                <div className="mt-5 text-sm font-semibold">
                  Тип объекта
                </div>

                <div className="mt-3 flex flex-wrap gap-2">

                  {OBJECT_TYPES.map((t) => {

                    const active =
                      value.objectTypes.includes(t.value);

                    return (
                      <button
                        key={t.value}
                        onClick={() =>
                          toggleObjectType(t.value)
                        }
                        className={cn(
                          uiTransition,

                          "rounded-full",

                          "px-4 py-2",

                          "border",

                          "text-sm",

                          active
                            ? "border-[#c29cf2] bg-[#c29cf2] text-white"
                            : "border-zinc-200 bg-white"
                        )}
                      >
                        {t.label}
                      </button>
                    );

                  })}

                </div>

              </div>

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

    </div>
  );

  return createPortal(modal, document.body);
}