"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, ChevronRight, Users, Trophy, Sparkles, ChevronLeft } from "lucide-react";
import DayTabs from "@/components/day-tabs";
import SlotCard from "@/components/slot-card";
import BookingModal from "@/components/booking-modal";
import SortFilterModal, {
  type TaskFilters,
  type SortKey,
} from "@/components/sort-filter-modal";
import { addDays, getMockSlots, getSlotsFromApi, toISODateLocal } from "@/lib/slots";
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
    sort: "relevance",
  });

  // карусель баннеров
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Обработчик начала касания
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Обработчик движения касания
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Обработчик окончания свайпа
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Минимальное расстояние свайпа
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      // Свайп влево → следующий баннер
      setCurrentBanner(prev => (prev === 1 ? 0 : prev + 1));
    }
    
    if (isRightSwipe) {
      // Свайп вправо → предыдущий баннер
      setCurrentBanner(prev => (prev === 0 ? 1 : prev - 1));
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
      <div
        className="
          rounded-2xl border border-zinc-200 bg-white/90 p-3
          shadow-[0_10px_28px_rgba(0,0,0,0.06)]
          backdrop-blur
        "
      >
        <div className="flex items-center justify-between gap-2">
          {!showSearch ? (
            <div className="text-sm font-semibold">Задания</div>
          ) : (
            <div className="flex w-full items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск: профессия, компания, город…"
                className="
                  w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none
                  transition-[border-color,box-shadow] duration-200
                  focus:border-brand/30 focus:ring-2 focus:ring-brand/20
                "
                autoFocus
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSearch((v) => !v);
                if (showSearch) setQ(""); // при сворачивании очищаем
              }}
              className="
                tap inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2
                transition-[box-shadow,transform] duration-200
                active:shadow-[0_10px_22px_rgba(0,0,0,0.10)]
              "
              aria-label="Поиск"
              title="Поиск"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={() => setFilterOpen(true)}
              className="
                tap inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2
                transition-[box-shadow,transform] duration-200
                active:shadow-[0_10px_22px_rgba(0,0,0,0.10)]
              "
              aria-label="Сортировать и фильтровать"
              title="Сортировать и фильтровать"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* небольшая строка статуса */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
          {filters.onlyHot ? (
            <span className="rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5">
              горящие
            </span>
          ) : null}
          {filters.onlyPremium ? (
            <span className="rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5">
              высокий тариф
            </span>
          ) : null}
          {filters.types.length ? (
            <span className="rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5">
              типов: {filters.types.length}
            </span>
          ) : null}
          {filters.sort !== "relevance" ? (
            <span className="rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5">
              сорт: {filters.sort}
            </span>
          ) : null}
        </div>
      </div>

      {/* НОВЫЙ РАЗДЕЛ: АКЦИИ (карусель с свайпом) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">Акции</div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentBanner(0)}
              disabled={currentBanner === 0}
              className="tap rounded-xl border border-zinc-200 bg-white p-2 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Предыдущий баннер"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentBanner(1)}
              disabled={currentBanner === 1}
              className="tap rounded-xl border border-zinc-200 bg-white p-2 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Следующий баннер"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Карусель баннеров */}
        <div className="relative overflow-hidden rounded-xl">
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Баннер 1: Выполни 10 заданий */}
            <div className="w-full flex-shrink-0">
              <div className="relative h-full min-h-[156px] overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                {/* Декоративные элементы */}
                <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/20"></div>
                <Sparkles className="absolute top-3 right-3 h-5 w-5 text-amber-400/50" />
                
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-600" />
                        <div className="text-xs font-semibold text-zinc-900">Спецзадание</div>
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-zinc-900">
                        Выполни 10 заданий и получи <span className="text-green-600">10 000 ₽</span>
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-600">
                        До конца акции осталось: 7 дней
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {/* навигация в раздел акций */}}
                      className="tap shrink-0 self-start rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200"
                      title="Подробнее об акции"
                      aria-label="Подробнее об акции"
                    >
                      <div className="flex items-center gap-1">
                        <span>Подробнее</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>
                  </div>
                  
                  <div className="mt-auto pt-3">
                    <div className="mb-1 text-[11px] text-zinc-500">Прогресс: 6/10 заданий</div>
                    <div className="h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Баннер 2: Реферальная программа */}
            <div className="w-full flex-shrink-0">
              <div className="relative h-full min-h-[156px] overflow-hidden rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 p-4">
                {/* Декоративные элементы */}
                <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-sky-200/40 to-indigo-200/20"></div>
                
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-sky-600" />
                        <div className="text-xs font-semibold text-zinc-900">Пригласи друга</div>
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-zinc-900">
                        Получи <span className="text-green-600">3 000 ₽</span> за каждого друга
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-600">
                        Друг тоже получит 1 000 ₽ на первый заказ
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {/* открыть модалку с реферальной ссылкой */}}
                      className="tap shrink-0 self-start rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-sky-700 border border-sky-200"
                      title="Получить реферальную ссылку"
                      aria-label="Получить реферальную ссылку"
                    >
                      <div className="flex items-center gap-1">
                        <span>Получить ссылку</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>
                  </div>
                  
                  <div className="mt-auto pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-xs">
                        <div className="text-[11px] text-zinc-500">Приглашено друзей:</div>
                        <div className="text-sm font-semibold text-sky-700">2</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-[11px] text-zinc-500">Заработано:</div>
                        <div className="text-sm font-semibold text-green-600">6 000 ₽</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-center">
                      <div className="inline-block rounded-lg bg-white/80 backdrop-blur-sm border border-sky-200 px-2 py-1">
                        <div className="text-[10px] font-mono text-sky-700">REF:USER789</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Точки навигации */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                currentBanner === index 
                  ? "w-6 bg-zinc-800" 
                  : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Перейти к баннеру ${index + 1}`}
            />
          ))}
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
        month={month} // 👈 передаём месяц
        availableDays={availableDays}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

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
