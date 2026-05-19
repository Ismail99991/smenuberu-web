"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Home, 
  Calendar, 
  Users, 
  Building, 
  Briefcase, 
  Bus, 
  Utensils,
  Flame,
  TrendingUp,
  Wifi,
  Bath,
  ParkingCircle,
  Bed,
  Coffee,
  Star,
  Clock,
  Wallet,
  Luggage,
  Shield,
  Heart
} from "lucide-react";
import DayTabs from "@/components/day-tabs";
import BookingModal from "@/components/booking-modal";
import SortFilterModalTours, { type TourFilters, type TourSortKey } from "@/components/sort-filter-modal-tours";
import { addDays, toISODateLocal } from "@/lib/slots";
import { cn } from "@/lib/cn";
import type { Slot as BaseSlot } from "@/lib/slots";

// Тип для туров/вахт - НЕЗАВИСИМЫЙ тип
interface TourSlot {
  id: string;
  title: string;
  company: string;
  city: string;
  address: string;
  date: string;
  time: string;
  pay: number;
  type: "construction" | "agriculture" | "factory" | "service" | "other";
  tags: string[];
  hot: boolean;
  
  // Дополнительные поля для туров
  region: string;
  duration: string;
  totalPay: number;
  accommodation: "hostel" | "hotel" | "apartment" | "camp" | "dormitory";
  accommodationName: string;
  durationDays: number;
  mealsIncluded: boolean;
  transferProvided: boolean;
  requirements?: string[];
  description?: string;
}

// Функция преобразования TourSlot в BaseSlot для BookingModal
const convertTourToSlot = (tour: TourSlot): BaseSlot => ({
  id: tour.id,
  title: tour.title,
  company: tour.company,
  city: tour.city,
  address: tour.address,
  date: tour.date,
  time: tour.time,
  pay: tour.pay,
  type: tour.type as any,
  tags: tour.tags,
  hot: tour.hot
});

// Мок-данные для туров
const mockTourSlots: TourSlot[] = [
  {
    id: "t1",
    title: "Сезонная работа на виноградниках",
    company: "Агро-Виноград",
    city: "Анапа",
    region: "Краснодарский край",
    address: "с. Виноградное, ул. Винодельческая, 45",
    date: toISODateLocal(new Date()),
    time: "8:00-17:00",
    duration: "3 месяца • 8ч/день",
    pay: 45000,
    totalPay: 135000,
    type: "agriculture",
    tags: ["сельское хозяйство", "сезонная", "проживание", "питание"],
    hot: true,
    accommodation: "camp",
    accommodationName: "Рабочий лагерь 'Виноградник'",
    durationDays: 90,
    mealsIncluded: true,
    transferProvided: true,
    requirements: ["Трудолюбие", "Выносливость", "Готовность к физическому труду"]
  },
  {
    id: "t2",
    title: "Вахта на стройке жилого комплекса",
    company: "Строй-Инвест",
    city: "Сочи",
    region: "Краснодарский край",
    address: "ул. Олимпийская, 12",
    date: toISODateLocal(addDays(new Date(), 3)),
    time: "7:00-18:00",
    duration: "2 месяца • 10ч/день",
    pay: 60000,
    totalPay: 120000,
    type: "construction",
    tags: ["стройка", "вахта", "высокий доход", "трансфер"],
    hot: false,
    accommodation: "hostel",
    accommodationName: "Хостел 'Строитель'",
    durationDays: 60,
    mealsIncluded: true,
    transferProvided: true,
    requirements: ["Опыт работы", "Медицинская книжка"]
  },
  {
    id: "t3",
    title: "Работа на рыбном заводе",
    company: "Дальневосточный рыбпром",
    city: "Владивосток",
    region: "Приморский край",
    address: "порт 'Рыбацкий', терминал 3",
    date: toISODateLocal(addDays(new Date(), 7)),
    time: "6:00-18:00",
    duration: "45 дней • 12ч/смена",
    pay: 80000,
    totalPay: 120000,
    type: "factory",
    tags: ["рыбзавод", "вахта", "гостиница", "питание"],
    hot: true,
    accommodation: "hotel",
    accommodationName: "Гостиница 'Моряк'",
    durationDays: 45,
    mealsIncluded: true,
    transferProvided: true,
    description: "Работа в цехе переработки рыбы. Предоставляется спецодежда."
  },
  {
    id: "t4",
    title: "Сбор ягод в Карелии",
    company: "Северные Дары",
    city: "Петрозаводск",
    region: "Республика Карелия",
    address: "д. Ягодное, ул. Лесная, 8",
    date: toISODateLocal(addDays(new Date(), 14)),
    time: "9:00-17:00",
    duration: "1 месяц • 8ч/день",
    pay: 35000,
    totalPay: 35000,
    type: "agriculture",
    tags: ["сбор ягод", "сезонная", "природа", "общежитие"],
    hot: false,
    accommodation: "dormitory",
    accommodationName: "Общежитие 'Лесное'",
    durationDays: 30,
    mealsIncluded: false,
    transferProvided: false,
    description: "Сбор диких ягод в лесах Карелии. Проживание в деревянных домиках."
  },
  {
    id: "t5",
    title: "Обслуживание горнолыжного курорта",
    company: "Альпийские склоны",
    city: "Красная Поляна",
    region: "Краснодарский край",
    address: "горнолыжный курорт 'Эльбрус'",
    date: toISODateLocal(addDays(new Date(), 21)),
    time: "8:00-14:00",
    duration: "4 месяца • 6ч/день",
    pay: 40000,
    totalPay: 160000,
    type: "service",
    tags: ["курорт", "сезонная", "апартаменты", "ски-пасс"],
    hot: true,
    accommodation: "apartment",
    accommodationName: "Апартаменты 'Горные вершины'",
    durationDays: 120,
    mealsIncluded: false,
    transferProvided: true,
    description: "Работа на горнолыжном курорте: обслуживание подъемников, работа в кафе."
  }
];

