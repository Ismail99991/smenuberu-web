"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DayTabs from "@/components/day-tabs";
import type { Slot } from "@/lib/slots";
import { getBooking, setBooking } from "@/lib/booking-state";
import { formatMoneyRub } from "@/lib/slots";
import { cn } from "@/lib/cn";
import {
  uiCard,
  uiOverlay,
  uiModal,
  uiTransition,
  uiButtonGhost,
  uiButtonPrimary,
} from "@/lib/ui";

type Range = { start: number; end: number }; // minutes

function parseRangeMinutes(timeRange: string): Range {
  const [aRaw, bRaw] = timeRange.split("–").map((x) => x.trim());
  const [ah, am] = (aRaw ?? "00:00").split(":").map(Number);
  const [bh, bm] = (bRaw ?? "00:00").split(":").map(Number);
  const start = (ah || 0) * 60 + (am || 0);
  const end = (bh || 0) * 60 + (bm || 0);
  return { start, end };
}

function overlaps(a: Range, b: Range) {
  return a.start < b.end && b.start < a.end;
}

export default function BookingModal({
  open,
  onClose,
  days,
  slots,
  hotDays,
  premiumDays,
  initialDay,
  initialTitle,
}: {
  open: boolean;
  onClose: () => void;
  days: string[];
  slots: Slot[];
  hotDays: Set<string>;
  premiumDays: Set<string>;
  initialDay: string;
  initialTitle?: string;
}) {
  const [day, setDay] = useState(initialDay);
  const [selected, setSelected] = useState<string[]>([]);
  const [onlyConsecutive, setOnlyConsecutive] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (open) {
      setDay(initialDay);
      setSelected([]);
      setOnlyConsecutive(true);
      setError(null);
    }
  }, [open, initialDay]);

  const daySlots = useMemo(() => {
    const list = slots.filter((s) => s.date === day);
    return list.sort(
      (a, b) => parseRangeMinutes(a.time).start - parseRangeMinutes(b.time).start
    );
  }, [slots, day]);

  const idsOrdered = useMemo(() => daySlots.map((s) => s.id), [daySlots]);

  const daySlotById = useMemo(() => {
    const m = new Map<string, Slot>();
    for (const s of daySlots) m.set(s.id, s);
    return m;
  }, [daySlots]);

  const selectedSlots = useMemo(
    () => selected.map((id) => daySlotById.get(id)).filter(Boolean) as Slot[],
    [selected, daySlotById]
  );

  const totalPay = useMemo(
    () => selectedSlots.reduce((sum, s) => sum + s.pay, 0),
    [selectedSlots]
  );

  const isBooked = (slotId: string) => getBooking(slotId).status === "booked";

  const canSelectWithoutOverlap = (slotId: string) => {
    const slot = daySlotById.get(slotId);
    if (!slot) return false;

    const r = parseRangeMinutes(slot.time);

    for (const sid of selected) {
      if (sid === slotId) continue;
      const other = daySlotById.get(sid);
      if (!other) continue;
      if (overlaps(r, parseRangeMinutes(other.time))) return false;
    }

    for (const s of daySlots) {
      if (!isBooked(s.id)) continue;
      if (s.id === slotId) continue;
      if (overlaps(r, parseRangeMinutes(s.time))) return false;
    }

    return true;
  };

  const canAddConsecutive = (slotId: string) => {
    if (!onlyConsecutive) return true;
    if (selected.length === 0) return true;

    const idx = idsOrdered.indexOf(slotId);
    if (idx === -1) return false;

    const selectedIdxs = selected
      .map((x) => idsOrdered.indexOf(x))
      .filter((x) => x >= 0)
      .sort((a, b) => a - b);

    const min = selectedIdxs[0];
    const max = selectedIdxs[selectedIdxs.length - 1];
    return idx === min - 1 || idx === max + 1;
  };

  const canSelect = (slotId: string) => {
    if (selected.includes(slotId)) return true;
    if (isBooked(slotId)) return false;
    if (!canSelectWithoutOverlap(slotId)) return false;
    if (!canAddConsecutive(slotId)) return false;
    return true;
  };

  const toggle = (slotId: string) => {
    setSelected((prev) => {
      if (prev.includes(slotId)) {
        setError(null);
        return prev.filter((x) => x !== slotId);
      }

      if (!canSelect(slotId)) {
        if (isBooked(slotId)) {
          setError("Этот слот уже забронирован.");
        } else if (!canSelectWithoutOverlap(slotId)) {
          setError(
            "Нельзя выбрать: слот пересекается по времени с выбранным или уже забронированным."
          );
        } else if (!canAddConsecutive(slotId)) {
          setError(
            "В режиме “подряд” можно добавлять только соседние слоты (слева/справа)."
          );
        } else {
          setError("Нельзя выбрать этот слот.");
        }
        return prev;
      }

      setError(null);
      return [...prev, slotId];
    });
  };

  if (!open) return null;

  // ✅ Портал в body гарантирует, что модалка всегда поверх,
  // независимо от transform/stacking contexts выше по дереву.
  if (!mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay: перехватывает тачи/клики и закрывает модалку */}
      <div
        className={cn(uiOverlay, "touch-none")}
        onClick={onClose}
      />

      {/* контейнер модалки */}
      <div className="absolute left-1/2 top-4 w-[min(560px,calc(100%-16px))] -translate-x-1/2">
        <div
          className={cn(
            uiCard,
            uiModal,
            // ✅ чтобы модалка могла скроллиться и не “упиралась” в высоту экрана
            "max-h-[calc(100dvh-32px)] overflow-hidden"
          )}
          data-open
          // ✅ чтобы клики/свайпы внутри не уходили на overlay
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4">
            <div>
              <div className="text-sm text-zinc-500">Запись на слоты</div>
              <div className="text-base font-semibold">
                {initialTitle ?? "Выбери дату и слоты"}
              </div>
            </div>

            <button
              onClick={onClose}
              className={cn(uiButtonGhost, "border border-zinc-200 rounded-xl px-3 py-2 text-sm")}
            >
              Закрыть
            </button>
          </div>

          {/* ✅ вот тут делаем нормальный вертикальный скролл */}
          <div
            className={cn(
              "space-y-3 p-4",
              "overflow-y-auto",
              "overscroll-contain",
              "touch-pan-y"
            )}
            style={{
              WebkitOverflowScrolling: "touch",
              maxHeight: "calc(100dvh - 32px - 72px)", // экран - отступы - хедер (прибл.)
            }}
          >
            <DayTabs
              days={days}
              value={day}
              onChange={(d) => {
                setDay(d);
                setSelected([]);
                setError(null);
              }}
              hotDays={hotDays}
              premiumDays={premiumDays}
            />

            <div className={cn(uiCard, "p-3")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Выбирать “подряд”</div>
                  <div className="text-xs text-zinc-500">
                    Вкл — только соседние слоты, плюс запрет пересечений по времени.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOnlyConsecutive((v) => !v);
                    setSelected([]);
                    setError(null);
                  }}
                  className={cn(
                    uiButtonGhost,
                    "border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                  )}
                >
                  {onlyConsecutive ? "Вкл" : "Выкл"}
                </button>
              </div>
            </div>

            {error && (
              <div
                className={cn(
                  uiTransition,
                  "rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
                )}
              >
                {error}
              </div>
            )}

            {daySlots.length === 0 ? (
              <div className={cn(uiCard, "p-4 text-sm text-zinc-600")}>
                На этот день слотов нет. Листай табы сверху.
              </div>
            ) : (
              <div className="space-y-2">
                {daySlots.map((s) => {
                  const checked = selected.includes(s.id);
                  const booked = isBooked(s.id);
                  const disabled = !checked && !canSelect(s.id);

                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle(s.id)}
                      disabled={disabled}
                      title={booked ? "Уже записан на этот слот" : undefined}
                      className={cn(
                        uiTransition,
                        "w-full rounded-2xl border p-4 text-left",
                        checked
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 bg-white hover:bg-zinc-50",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                uiTransition,
                                "inline-flex h-5 w-5 items-center justify-center rounded-md border text-xs",
                                checked
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : "border-zinc-300 bg-white"
                              )}
                            >
                              {checked ? "✓" : ""}
                            </span>

                            <div className="font-semibold">
                              {s.title}
                              {s.hot && (
                                <span className="ml-2 text-xs text-red-600">
                                  • горячий
                                </span>
                              )}
                              {s.pay >= 3500 && (
                                <span className="ml-2 text-xs text-sky-700">
                                  • высокий тариф
                                </span>
                              )}
                              {booked && (
                                <span className="ml-2 text-xs text-emerald-700">
                                  • уже записан
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-1 text-sm text-zinc-600">
                            {s.company} · {s.city}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold">{s.time}</div>
                          <div className="text-xs text-zinc-500">
                            {formatMoneyRub(s.pay)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className={cn(uiCard, "p-4 text-sm")}>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Выбрано слотов:</span>
                <span className="font-semibold">{selected.length}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-zinc-600">Итого оплата:</span>
                <span className="font-semibold">{formatMoneyRub(totalPay)}</span>
              </div>
            </div>

            <button
              disabled={selected.length === 0}
              onClick={() => {
                const ranges = selectedSlots.map((s) => ({
                  id: s.id,
                  r: parseRangeMinutes(s.time),
                }));
                for (let i = 0; i < ranges.length; i++) {
                  for (let j = i + 1; j < ranges.length; j++) {
                    if (overlaps(ranges[i].r, ranges[j].r)) {
                      setError(
                        "Есть пересекающиеся по времени слоты. Убери конфликт и попробуй снова."
                      );
                      return;
                    }
                  }
                }

                for (const id of selected) setBooking(id, "booked");
                onClose();
              }}
              className={cn(
                uiButtonPrimary,
                "w-full rounded-xl px-4 py-3 text-sm font-medium",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Подтвердить запись ({selected.length})
            </button>

            <div className="text-xs text-zinc-500">
              UI-only: бронь сохраняется в localStorage. Пересечения по времени запрещены.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
