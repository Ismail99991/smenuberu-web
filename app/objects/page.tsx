"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  MapPin,
  Building2,
  Warehouse,
  Package,
  Store,
  Truck,
  Factory,
  Star,
  Bus,
  Utensils,
  BadgePercent,
  MapPinned, // Добавлена иконка карты
} from "lucide-react";
import { cn } from "@/lib/cn";

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
};

/* =======================
   DEMO ОБЪЕКТЫ
======================= */

const DEMO_OBJECTS: ApiObject[] = [
  {
    id: "demo-amazon",
    name: "Amazon",
    type: "Сортировочный центр",
    city: "Москва",
    address: "ЮВАО",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    photos: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
      "https://images.unsplash.com/photo-1581092334631-7b7b42f1b1f1",
      "https://images.unsplash.com/photo-1605902711622-cfb43c4437d1",
    ],
  },
  {
    id: "demo-adidas",
    name: "Adidas",
    type: "Склад",
    city: "Подольск",
    address: "Промзона",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    photos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427",
      "https://images.unsplash.com/photo-1565610222536-ef125c59da2e",
    ],
  },
];

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

/**
 * FullBleed: “вырваться” из max-w контейнера AppShell и занять 100vw.
 * Работает без правок AppShell, не трогает BottomNav.
 */
function FullBleed({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      {children}
    </div>
  );
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
   Tabs (UI-only)
======================= */

type TabIcon = React.ComponentType<{ size?: number; className?: string }>;

type FilterTab = {
  key: "all" | "type" | "bus" | "premium" | "food" | "fav";
  label: string;
  icon?: TabIcon;
};

const FILTER_TABS: readonly FilterTab[] = [
  { key: "all", label: "Все" },
  { key: "type", label: "Тип склада", icon: Warehouse },
  { key: "bus", label: "Есть автобусы", icon: Bus },
  { key: "premium", label: "Высокий тариф", icon: BadgePercent },
  { key: "food", label: "Есть обеды", icon: Utensils },
  { key: "fav", label: "Избранные", icon: Star },
] as const;

/* =======================
   Карточка объекта
======================= */

function ObjectCard({ obj }: { obj: ApiObject }) {
  const photos = obj.photos?.length ? obj.photos : [];
  const slidesCount = Math.max(1, photos.length);

  const [active, setActive] = useState(0);
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
      {/* Фото */}
      <div
        className="relative h-40 bg-gray-100"
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
          className="
            flex h-full w-full overflow-x-auto
            snap-x snap-mandatory
            overscroll-x-contain touch-pan-x
            scroll-smooth
          "
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {photos.length ? (
            photos.map((src, i) => (
              <div key={i} className="min-w-full h-full snap-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))
          ) : (
            <div className="min-w-full h-full snap-start flex items-center justify-center text-sm text-gray-500">
              Фото объекта
            </div>
          )}
        </div>

        {/* Точки */}
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

      {/* Контент */}
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          {obj.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={obj.logoUrl}
              alt=""
              className="h-10 w-10 rounded-xl bg-gray-50 p-1 object-contain"
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
   Страница
======================= */

export default function ObjectsPage() {
  const [items, setItems] = useState<ApiObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab["key"]>("all");

  const url = useMemo(() => `${apiBase()}/objects`, []);

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
        } else {
          setItems(DEMO_OBJECTS);
        }
      } catch {
        if (!cancelled) setItems(DEMO_OBJECTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // пока UI-only: табы не фильтруют, только подсвечиваются
  const shown = items;

  return (
    <div className="space-y-4">
      {/* Заголовок с кнопкой карты */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold">Объекты</h1>
          <div className="text-sm text-gray-500">Выберите место работы и условия</div>
        </div>
        
        {/* Кнопка перехода на карту */}
        <Link
          href="/map"
          className="
            tap
            flex items-center justify-center
            h-10 w-10
            rounded-xl
            bg-white border border-gray-200
            shadow-sm
            hover:shadow-md
            active:scale-95
            transition-all duration-200
          "
          aria-label="Открыть карту"
          title="Открыть карту"
        >
          <MapPinned size={20} className="text-gray-700" />
        </Link>
      </div>

      {/* Tabs — full width */}
      <FullBleed>
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto snap-x py-1">
            {FILTER_TABS.map((t) => {
              const active = activeTab === t.key;
              const Icon = t.icon;

              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    "snap-start shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm tap",
                    "transition-[background-color,color,box-shadow,transform] duration-200 ease-out",
                    active
                      ? "bg-brand text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
                      : "border border-gray-200 bg-white/80 text-gray-700 backdrop-blur",
                  ].join(" ")}
                >
                  {Icon ? <Icon size={16} /> : null}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </FullBleed>

      {/* List — full width */}
      <FullBleed>
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
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              Пока нет объектов.
            </div>
          ) : (
            shown.map((o) => <ObjectCard key={o.id} obj={o} />)
          )}
        </div>
      </FullBleed>
    </div>
  );
}