function getDaysWindow(from: Date, windowDays = 60) {
  const out: string[] = [];
  for (let i = 0; i < windowDays; i++) out.push(toISODateLocal(addDays(from, i)));
  return out;
}

// авто-обновление "сегодня" в полночь
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

export default function ToursPage() {
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");
  const [today, setToday] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string>(() => toISODateLocal(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TourFilters>({
    onlyHot: false,
    onlyPremium: false,
    types: [],
    sort: "relevance",
    accommodation: [],
    withMeals: false,
    withTransfer: false
  });
  const [slots] = useState<TourSlot[]>(() => mockTourSlots);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreset, setModalPreset] = useState<{ day: string; title?: string } | null>(null);

  const days = useMemo(() => getDaysWindow(today, 60), [today]);

  const availableDays = useMemo(() => new Set(slots.map((s) => s.date)), [slots]);
  const hotDays = useMemo(() => {
    const s = new Set<string>();
    for (const x of slots) if (x.hot) s.add(x.date);
    return s;
  }, [slots]);
  const premiumDays = useMemo(() => {
    const s = new Set<string>();
    for (const x of slots) if (x.totalPay >= 100000) s.add(x.date);
    return s;
  }, [slots]);

  const handleRollover = useCallback((now: Date) => {
    setToday(now);
    const iso = toISODateLocal(now);
    setSelectedDay(iso);
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);
  useAutoTodayRollover(handleRollover);

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

  useEffect(() => {
    if (days.length === 0) return;
    if (!days.includes(selectedDay)) setSelectedDay(days[0]);
  }, [days, selectedDay]);

  useEffect(() => {
    const [y, m] = selectedDay.split("-").map(Number);
    if (!y || !m) return;
    setMonth(new Date(y, m - 1, 1));
  }, [selectedDay]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = slots.filter((x) => x.date === selectedDay);

    if (s) {
      list = list.filter((x) =>
        [x.title, x.company, x.city, x.region, x.accommodationName, x.description].some((v) => 
          v?.toLowerCase().includes(s)
        )
      );
    }

    if (filters.onlyHot) list = list.filter((x) => !!x.hot);
    if (filters.onlyPremium) list = list.filter((x) => x.totalPay >= 100000);
    if (filters.types.length) list = list.filter((x) => filters.types.includes(x.type));
    if (filters.withMeals) list = list.filter((x) => x.mealsIncluded);
    if (filters.withTransfer) list = list.filter((x) => x.transferProvided);
    if (filters.accommodation && filters.accommodation.length > 0) {
      list = list.filter((x) => filters.accommodation!.includes(x.accommodation));
    }

    const sort = filters.sort;
    if (sort === "pay_desc") list = [...list].sort((a, b) => b.totalPay - a.totalPay);
    else if (sort === "pay_asc") list = [...list].sort((a, b) => a.totalPay - b.totalPay);
    else if (sort === "premium_first") {
      list = [...list].sort((a, b) => {
        const ap = a.totalPay >= 100000 ? 1 : 0;
        const bp = b.totalPay >= 100000 ? 1 : 0;
        if (bp !== ap) return bp - ap;
        return b.totalPay - a.totalPay;
      });
    } else if (sort === "duration_desc") {
      list = [...list].sort((a, b) => b.durationDays - a.durationDays);
    } else if (sort === "duration_asc") {
      list = [...list].sort((a, b) => a.durationDays - b.durationDays);
    }

    return list;
  }, [q, selectedDay, slots, filters]);

  const onCloseBooking = useCallback(() => setModalOpen(false), []);

  const openBooking = useCallback((slot: TourSlot) => {
    setModalPreset({ day: slot.date, title: slot.title });
    setModalOpen(true);
  }, []);

  const TourCard = ({ tour, onBook }: { tour: TourSlot; onBook: (slot: TourSlot) => void }) => {
    const accommodationIcons = {
      hostel: Home,
      hotel: Building,
      apartment: Home,
      camp: MapPin,
      dormitory: Building
    };
    
    const AccommodationIcon = accommodationIcons[tour.accommodation];

    return (
      <div className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-5",
        "hover:shadow-lg hover:border-zinc-300 transition-all duration-200"
      )}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-zinc-900">{tour.title}</div>
              </div>

              {tour.hot && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-50 to-orange-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
                  <Flame className="h-3 w-3" />
                  Горящий тур
                </span>
              )}

              {tour.totalPay >= 100000 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <TrendingUp className="h-3 w-3" />
                  Высокий доход
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-zinc-700">
                <Building className="h-4 w-4 text-zinc-500" />
                {tour.company}
              </div>
              <div className="flex items-center gap-1 text-zinc-700">
                <MapPin className="h-4 w-4 text-zinc-500" />
                {tour.city}, {tour.region}
              </div>
            </div>

            {/* Основные параметры */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div className="text-xs font-medium text-zinc-700">Длительность</div>
                </div>
                <div className="mt-1.5 text-lg font-bold text-zinc-900">{tour.duration}</div>
                <div className="mt-1 text-xs text-zinc-500">{tour.durationDays} дней</div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-white p-3">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-purple-600" />
                  <div className="text-xs font-medium text-zinc-700">Проживание</div>
                </div>
                <div className="mt-1.5 text-sm font-semibold text-zinc-900 truncate">
                  {tour.accommodationName}
                </div>
                <div className="mt-1 text-xs text-zinc-500 capitalize">
                  {tour.accommodation === 'dormitory' ? 'Общежитие' : tour.accommodation}
                </div>
              </div>
            </div>

            {/* Условия */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {tour.mealsIncluded && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2">
                  <Utensils className="h-3.5 w-3.5 text-green-600" />
                  <div className="text-xs font-medium text-green-700">Питание</div>
                </div>
              )}
              {tour.transferProvided && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2">
                  <Bus className="h-3.5 w-3.5 text-blue-600" />
                  <div className="text-xs font-medium text-blue-700">Трансфер</div>
                </div>
              )}
              {tour.requirements && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2">
                  <Shield className="h-3.5 w-3.5 text-amber-600" />
                  <div className="text-xs font-medium text-amber-700">Требования</div>
                </div>
              )}
            </div>

            {/* Тэги */}
            <div className="mt-4 flex flex-wrap gap-2">
              {tour.tags.map((tag) => (
                <span 
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Описание */}
            {tour.description && (
              <div className="mt-4 text-sm text-zinc-600">{tour.description}</div>
            )}
          </div>

          {/* Правая колонка с оплатой и кнопкой */}
          <div className="lg:w-48 lg:shrink-0">
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 text-white">
              <div className="text-xs text-zinc-300">Общий заработок</div>
              <div className="mt-1 text-2xl font-bold">
                {tour.totalPay.toLocaleString("ru-RU")} ₽
              </div>
              <div className="mt-2 text-xs text-zinc-300">
                ~{(tour.totalPay / tour.durationDays).toLocaleString("ru-RU")} ₽/день
              </div>
              <div className="mt-4 text-xs text-zinc-400">
                Начало: {new Date(tour.date).toLocaleDateString("ru-RU")}
              </div>
            </div>

            <button
              onClick={() => onBook(tour)}
              className={cn(
                "mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white",
                "hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] transition-all duration-200",
                "shadow-lg hover:shadow-xl"
              )}
            >
              Забронировать тур
            </button>

            {/* Кнопка жилья */}
            <Link
              href="/housing"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-all"
            >
              <Home className="h-4 w-4" />
              Найти жильё
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Герой-секция */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 text-white">
        <div className="relative z-10">
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Рабочие туры и вахты</h1>
              <p className="mt-2 text-blue-100 max-w-2xl">
                Длительные контракты с проживанием, питанием и полным обеспечением. 
                Зарабатывайте от 30 000 до 160 000 ₽ за одну поездку.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full bg-white/20 px-3 py-1.5 text-xs backdrop-blur-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Горные курорты
              </div>
              <div className="rounded-full bg-white/20 px-3 py-1.5 text-xs backdrop-blur-sm flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Сельское хозяйство
              </div>
              <div className="rounded-full bg-white/20 px-3 py-1.5 text-xs backdrop-blur-sm flex items-center gap-1">
                <Building className="h-3 w-3" />
                Строительство
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 blur-xl"></div>
      </div>

      {/* Поиск и фильтры */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ищите тур: виноградники, стройка, рыбзавод..."
                  className="
                    w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none
                    focus:border-blue-300 focus:ring-2 focus:ring-blue-200
                  "
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold text-zinc-900">Доступные рабочие туры</div>
                <div className="mt-1 text-sm text-zinc-500">
                  {slots.length} туров • от 30 дней
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSearch((v) => !v);
                if (showSearch) setQ("");
              }}
              className="tap flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm"
              aria-label="Поиск"
            >
              <Search className="h-4 w-4" />
              {!showSearch && "Поиск"}
            </button>

            <button
              onClick={() => setFilterOpen(true)}
              className="tap flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm"
              aria-label="Фильтры"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
            </button>

            {/* Кнопка Жильё */}
            <Link
              href="/housing"
              className="tap flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all"
            >
              <Home className="h-4 w-4" />
              Жильё
            </Link>
          </div>
        </div>

        {/* Активные фильтры */}
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.onlyHot && (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Только горящие
            </span>
          )}
          {filters.onlyPremium && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Высокий доход
            </span>
          )}
          {filters.withMeals && (
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 flex items-center gap-1">
              <Utensils className="h-3 w-3" />
              С питанием
            </span>
          )}
          {filters.withTransfer && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 flex items-center gap-1">
              <Bus className="h-3 w-3" />
              С трансфером
            </span>
          )}
          {filters.types.length > 0 && (
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
              Типов: {filters.types.length}
            </span>
          )}
        </div>
      </div>

      {/* Календарь */}
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

      {/* Список туров */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-blue-400" />
          </div>
          <div className="mt-4 text-lg font-semibold text-zinc-900">
            Туров на выбранную дату не найдено
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            Попробуйте выбрать другую дату, изменить фильтры или поискать в другом регионе
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} onBook={openBooking} />
          ))}
        </div>
      )}

      {/* Преимущества */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6">
        <h2 className="text-lg font-bold text-zinc-900">Почему рабочие туры?</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Home className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-semibold text-zinc-900">Всё включено</div>
              <div className="text-sm text-zinc-500">
                Проживание, питание, трансфер — всё организовано за вас
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-semibold text-zinc-900">Стабильный доход</div>
              <div className="text-sm text-zinc-500">
                Контракт на 1-4 месяца с гарантированной оплатой
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-semibold text-zinc-900">Путешествия</div>
              <div className="text-sm text-zinc-500">
                Работайте в самых красивых регионах России
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка бронирования */}
      <BookingModal
        open={modalOpen}
        onClose={onCloseBooking}
        days={days}
        slots={slots.map(convertTourToSlot)}
        hotDays={hotDays}
        premiumDays={premiumDays}
        initialDay={modalPreset?.day ?? selectedDay}
        initialTitle={modalPreset?.title}
      />

      {/* Модалка фильтров для туров */}
      <SortFilterModalTours
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onChange={setFilters}
      />
    </div>
  );
}