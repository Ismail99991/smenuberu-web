"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/badge";
import type { Slot } from "@/lib/slots";
import { formatMoneyRub } from "@/lib/slots";
import { getBooking, setBooking, type BookingStatus } from "@/lib/booking-state";
import { cn } from "@/lib/cn";
import { uiCard, uiButtonGhost, uiButtonPrimary } from "@/lib/ui";
import { getIllustrationUrl } from "@/lib/illustrations";
import { Flame } from "lucide-react";

export default function SlotCard({
  slot,
  onBook,
  isSelfEmployed = false,
  onVerifyNpd,
}: {
  slot: Slot;
  onBook: (slot: Slot) => void;
  isSelfEmployed?: boolean;
  onVerifyNpd?: () => void;
}) {
  const [status, setStatusLocal] = useState<BookingStatus>("none");

  useEffect(() => {
    const rec = getBooking(slot.id);
    setStatusLocal(rec.status);
  }, [slot.id]);

  const isPremium = slot.pay >= 3500;
  const illustrationUrl = getIllustrationUrl(slot.type);

  const handleAction = () => {
    if (isSelfEmployed) {
      onBook(slot);
    } else if (onVerifyNpd) {
      onVerifyNpd();
    }
  };

  return (
    <div className={cn(uiCard, "p-4 hover:shadow-md hover:border-zinc-300")}>
      {/* Верх */}
      <div className="flex gap-3">

        {slot.logoUrl && (
          <img
            src={slot.logoUrl}
            alt={slot.objectName || slot.company}
            className="
              h-11
              w-11

              rounded-xl
              object-cover

              border
              border-zinc-100

              shrink-0
            "
          />
        )}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <div
              className="
                min-w-0

                text-base
                font-semibold

                truncate
              "
            >
              {slot.title}
            </div>

            {slot.hot && (
              <Flame className="h-4 w-4 text-red-500 shrink-0" />
            )}

            {isPremium && (
              <span
                className="
                  inline-flex
                  items-center

                  rounded-full

                  bg-sky-50

                  px-2 py-0.5

                  text-xs
                  font-medium

                  text-sky-700
                "
              >
                Премиум
              </span>
            )}

            {status === "booked" && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Записан
              </span>
            )}

            {status === "cancelled" && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                Отменено
              </span>
            )}

            {status === "completed" && (
              <span className="inline-flex items-center rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
                Завершено
              </span>
            )}

          </div>

          <div
            className="
              mt-1

              text-sm
              text-zinc-600

              truncate
            "
          >
            {slot.objectName || slot.company}
            {" · "}
            {slot.city}
          </div>

        </div>

        {/* Иллюстрация */}
        <img
          src={illustrationUrl}
          alt={slot.type}
          className="
            h-12
            w-12

            rounded-2xl

            object-cover

            shrink-0
          "
        />

      </div>

      {/* Теги */}
      <div className="mt-2 flex flex-wrap gap-2">

        {slot.tags.map((t) => (
          <Badge key={t}>
            {t}
          </Badge>
        ))}

      </div>

      {/* Адрес */}
      <div
        className="
          mt-2

          text-sm
          text-zinc-600

          truncate
        "
      >
        {slot.address}
      </div>

      {/* Низ */}
      {status === "booked" ? (
        <div className="mt-3 grid gap-2">

          <button
            onClick={() => {
              setBooking(
                slot.id,
                "cancelled"
              );

              setStatusLocal(
                "cancelled"
              );
            }}
            className={cn(
              uiButtonGhost,
              "w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900"
            )}
          >
            Отменить запись
          </button>

          <button
            onClick={() => {
              setBooking(
                slot.id,
                "completed"
              );

              setStatusLocal(
                "completed"
              );
            }}
            className={cn(
              uiButtonPrimary,
              "w-full rounded-xl px-4 py-3 text-sm font-medium"
            )}
          >
            Отметить как завершено
          </button>

        </div>
      ) : status === "completed" ? (

        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
          Смена завершена
        </div>

      ) : (

        <div className="mt-3 flex items-end gap-3">

          <button
            onClick={handleAction}
            className={cn(
              uiButtonPrimary,
              "w-[70%] rounded-xl px-4 py-3 text-sm font-medium",
              !isSelfEmployed && "border border-[#c29cf2] bg-white text-[#c29cf2] hover:bg-[#c29cf2]/5"
            )}
          >
            {isSelfEmployed ? "Записаться" : "Подтвердить НПД"}
          </button>

          {/* цена + время */}
          <div
            className="
              flex
              flex-col

              items-end

              shrink-0
            "
          >

            <div
              className="
                whitespace-nowrap

                text-base
                font-semibold
              "
            >
              {formatMoneyRub(
                slot.pay
              )}
            </div>

            <div
              className="
                mt-1

                text-xs
                text-zinc-500
              "
            >
              {slot.time}
            </div>

          </div>

        </div>

      )}

    </div>
  );
}
