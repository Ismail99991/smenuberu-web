"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/badge";
import type { Slot } from "@/lib/slots";
import { formatMoneyRub } from "@/lib/slots";
import { getBooking, setBooking, type BookingStatus } from "@/lib/booking-state";
import { getRating } from "@/lib/rating-state";

export default function SlotCard({
  slot,
  onBook,
  onRate
}: {
  slot: Slot;
  onBook: (slot: Slot) => void;
  onRate: (slot: Slot) => void;
}) {
  const [status, setStatus] = useState<BookingStatus>("none");
  const [hasRating, setHasRating] = useState(false);

  useEffect(() => {
    const rec = getBooking(slot.id);
    setStatus(rec.status);
    setHasRating(!!getRating(slot.id));
  }, [slot.id]);

  const isPremium = slot.pay >= 3500;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold">{slot.title}</div>

            {slot.hot ? (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                Горящий
              </span>
            ) : null}

            {isPremium ? (
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                Высокий тариф
              </span>
            ) : null}

            {status === "booked" ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Записан
              </span>
            ) : null}

            {status === "cancelled" ? (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                Отменено
              </span>
            ) : null}

            {status === "completed" ? (
              <span className="inline-flex items-center rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
                Завершено
              </span>
            ) : null}

            {hasRating ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Оценено
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

      {/* действия */}
      {status === "booked" ? (
        <div className="mt-4 grid gap-2">
          <button
            onClick={() => {
              setBooking(slot.id, "cancelled");
              setStatus("cancelled");
            }}
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
          >
            Отменить запись
          </button>

          {/* DEMO: завершить, чтобы включить рейтинг */}
          <button
            onClick={() => {
              setBooking(slot.id, "completed");
              setStatus("completed");
            }}
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
          >
            Отметить как завершено (demo)
          </button>
        </div>
      ) : status === "completed" ? (
        <div className="mt-4 grid gap-2">
          <button
            onClick={() => onRate(slot)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
          >
            Оценить смену
          </button>
        </div>
      ) : (
        <button
          onClick={() => onBook(slot)}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
        >
          Записаться
        </button>
      )}
    </div>
  );
}
