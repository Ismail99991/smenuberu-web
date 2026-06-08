"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, MapPinned, SlidersHorizontal, X } from "lucide-react";

import { useIsSelfEmployed } from "@/lib/user-state";
import { OnboardingCarousel } from "@/components/onboarding-carousel";

import PullToRefresh from "@/components/PullToRefresh";
import DayTabs from "@/components/day-tabs";
import SlotCard from "@/components/slot-card";
import BookingModal from "@/components/booking-modal";
import SortFilterModal, {
  type TaskFilters,
  type SortKey,
} from "@/components/sort-filter-modal";

import EmptyState from "@/components/empty-state";
import SearchBar from "@/components/search-bar";
import PromoBanner from "@/components/promo-banner";
import Map from "@/components/map";

import {
  addDays,
  getMockSlots,
  getSlotsFromApi,
  toISODateLocal,
} from "@/lib/slots";

import type { Slot } from "@/lib/slots";

function getDaysWindow(from: Date, windowDays = 14) {
  const out: string[] = [];

  for (let i = 0; i < windowDays; i++) {
    out.push(toISODateLocal(addDays(from, i)));
  }

  return out;
}

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

    const ms = nextMidnight.getTime() - now.getTime();

    const t1 = window.setTimeout(() => {
      tick();

      const t2 = window.setInterval(tick, 60_000);
      (t1 as any)._t2 = t2;
    }, ms);

    return () => {
      const maybe = (t1 as any)?._t2;

      if (maybe) window.clearInterval(maybe);

      window.clearTimeout(t1);
    };
  }, [onRollover]);
}

function pseudoNearScore(slot: Slot) {
  const s = `${slot.city}|${slot.address}|${slot.company}`;

  let h = 0;

  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }

  return h;
}

