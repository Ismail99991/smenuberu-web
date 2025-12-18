"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import DayTabs from "@/components/day-tabs";
import SlotCard from "@/components/slot-card";
import BookingModal from "@/components/booking-modal";
import MonthCalendar from "@/components/month-calendar";
import SortFilterModal, { type TaskFilters, type SortKey } from "@/components/sort-filter-modal";
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
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
    const msToMidnight = nextMidnight.getTime() - now.getTime();

    const t1 = window.setTimeout(() => {
      tick();
      const t2 = window.setInterval(tick, 60_000);
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

// детерминированная “псевдо-близость” (пока нет геолокации)
function pseudoNearScore(slot: Slot) {
  const s = `${slot.city}|${slot.address}|${slot.company}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function ShiftsClient() {
  // поиск (сворачиваемый)
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");

  const [today, setToday] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string>(() => toISODateLocal(new Date()));

  // календарь месяца (раскрывающийся)
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => new Date());

  // сорт/фильтр
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    onlyHot: false,
    onlyPremium: false,
    types: [],
    sort: "relevance"
  });

  // окно дней 14 дней
  const days = useMemo(() => getDaysWindow(today, 14), [today]);

  // мок-слоты на окно
  const slots = useMemo(() => getMockSlots(today, 14), [today]);

  // дни с любыми слотами (чтобы в месяце можно приглушать пустые)
  const availableDays = useMemo(() => new Set(slots.map((s) => s.date)), [slots]);

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
    const iso = toISODateLocal(now);
    setSelectedDay(iso);
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);
  useAutoTodayRollover(handleRollover);

  // если selectedDay выпал из окна — аккуратно поправим
  useEffect(() => {
    if (days.length === 0) return;
    if (!days.includes(selectedDay)) setSelectedDay(days[0]);
  }, [days, selectedDay]);

  // синхронизируем отображаемый месяц с выбранной датой
  useEffect(() => {
    const [y, m] = selectedDay.split("-").map(Number);
    if (!y || !m) return;
    setMonth(new Date(y, m - 1, 1));
  }, [selectedDay]);

  // слоты выбранного дня + поиск + фильтры + сортировка
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = slots.filter((x) => x.date === selectedDay);

    // поиск
    if (s) {
      list = list.filter((x) =>
        [x.title, x.company, x.city, x.address].some((v) => v.toLowerCase().includes(s))
      );
    }

    // фильтры
    if (filters.onlyHot) list = list.filter((x) => !!x.hot);
    if (filters.onlyPremium) list = list.filter((x) => x.pay >= 3500);
    if (filters.types.length) list = list.filter((x) => filters.types.includes(x.type));

    // сортировка
    const sort: SortKey = filters.sort;
    if (sort === "pay_desc") list = [...list].sort((a, b) => b.pay - a.pay);
    else if (sort === "pay_asc") list = [...list].sort((a, b) => a.pay - b.pay);
    else if (sort === "premium_first") {
      list = [...list].sort((a, b) => {
        const ap = a.pay >= 3500 ? 1 : 0;
        const bp = b.pay >= 3500 ? 1 : 0;
        if (bp !== ap) return bp - ap;
        return b.pay - a.pay; // внутри — по цене
      });
    } else if (sort === "near") {
      list = [...list].sort((a, b) => pseudoNearScore(a) - pseudoNearScore(b));
    }

    return list;
  }, [q, selectedDay, slots, filters]);

  // модалка бронирования
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreset, setModalPreset] = useState<{ day: string; title?: string } | null>(null);

  const onCloseBooking = useCallback(() => setModalOpen(false), []);

  const openBooking = useCallback((slot: Slot) => {
    setModalPreset({ day: slot.date, title: slot.title });
    setModalOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Верхняя панель: поиск (сворачиваемый) + фильтры */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          {!showSearch ? (
            <div className="text-sm font-semibold">Задания</div>
          ) : (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск: профессия, компания, город…"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              autoFocus
            />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSearch((v) => !v);
                if (showSearch) setQ(""); // при сворачивании очищаем
              }}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2"
              aria-label="Поиск"
              title="Поиск"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2"
              aria-label="Сортировать и фильтровать"
              title="Сортировать и фильтровать"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* небольшая строка статуса */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
          {filters.onlyHot ? <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">горящие</span> : null}
          {filters.onlyPremium ? <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">высокий тариф</span> : null}
          {filters.types.length ? (
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
              типов: {filters.types.length}
            </span>
          ) : null}
          {filters.sort !== "relevance" ? (
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
              сорт: {filters.sort}
            </span>
          ) : null}
        </div>
      </div>

      {/* Табы + кнопка месяца (внутри DayTabs уже есть кнопка справа) */}
      <DayTabs
        days={days}
        value={selectedDay}
        onChange={(iso) => setSelectedDay(iso)}
        hotDays={hotDays}
        premiumDays={premiumDays}
        calendarOpen={calendarOpen}
        onToggleCalendar={() => setCalendarOpen((v) => !v)}
      />

      {/* Раскрывающийся календарь месяца */}
      {calendarOpen ? (
        <MonthCalendar
          month={month}
          value={selectedDay}
          onChange={(iso) => {
            setSelectedDay(iso);
            setCalendarOpen(false);
          }}
          availableDays={availableDays}
          hotDays={hotDays}
          premiumDays={premiumDays}
        />
      ) : null}

      {/* Список */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
          На выбранную дату слотов нет (или они отфильтрованы).
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
        onClose={onCloseBooking}
        days={days}
        slots={slots}
        hotDays={hotDays}
        premiumDays={premiumDays}
        initialDay={modalPreset?.day ?? selectedDay}
        initialTitle={modalPreset?.title}
      />

      <SortFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onChange={setFilters}
      />
    </div>
  );
}
