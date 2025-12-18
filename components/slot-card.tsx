"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/badge";
import type { Slot } from "@/lib/slots";
import { formatMoneyRub } from "@/lib/slots";
import { getBooking, setBooking, type BookingStatus } from "@/lib/booking-state";
import { TaskTypeIcon } from "@/components/task-type-icon";
import { cn } from "@/lib/cn";
import { uiCard, uiTransition, uiButtonGhost, uiButtonPrimary } from "@/lib/ui";

export default function SlotCard({
  slot,
  onBook,
}: {
  slot: Slot;
  onBook: (slot: Slot) => void;
}) {
  const [status, setStatusLocal] = useState<BookingStatus>("none");

  useEffect(() => {
    const rec = getBooking(slot.id);
    setStatusLocal(rec.status);
  }, [slot.id]);

  const isPremium = slot.pay >= 3500;

  return (
    <div
      className={cn(
        uiCard,
        "p-5",
        // чуть более “живой” hover именно для карточек списка
        "hover:shadow-md hover:border-zinc-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <TaskTypeIcon type={slot.type} className="h-5 w-5 text-zinc-700" />
              <div className="text-base font-semibold">{slot.title}</div>
            </div>

            {slot.hot ? (
              <span className={cn(uiTransition, "inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700")}>
                Горящий
              </span>
            ) : null}

            {isPremium ? (
              <span className={cn(uiTransition, "inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700")}>
                Высокий тариф
              </span>
            ) : null}

            {status === "booked" ? (
              <span className={cn(uiTransition, "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700")}>
                Записан
              </span>
            ) : null}

            {status === "cancelled" ? (
              <span className={cn(uiTransition, "inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600")}>
                Отменено
              </span>
            ) : null}

            {status === "completed" ? (
              <span className={cn(uiTransition, "inline-flex items-center rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white")}>
                Завершено
              </span>
            ) : null}
          </div>

          <div className="mt-1 text-sm text-zinc-600">
            {slot.company} · {slot.city}
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-semibold">{formatMoneyRub(slot.pay)}</div>
          <div className="mt-1 text-xs text-zinc-500">{slot.time}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {slot.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>

      <div className="mt-3 text-sm text-zinc-600">{slot.address}</div>

      {status === "booked" ? (
        <div className="mt-4 grid gap-2">
          <button
            onClick={() => {
              setBooking(slot.id, "cancelled");
              setStatusLocal("cancelled");
            }}
            className={cn(
              uiButtonGhost,
              "w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900"
            )}
          >
            Отменить запись
          </button>

          {/* demo: завершено */}
          <button
            onClick={() => {
              setBooking(slot.id, "completed");
              setStatusLocal("completed");
            }}
            className={cn(
              uiButtonPrimary,
              "w-full rounded-xl px-4 py-3 text-sm font-medium"
            )}
          >
            Отметить как завершено (demo)
          </button>
        </div>
      ) : status === "completed" ? (
        <div className={cn(uiTransition, "mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700")}>
          Смена завершена. Оценка смены — в профиле.
        </div>
      ) : (
        <button
          onClick={() => onBook(slot)}
          className={cn(
            uiButtonPrimary,
            "mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium"
          )}
        >
          Записаться
        </button>
      )}
    </div>
  );
}
