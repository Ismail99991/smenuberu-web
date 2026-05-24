"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Users,
  Trophy,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";
import DayTabs from "@/components/day-tabs";
import SlotCard from "@/components/slot-card";
import BookingModal from "@/components/booking-modal";
import SortFilterModal, {
  type TaskFilters,
  type SortKey,
} from "@/components/sort-filter-modal";
import { addDays, getMockSlots, getSlotsFromApi, toISODateLocal } from "@/lib/slots";
import type { Slot } from "@/lib/slots";
import EmptyState from "@/components/empty-state";
import SearchBar from "@/components/search-bar";
import PromoBanner from "@/components/promo-banner";

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
  const router = useRouter();

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
    sort: "relevance",
  });

  // карусель баннеров — удаляем, оставляем только переменные, чтобы не сломать код
  // они больше не используются, но оставляем чтобы не менять логику
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentBanner((prev) => (prev === 1 ? 0 : prev + 1));
    }

    if (isRightSwipe) {
      setCurrentBanner((prev) => (prev === 0 ? 1 : prev - 1));
    }
  };

  // окно дней 14 дней
  const days = useMemo(() => getDaysWindow(today, 14), [today]);

  // мок-слоты на окно
  const [slots, setSlots] = useState<Slot[]>(() => getMockSlots(today, 14));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const apiSlots = await getSlotsFromApi();
        if (!cancelled && apiSlots.length > 0) {
          setSlots(apiSlots);
        }
      } catch {
        // тихо остаёмся на моках
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [today]);

  // ✅ pull-to-refresh (обновление слотов вручную)
  const refreshSlots = useCallback(async () => {
    try {
      const apiSlots = await getSlotsFromApi();
      if (apiSlots?.length) {
        setSlots(apiSlots);
        return;
      }
      // если API вернул пусто — оставим текущие данные
    } catch {
      // мягкий фоллбек: перегенерим моки на текущее окно
      setSlots(getMockSlots(today, 14));
    }
  }, [today]);

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

  // навигация по месяцам в календаре
  const handlePrevMonth = useCallback(() => {
    const prev = new Date(month);
    prev.setMonth(prev.getMonth() - 1);
    setMonth(prev);
  }, [month]);

  const handleNextMonth = useCallback(() => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + 1);
    setMonth(next);
  }, [month]);

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

  // NEW: метрики “Сегодня” (и для выбранного дня тоже)
  const todayIso = useMemo(() => toISODateLocal(today), [today]);

  const statsToday = useMemo(() => {
    const list = slots.filter((x) => x.date === todayIso);
    const total = list.length;
    const hot = list.filter((x) => !!x.hot).length;
    const premium = list.filter((x) => x.pay >= 3500).length;
    const bestPay = list.reduce((m, x) => Math.max(m, x.pay), 0);
    return { total, hot, premium, bestPay };
  }, [slots, todayIso]);

  const statsSelected = useMemo(() => {
    const list = slots.filter((x) => x.date === selectedDay);
    const total = list.length;
    const hot = list.filter((x) => !!x.hot).length;
    const premium = list.filter((x) => x.pay >= 3500).length;
    const bestPay = list.reduce((m, x) => Math.max(m, x.pay), 0);
    return { total, hot, premium, bestPay };
  }, [slots, selectedDay]);

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
        return b.pay - a.pay;
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
    <PullToRefresh onRefresh={refreshSlots}>
      <div className="space-y-4 pb-24">
        {/* Поиск + фильтры */}
        <SearchBar
          q={q}
          onSearchChange={setQ}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch(!showSearch)}
          onOpenFilters={() => setFilterOpen(true)}
          filters={filters}
        />

        {/* Баннер акции */}
        <PromoBanner />

        {/* Табы */}
        <DayTabs
          days={days}
          value={selectedDay}
          onChange={(iso) => setSelectedDay(iso)}
          hotDays={hotDays}
          premiumDays={premiumDays}
          calendarOpen={calendarOpen}
          onToggleCalendar={() => setCalendarOpen((v) => !v)}
          month={month}
          availableDays={availableDays}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Список слотов */}
        {filtered.length === 0 ? (
          <EmptyState
  title="Нет заданий"
  description="На выбранную дату слотов нет или они отфильтрованы"
  imageUrl="https://smenuberu.s3.regru.cloud/illustrations/emptystate.png"
/>
        ) : (
          <div className="space-y-3" data-ptr-skip>
            {filtered.map((slot) => (
              <div
                key={slot.id}
                className="space-y-2"
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  const target = e.target as HTMLElement | null;
                  if (
                    target?.closest?.(
                      'button, a, input, textarea, select, label, [role="button"], [data-no-card-nav]'
                    )
                  ) {
                    return;
                  }
                  router.push(`/shifts/${slot.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/shifts/${slot.id}`);
                  }
                }}
              >
                <SlotCard slot={slot} onBook={openBooking} />
              </div>
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
    </PullToRefresh>
  );
}