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
} from "lucide-react";

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

function TypeBadge({ type }: { type: string }) {
  const t = normalizeType(type);
  let Icon = Building2;

  if (t.includes("склад")) Icon = Warehouse;
  else if (t.includes("сортиров")) Icon = Package;
  else if (t.includes("рц")) Icon = Truck;
  else if (t.includes("магаз")) Icon = Store;
  else if (t.includes("фабрик") || t.includes("завод")) Icon = Factory;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <Icon size={14} />
      <span>{type}</span>
    </div>
  );
}

/* =======================
   Tabs (UI-only)
======================= */

const FILTER_TABS = [
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

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(idx);
  };

  return (
    <Link
      href={`/objects/${obj.id}`}
      className="block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white"
    >
      {/* Фото */}
      <div
        className="relative h-40 bg-gray-100"
        onClickCapture={(e) => e.preventDefault()}
        onPointerDownCapture={(e) => e.preventDefault()}
      >
        <div
          ref={ref}
          onScroll={onScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory"
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
            <div className="min-w-full h-full flex items-center justify-center text-sm text-gray-500">
              Фото объекта
            </div>
          )}
        </div>

        {/* Точки */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/40 px-2 py-1">
          {Array.from({ length: slidesCount }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === active ? "bg-white" : "bg-white/50"
              }`}
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
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-semibold">
              {firstLetter(obj.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <TypeBadge type={obj.type ?? "Объект"} />
            <div className="font-semibold truncate">{obj.name}</div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} />
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
  const [activeTab, setActiveTab] = useState<string>("all");

  const url = useMemo(() => `${apiBase()}/objects`, []);

  useEffect(() => {
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          setItems(DEMO_OBJECTS);
        }
      })
      .catch(() => setItems(DEMO_OBJECTS));
  }, [url]);

  return (
    <div className="space-y-4">
      <h1 className="px-4 text-xl font-semibold">Объекты</h1>

      {/* Tabs */}
      <div className="px-2">
        <div className="flex gap-2 overflow-x-auto snap-x">
          {FILTER_TABS.map((t) => {
            const active = activeTab === t.key;
            const Icon = t.icon;

            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={[
                  "snap-start shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-black text-white"
                    : "border border-gray-200 bg-white text-gray-700",
                ].join(" ")}
              >
                {Icon && <Icon size={16} />}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {items.map((o) => (
          <ObjectCard key={o.id} obj={o} />
        ))}
      </div>
    </div>
  );
}
