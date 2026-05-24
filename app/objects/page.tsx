"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ChevronRight,
  MapPin,
  Building2,
  Warehouse,
  Package,
  Store,
  Truck,
  Factory,
  MapPinned,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import FilterTabs from "@/components/FilterTabs";
import PullToRefresh from "@/components/PullToRefresh";
import type { FilterTabKey } from "@/components/FilterTabs";
import SortFilterModalObjects from "@/components/sort-filter-modal-objects";

/* =======================
   Типы
======================= */

type ApiObject = {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  type?: string | null;
  logoUrl?: string | null;
  photos?: string[] | null;
  hasBus: boolean;
  isPremium: boolean;
  hasFood: boolean;
  isFavorite: boolean;
};

type ObjectFilters = {
  sort: "relevance" | "name" | "date";
  onlyWithBus: boolean;
  objectTypes: string[];
};

/* =======================
   Утилиты
======================= */

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

function firstLetter(s?: string | null) {
  const t = (s ?? "").trim();
  return t ? t[0]!.toUpperCase() : "•";
}

function normalizeType(t?: string | null) {
  return (t ?? "").toLowerCase();
}

/* =======================
   TypeBadge с новыми цветами
======================= */

function TypeBadge({ type }: { type: string }) {
  const t = normalizeType(type);
  let Icon = Building2;

  if (t.includes("склад")) Icon = Warehouse;
  else if (t.includes("сортиров")) Icon = Package;
  else if (t.includes("рц") || t.includes("распредел")) Icon = Truck;
  else if (t.includes("магаз")) Icon = Store;
  else if (t.includes("фабрик") || t.includes("завод") || t.includes("производ")) Icon = Factory;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
      <Icon size={14} className="shrink-0" />
      <span>{type}</span>
    </div>
  );
}

/* =======================
   Карточка объекта (оптимизированный свайп)
======================= */