export default function ShiftsClient() {
  const router = useRouter();
  const isSelfEmployed = useIsSelfEmployed();

  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");

  const [today, setToday] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() =>
    toISODateLocal(new Date())
  );

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date());

  const [filterOpen, setFilterOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const [sheetY, setSheetY] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const [filters, setFilters] = useState<TaskFilters>({
    onlyHot: false,
    onlyPremium: false,
    types: [],
    sort: "relevance",
  });

  useEffect(() => {
    const handler = () => {
      setShowSearch((v) => !v);
    };

    window.addEventListener("smenube:toggle-search", handler);

    return () => {
      window.removeEventListener("smenube:toggle-search", handler);
    };
  }, []);

  useEffect(() => {
    if (!mapOpen) {
      setSheetY(0);
      dragStartYRef.current = null;
      draggingRef.current = false;
    }
  }, [mapOpen]);

  const days = useMemo(() => getDaysWindow(today, 14), [today]);

  const [slots, setSlots] = useState<Slot[]>(() => getMockSlots(today, 14));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const apiSlots = await getSlotsFromApi();

        if (!cancelled && apiSlots.length > 0) {
          setSlots(apiSlots);
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, [today]);

  const refreshSlots = useCallback(async () => {
    try {
      const apiSlots = await getSlotsFromApi();

      if (apiSlots?.length) {
        setSlots(apiSlots);
        return;
      }
    } catch {
      setSlots(getMockSlots(today, 14));
    }
  }, [today]);

  const availableDays = useMemo(
    () => new Set(slots.map((x) => x.date)),
    [slots]
  );

  const hotDays = useMemo(() => {
    const s = new Set<string>();

    for (const x of slots) {
      if (x.hot) s.add(x.date);
    }

    return s;
  }, [slots]);

  const premiumDays = useMemo(() => {
    const s = new Set<string>();

    for (const x of slots) {
      if (x.pay >= 3500) s.add(x.date);
    }

    return s;
  }, [slots]);

  const handleRollover = useCallback((now: Date) => {
    setToday(now);

    const iso = toISODateLocal(now);

    setSelectedDay(iso);

    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  useAutoTodayRollover(handleRollover);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = slots.filter((x) => x.date === selectedDay);

    if (s) {
      list = list.filter((x) =>
        [x.title, x.company, x.city, x.address].some((v) =>
          v.toLowerCase().includes(s)
        )
      );
    }

    if (filters.onlyHot) {
      list = list.filter((x) => !!x.hot);
    }

    if (filters.onlyPremium) {
      list = list.filter((x) => x.pay >= 3500);
    }

    if (filters.types.length) {
      list = list.filter((x) => filters.types.includes(x.type));
    }

    const sort: SortKey = filters.sort;

    if (sort === "pay_desc") {
      list = [...list].sort((a, b) => b.pay - a.pay);
    } else if (sort === "pay_asc") {
      list = [...list].sort((a, b) => a.pay - b.pay);
    } else if (sort === "near") {
      list = [...list].sort((a, b) => pseudoNearScore(a) - pseudoNearScore(b));
    }

    return list;
  }, [q, selectedDay, slots, filters]);

  const hasActiveFilters =
    filters.onlyHot ||
    filters.onlyPremium ||
    filters.types.length > 0 ||
    filters.sort !== "relevance";

  const [modalOpen, setModalOpen] = useState(false);

  const [modalPreset, setModalPreset] = useState<{
    day: string;
    title?: string;
  } | null>(null);

  const openBooking = useCallback(
    (slot: Slot) => {
      if (!isSelfEmployed) {
        router.push("/check-npd");
        return;
      }

      setModalPreset({
        day: slot.date,
        title: slot.title,
      });

      setModalOpen(true);
    },
    [isSelfEmployed, router]
  );

  const handleSheetTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartYRef.current = e.touches[0]?.clientY ?? null;
    draggingRef.current = true;
  }, []);

  const handleSheetTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    if (dragStartYRef.current == null) return;

    const currentY = e.touches[0]?.clientY ?? 0;
    const diff = currentY - dragStartYRef.current;

    if (diff <= 0) {
      setSheetY(0);
      return;
    }

    setSheetY(Math.min(diff, 220));
  }, []);

  const handleSheetTouchEnd = useCallback(() => {
    if (sheetY > 90) {
      setMapOpen(false);
      setSheetY(0);
    } else {
      setSheetY(0);
    }

    dragStartYRef.current = null;
    draggingRef.current = false;
  }, [sheetY]);

  return (
    <PullToRefresh onRefresh={refreshSlots}>
      <div className="space-y-3 pb-24">
        <SearchBar
          q={q}
          onSearchChange={setQ}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch((v) => !v)}
        />

        <PromoBanner />

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
        />

        <div className="rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c29cf2]/10">
                <MapPinned className="h-5 w-5 text-[#c29cf2]" />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-500">
                  Объекты рядом
                </div>

                <div className="truncate text-base font-semibold text-zinc-900">
                  {filtered.length} смен поблизости
                </div>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
            </button>

            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl active:scale-[0.95]",
                hasActiveFilters
                  ? "bg-[#c29cf2] text-white"
                  : "bg-zinc-100 text-zinc-600",
              ].join(" ")}
              aria-label="Фильтры"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          {hasActiveFilters ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {filters.onlyHot ? (
                <span className="rounded-full bg-[#c29cf2]/10 px-2 py-0.5 text-xs text-[#c29cf2]">
                  Горящие
                </span>
              ) : null}

              {filters.onlyPremium ? (
                <span className="rounded-full bg-[#c29cf2]/10 px-2 py-0.5 text-xs text-[#c29cf2]">
                  Высокий тариф
                </span>
              ) : null}

              {filters.types.length > 0 ? (
                <span className="rounded-full bg-[#c29cf2]/10 px-2 py-0.5 text-xs text-[#c29cf2]">
                  {filters.types.length} типа
                </span>
              ) : null}

              {filters.sort !== "relevance" ? (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {filters.sort === "pay_desc"
                    ? "Сначала дороже"
                    : filters.sort === "pay_asc"
                    ? "Сначала дешевле"
                    : "По близости"}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {!isSelfEmployed ? <OnboardingCarousel /> : null}

        {filtered.length === 0 ? (
          <EmptyState
            title="Нет заданий"
            description="На выбранную дату ничего нет"
            imageUrl="https://s3.regru.cloud/smenuberu/illustrations/emptystate.png"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((slot) => (
              <div
                key={slot.id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/shifts/${slot.id}`)}
              >
                <SlotCard
                  slot={slot}
                  isSelfEmployed={isSelfEmployed}
                  onBook={openBooking}
                  onVerifyNpd={() => router.push("/check-npd")}
                />
              </div>
            ))}
          </div>
        )}

        {mapOpen ? (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Закрыть карту"
              onClick={() => setMapOpen(false)}
            />

            <div
              className="
                absolute
                inset-x-0
                bottom-[calc(40px+env(safe-area-inset-bottom))]
                max-h-[76vh]
                rounded-t-[28px]
                bg-white
                p-4
                shadow-[0_-18px_50px_rgba(0,0,0,0.22)]
                will-change-transform
              "
              style={{
                transform: `translateY(${sheetY}px)`,
                transition: draggingRef.current ? "none" : "transform 180ms ease",
              }}
            >
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                onTouchStart={handleSheetTouchStart}
                onTouchMove={handleSheetTouchMove}
                onTouchEnd={handleSheetTouchEnd}
                onTouchCancel={handleSheetTouchEnd}
                className="mx-auto mb-3 flex h-8 w-24 touch-none items-center justify-center"
                aria-label="Свернуть карту"
              >
                <span className="h-1.5 w-11 rounded-full bg-zinc-300" />
              </button>

              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-zinc-900">
                    Карта объектов
                  </div>

                  <div className="text-sm text-zinc-500">
                    {filtered.length} смен на выбранную дату
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMapOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 active:scale-[0.95]"
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl">
                <Map
                  slots={filtered}
                  selectedDay={selectedDay}
                  onSlotSelect={(slot) => {
                    setMapOpen(false);
                    openBooking(slot);
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}

        <BookingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
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
