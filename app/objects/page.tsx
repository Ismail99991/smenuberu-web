"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, TouchEvent, useCallback } from "react";
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
import FilterTabs, { FilterTabKey } from "@/components/FilterTabs";

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
  hasBus?: boolean;
  isPremium?: boolean;
  hasFood?: boolean;
  isFavorite?: boolean;
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

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function TypeBadge({ type }: { type: string }) {
  const t = normalizeType(type);
  let Icon = Building2;

  if (t.includes("склад")) Icon = Warehouse;
  else if (t.includes("сортиров")) Icon = Package;
  else if (t.includes("рц") || t.includes("распредел")) Icon = Truck;
  else if (t.includes("магаз")) Icon = Store;
  else if (t.includes("фабрик") || t.includes("завод") || t.includes("производ"))
    Icon = Factory;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <Icon size={14} className="shrink-0" />
      <span>{type}</span>
    </div>
  );
}

/* =======================
   Карточка объекта
======================= */

function ObjectCard({ obj }: { obj: ApiObject }) {
  const photos = obj.photos?.length ? obj.photos : [];
  const slidesCount = Math.max(1, photos.length);

  const [active, setActive] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      setActive(clamp(idx, 0, slidesCount - 1));
    });
  };

  // Обработчик начала свайпа
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  // Обработчик движения свайпа
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX);
  };

  // Обработчик окончания свайпа
  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      const direction = diff > 0 ? 1 : -1;
      const newIndex = clamp(active + direction, 0, slidesCount - 1);
      
      if (newIndex !== active) {
        setActive(newIndex);
        const el = ref.current;
        if (el) {
          const w = el.clientWidth;
          el.scrollTo({
            left: newIndex * w,
            behavior: 'smooth'
          });
        }
      }
    }

    setStartX(0);
    setCurrentX(0);
  };

  const swipeOffset = isSwiping ? startX - currentX : 0;

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Link
      href={`/objects/${obj.id}`}
      className="
        tap
        block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white
        transition-[box-shadow,transform] duration-200 ease-out
        active:shadow-[0_12px_24px_rgba(0,0,0,0.12)]
      "
    >
      <div
        className="relative h-40 bg-gray-100 overflow-hidden"
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDownCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div
          ref={ref}
          onScroll={onScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="
            flex h-full w-full overflow-x-auto
            snap-x snap-mandatory
            overscroll-x-contain touch-pan-x
            scroll-smooth
            select-none
          "
          style={{ 
            WebkitOverflowScrolling: "touch",
            cursor: isSwiping ? 'grabbing' : 'grab'
          }}
        >
          {photos.length ? (
            photos.map((src, i) => (
              <div 
                key={i} 
                className="min-w-full h-full snap-start relative"
                style={{
                  transform: i === active ? `translateX(${swipeOffset}px)` : 'none',
                  transition: isSwiping ? 'none' : 'transform 0.3s ease'
                }}
              >
                <img 
                  src={src} 
                  alt={`Фото ${i + 1} объекта ${obj.name}`} 
                  className="h-full w-full object-cover" 
                  draggable="false"
                />
                {isSwiping && i === active && (
                  <div className={`
                    absolute top-1/2 -translate-y-1/2
                    ${swipeOffset > 0 ? 'left-2' : 'right-2'}
                    bg-black/50 text-white text-xs px-2 py-1 rounded-full
                    transition-opacity duration-200
                  `}>
                    {swipeOffset > 0 ? '←' : '→'}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="min-w-full h-full snap-start flex items-center justify-center text-sm text-gray-500">
              Фото объекта
            </div>
          )}
        </div>

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
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          {obj.logoUrl ? (
            <img
              src={obj.logoUrl}
              alt={`Логотип ${obj.name}`}
              className="h-10 w-10 rounded-xl bg-gray-50 p-1 object-contain"
              draggable="false"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
              {firstLetter(obj.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <TypeBadge type={obj.type ?? "Объект"} />
            <div className="font-semibold truncate">{obj.name}</div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">
                {obj.city}
                {obj.address ? `, ${obj.address}` : ""}
              </span>
            </div>
          </div>

          <ChevronRight className="text-gray-400 shrink-0" />
        </div>
      </div>
    </Link>
  );
}

/* =======================
   Страница с рабочей фильтрацией
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

  const url = useMemo(() => `${apiBase()}/objects`, []);

  // Загрузка данных
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const res = await fetch(url, { credentials: "include", cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (cancelled) return;

        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          setFilteredItems(data);
          
          // Извлекаем уникальные типы объектов
          const types = [...new Set(data
            .map(obj => obj.type)
            .filter((type): type is string => !!type)
          )];
          setAvailableTypes(types);
        } else {
          // Демо данные для теста
          const demoData: ApiObject[] = [
            {
              id: "1",
              name: "Склад Амазон",
              type: "Склад",
              city: "Москва",
              address: "ЮВАО",
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
              photos: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"],
              hasBus: true,
              isPremium: false,
              hasFood: true,
              isFavorite: false,
            },
            {
              id: "2",
              name: "Завод Adidas",
              type: "Завод",
              city: "Подольск",
              address: "Промзона",
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
              photos: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"],
              hasBus: false,
              isPremium: true,
              hasFood: false,
              isFavorite: true,
            },
            {
              id: "3",
              name: "Распределительный центр OZON",
              type: "Распределительный центр",
              city: "Москва",
              address: "СВАО",
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Ozon_logo.png",
              photos: ["https://images.unsplash.com/photo-1605902711622-cfb43c4437d1"],
              hasBus: true,
              isPremium: true,
              hasFood: true,
              isFavorite: false,
            },
          ];
          
          setItems(demoData);
          setFilteredItems(demoData);
          setAvailableTypes(["Склад", "Завод", "Распределительный центр", "Сортировочный центр"]);
        }
      } catch (error) {
        console.error("Ошибка загрузки объектов:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Функция фильтрации
  const applyFilters = useCallback(() => {
    let result = [...items];

    // Поиск по тексту
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(obj => 
        obj.name.toLowerCase().includes(query) ||
        obj.city.toLowerCase().includes(query) ||
        (obj.address && obj.address.toLowerCase().includes(query)) ||
        (obj.type && obj.type.toLowerCase().includes(query))
      );
    }

    // Фильтрация по типу объекта
    if (selectedType) {
      result = result.filter(obj => obj.type === selectedType);
    }

    // Фильтрация по табам
    switch (activeTab) {
      case "bus":
        result = result.filter(obj => obj.hasBus);
        break;
      case "premium":
        result = result.filter(obj => obj.isPremium);
        break;
      case "food":
        result = result.filter(obj => obj.hasFood);
        break;
      case "fav":
        result = result.filter(obj => obj.isFavorite);
        break;
      // "all" и "type" (уже обработан выше) не требуют дополнительной фильтрации
    }

    setFilteredItems(result);
  }, [items, searchQuery, selectedType, activeTab]);

  // Применяем фильтры при изменении условий
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Обработчик изменения таба
  const handleTabChange = (tab: FilterTabKey, filterValue?: string) => {
    setActiveTab(tab);
    if (tab === "type" && filterValue) {
      setSelectedType(filterValue);
    } else if (tab === "all") {
      setSelectedType("");
    }
  };

  // Обработчик поиска
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="pt-4 space-y-4 pb-24">
      {/* Рабочие табы фильтрации */}
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
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="h-40 bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
                        <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-56 rounded bg-gray-100 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <div className="text-gray-500 mb-2">Объекты не найдены</div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("");
                  setActiveTab("all");
                }}
                className="text-sm text-brand hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              {/* Счетчик найденных объектов */}
              <div className="text-sm text-gray-500 mb-2">
                Найдено объектов: {filteredItems.length}
              </div>
              
              {/* Список объектов */}
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
          className="
            tap flex items-center justify-center
            h-12 w-12 rounded-xl bg-white border border-gray-300
            shadow-lg hover:shadow-xl active:scale-95
            transition-all duration-200
          "
          aria-label="Поиск объектов"
        >
          <Search size={20} className="text-gray-700" />
        </button>

        <Link
          href="/map"
          className="
            tap flex items-center justify-center
            h-12 w-12 rounded-xl bg-white border border-gray-800
            shadow-lg hover:shadow-xl active:scale-95
            transition-all duration-200 group
          "
          aria-label="Карта объектов"
        >
          <MapPinned size={20} className="text-gray-800 group-hover:scale-110 transition-transform" />
        </Link>

        <button
          onClick={() => console.log('Открыть модалку сортировки')}
          className="
            tap flex items-center justify-center
            h-12 w-12 rounded-xl bg-white border border-gray-300
            shadow-lg hover:shadow-xl active:scale-95
            transition-all duration-200
          "
          aria-label="Сортировка"
        >
          <SlidersHorizontal size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Поисковая строка */}
      {showSearch && (
        <div className="fixed inset-x-0 bottom-32 z-50 px-4">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Поиск по названию, городу, адресу..."
                className="
                  w-full rounded-xl border border-gray-200 bg-white
                  px-4 py-3 text-sm placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
                  shadow-lg transition-all duration-200
                "
                autoFocus
                onBlur={() => searchQuery === "" && setShowSearch(false)}
              />
              <Search 
                size={18} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" 
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