function ObjectCard({ obj }: { obj: ApiObject }) {
  const photos = obj.photos?.length ? obj.photos : [];
  const slidesCount = Math.max(1, photos.length);

  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Оптимизированный обработчик скролла с RAF
  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      const newActive = Math.min(Math.max(0, idx), slidesCount - 1);
      if (newActive !== active) setActive(newActive);
    });
  }, [active, slidesCount]);

  // Очистка RAF
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Link
      href={`/objects/${obj.id}`}
      className={cn(
        "tap block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white",
        "transition-shadow duration-200 ease-out",
        "active:shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
      )}
      onClickCapture={(e) => {
        if (isDraggingRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* Фото с оптимизированным свайпом */}
      <div
        className="relative h-40 bg-zinc-100 overflow-hidden"
        data-ptr-skip
        onTouchStart={() => { isDraggingRef.current = false; }}
        onTouchMove={() => { isDraggingRef.current = true; }}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {photos.length ? (
            photos.map((src, i) => (
              <div key={i} className="min-w-full h-full snap-start relative">
                <img
                  src={src}
                  alt={`Фото ${i + 1}`}
                  className="h-full w-full object-cover pointer-events-none"
                  draggable="false"
                  loading="lazy"
                />
              </div>
            ))
          ) : (
            <div className="min-w-full h-full snap-start flex items-center justify-center text-sm text-zinc-500 bg-zinc-100">
              Фото объекта
            </div>
          )}
        </div>

        {/* Индикаторы */}
        {slidesCount > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/40 px-2 py-1">
            {Array.from({ length: slidesCount }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === active ? "bg-white w-4" : "bg-white/50 w-1.5"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          {obj.logoUrl ? (
            <img
              src={obj.logoUrl}
              alt=""
              className="h-10 w-10 rounded-xl bg-zinc-50 p-1 object-contain"
              draggable="false"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center font-semibold text-zinc-600">
              {firstLetter(obj.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <TypeBadge type={obj.type ?? "Объект"} />
            <div className="font-semibold truncate text-zinc-900">{obj.name}</div>
            <div className="flex items-center gap-1 text-sm text-zinc-500">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">
                {obj.city}
                {obj.address ? `, ${obj.address}` : ""}
              </span>
            </div>
          </div>

          <ChevronRight className="text-zinc-400 shrink-0" />
        </div>
      </div>
    </Link>
  );
}

/* =======================
   Страница объектов
======================= */

export default function ObjectsPage() {
  const [items, setItems] = useState<ApiObject[]>([]);
  const [filteredItems, setFilteredItems] = useState<ApiObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTabKey>("all");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [objectFilters, setObjectFilters] = useState<ObjectFilters>({
    sort: "relevance" as const,
    onlyWithBus: false,
    objectTypes: [],
  });

  const url = useMemo(() => `${apiBase()}/objects`, []);

  const fetchObjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (Array.isArray(data) && data.length > 0) {
        const objectsWithDefaults = data.map((obj) => ({
          ...obj,
          hasBus: obj.hasBus ?? false,
          isPremium: obj.isPremium ?? false,
          hasFood: obj.hasFood ?? false,
          isFavorite: obj.isFavorite ?? false,
        }));

        setItems(objectsWithDefaults);
        setFilteredItems(objectsWithDefaults);

        const types = [...new Set(data.map((obj) => obj.type).filter((type): type is string => !!type))];
        setAvailableTypes(types);
      } else {
        // ✅ Моки удалены, просто показываем пустой список
        setItems([]);
        setFilteredItems([]);
        setAvailableTypes([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки объектов:", error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const handleRefresh = useCallback(async () => {
    await fetchObjects();
  }, [fetchObjects]);

  const applyFilters = useCallback(() => {
    let result = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (obj) =>
          obj.name.toLowerCase().includes(query) ||
          obj.city.toLowerCase().includes(query) ||
          (obj.address && obj.address.toLowerCase().includes(query)) ||
          (obj.type && obj.type.toLowerCase().includes(query))
      );
    }

    if (selectedType) {
      result = result.filter((obj) => obj.type === selectedType);
    }

    switch (activeTab) {
      case "bus":
        result = result.filter((obj) => obj.hasBus);
        break;
      case "premium":
        result = result.filter((obj) => obj.isPremium);
        break;
      case "food":
        result = result.filter((obj) => obj.hasFood);
        break;
      case "fav":
        result = result.filter((obj) => obj.isFavorite);
        break;
    }

    setFilteredItems(result);
  }, [items, searchQuery, selectedType, activeTab]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleTabChange = (tab: FilterTabKey, filterValue?: string) => {
    setActiveTab(tab);
    if (tab === "type" && filterValue) {
      setSelectedType(filterValue);
    } else if (tab === "all") {
      setSelectedType("");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setActiveTab("all");
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pt-4 space-y-4 pb-32">
        {/* FilterTabs с обновлёнными цветами */}
        <FilterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          availableTypes={availableTypes}
          selectedType={selectedType}
        />

        {/* Список объектов */}
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <div className="px-4 space-y-3">
            {loading ? (
              // Скелетоны
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <div className="h-40 bg-zinc-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 rounded bg-zinc-100 animate-pulse" />
                          <div className="h-4 w-40 rounded bg-zinc-100 animate-pulse" />
                          <div className="h-3 w-56 rounded bg-zinc-100 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
                <div className="text-zinc-500 mb-2">Объекты не найдены</div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#c29cf2] hover:underline"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className="text-sm text-zinc-500 mb-2">
                  Найдено объектов: {filteredItems.length}
                </div>
                {filteredItems.map((o) => (
                  <ObjectCard key={o.id} obj={o} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Плавающие кнопки */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              "tap flex items-center justify-center h-12 w-12 rounded-xl bg-white border border-zinc-200",
              "shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200",
              "text-zinc-600 hover:text-[#c29cf2]"
            )}
            aria-label="Поиск"
          >
            <Search size={20} />
          </button>

          <Link
            href="/map"
            className={cn(
              "tap flex items-center justify-center h-12 w-12 rounded-xl bg-[#c29cf2] border border-[#c29cf2]",
              "shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200",
              "text-white"
            )}
            aria-label="Карта"
          >
            <MapPinned size={20} />
          </Link>

          <button
  onClick={() => setFilterModalOpen(true)}
  className={cn(
    "tap flex items-center justify-center h-12 w-12 rounded-xl bg-white border border-zinc-200",
    "shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200",
    objectFilters.sort !== "relevance" || objectFilters.onlyWithBus || objectFilters.objectTypes.length > 0
      ? "text-[#c29cf2]"
      : "text-zinc-600"
  )}
  aria-label="Сортировка и фильтры"
>
  <SlidersHorizontal size={20} />
</button>
        </div>

        {/* Поиск */}
        {showSearch && (
          <div className="fixed inset-x-0 bottom-32 z-50 px-4">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Поиск по названию, городу..."
                  className={cn(
                    "w-full rounded-xl border border-zinc-200 bg-white",
                    "px-4 py-3 text-sm placeholder:text-zinc-400",
                    "focus:outline-none focus:ring-2 focus:ring-[#c29cf2]/20 focus:border-[#c29cf2]",
                    "shadow-lg transition-all duration-200"
                  )}
                  autoFocus
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
         <SortFilterModalObjects
          open={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          value={objectFilters}
          onChange={setObjectFilters}
        />
      </div>
    </PullToRefresh>
  );
}