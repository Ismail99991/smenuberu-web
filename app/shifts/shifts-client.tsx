"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DayTabs from "@/components/day-tabs";
import SlotCard from "@/components/slot-card";
import BookingModal from "@/components/booking-modal";
import { addDays, getMockSlots, toISODateLocal } from "@/lib/slots";
import type { Slot } from "@/lib/slots";

function getDaysWindow(from: Date, windowDays = 14) {
  const out: string[] = [];
  for (let i = 0; i < windowDays; i++) out.push(toISODateLocal(addDays(from, i)));
  return out;
}

// авто-обновление “сегодня” в полночь
function useAutoTodayRollover(onRollover: (now: Date) => void) {
  useEffect(() => {
    const tick = () => onRollover(new Date());

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      2
    );
    const msToMidnight = nextMidnight.getTime() - now.getTime();

    const t1 = window.setTimeout(() => {
      tick();
      const t2 = window.setInterval(tick, 60_000);
      // cleanup for interval
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t1 as any)._t2 = t2;
    }, msToMidnight);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybe = (t1 as any)?._t2 as number | undefined;
      if (maybe) window.clearInterval(maybe);
      window.clearTimeout(t1);
    };
  }, [onRollover]);
}

export default function ShiftsClient() {
  const [q, setQ] = useState("");
  const [today, setToday] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string>(() => toISODateLocal(new Date()));

  // окно дней 14 дней
  const days = useMemo(() => getDaysWindow(today, 14), [today]);

  // мок-слоты на окно
  const slots = useMemo(() => getMockSlots(today, 14), [today]);

  // red notch (горящие дни)
  const hotDays = useMemo(() => {
    const s = new Set<string>();
    for (const x of slots) if (x.hot) s.add(x.date);
    return s;
  }, [slots]);

  // blue notch (высокий тариф)
  const premiumDays = useMemo(() => {
    const s = new Set<string>();
    for (const x of slots) if (x.pay >= 3500) s.add(x.date);
    return s;
  }, [slots]);

  // полночь: пересчитать today + выбрать новый "сегодня"
  const handleRollover = useCallback((now: Date) => {
    setToday(now);
    setSelectedDay(toISODateLocal(now));
  }, []);
  useAutoTodayRollover(handleRollover);

  // если selectedDay выпал из окна (например, после rollover) — аккуратно поправим
  useEffect(() => {
    if (days.length === 0) return;
    if (!days.includes(selectedDay)) {
      setSelectedDay(days[0]);
    }
  }, [days, selectedDay]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return slots
      .filter((x) => x.date === selectedDay)
      .filter((x) => {
        if (!s) return true;
        return [x.title, x.company, x.city].some((v) => v.toLowerCase().includes(s));
      });
  }, [q, selectedDay, slots]);

  // модалка
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreset, setModalPreset] = useState<{ day: string; title?: string } | null>(null);

  const onClose = useCallback(() => setModalOpen(false), []);

  const openBooking = useCallback((slot: Slot) => {
    setModalPreset({ day: slot.date, title: slot.title });
    setModalOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <DayTabs
        days={days}
        value={selectedDay}
        onChange={setSelectedDay}
        hotDays={hotDays}
        premiumDays={premiumDays}
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск: профессия, компания, город…"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
          На выбранную дату слотов нет. Листай дни табами сверху.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onBook={openBooking} />
          ))}
        </div>
      )}

      <BookingModal
        open={modalOpen}
        onClose={onClose}
        days={days}
        slots={slots}
        hotDays={hotDays}
        premiumDays={premiumDays}
        initialDay={modalPreset?.day ?? selectedDay}
        initialTitle={modalPreset?.title}
      />
    </div>
  );
}
