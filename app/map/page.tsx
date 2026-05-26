"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { 
  MapPin, 
  ExternalLink, 
  LocateFixed, 
  X,
  MapPinned,
  List,
  Search,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? data?.message ?? `HTTP ${res.status}`);
  return data as T;
}

type ObjectItem = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  lat?: number | null;
  lng?: number | null;
};

function yandexMapsByAddress(city: string, address: string | null) {
  const q = `${city}${address ? ", " + address : ""}`.trim();
  return `https://yandex.ru/maps/?text=${encodeURIComponent(q)}&z=16`;
}

function yandexMapsByCoords(lat: number, lng: number) {
  return `https://yandex.ru/maps/?pt=${encodeURIComponent(`${lng},${lat}`)}&z=16&l=map`;
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - (s1 + s2)));
  return R * c;
}

function applySmenuberuBrandStyle(map: any) {
  const LABEL = "#6B7280";
  const HALO = "#FFFFFF";

  const layers = map.getStyle()?.layers ?? [];

  for (const l of layers) {
    const id: string = l.id || "";
    const type: string = l.type || "";

    if (
      id.includes("poi") ||
      id.includes("poi-label") ||
      id.includes("poi_label") ||
      id.includes("transit") ||
      id.includes("rail") ||
      id.includes("airport") ||
      id.includes("aeroway")
    ) {
      try {
        map.setLayoutProperty(id, "visibility", "none");
      } catch {}
      continue;
    }

    if (type === "symbol" && (id.includes("label") || id.includes("place") || id.includes("road"))) {
      try {
        map.setPaintProperty(id, "text-color", LABEL);
      } catch {}
      try {
        map.setPaintProperty(id, "text-halo-color", HALO);
      } catch {}
      try {
        map.setPaintProperty(id, "text-halo-width", 1);
      } catch {}
      try {
        map.setPaintProperty(id, "text-opacity", 0.85);
      } catch {}
      continue;
    }

    if (type === "line" && (id.includes("road") || id.includes("street") || id.includes("highway") || id.includes("boundary"))) {
      try {
        const cur = map.getPaintProperty(id, "line-opacity");
        if (typeof cur === "number") map.setPaintProperty(id, "line-opacity", Math.min(cur, 0.9));
        else map.setPaintProperty(id, "line-opacity", 0.9);
      } catch {}
      continue;
    }
  }
}

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  const [active, setActive] = useState<ObjectItem | null>(null);
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

  // загрузка объектов
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    api<ObjectItem[]>("/objects")
      .then((list) => {
        if (!alive) return;
        setObjects(Array.isArray(list) ? list : []);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message ?? "Не удалось загрузить объекты");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  function requestGeo() {
    setGeoErr(null);
    if (!("geolocation" in navigator)) {
      setGeoErr("Геолокация недоступна в этом браузере.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setGeoErr(e?.message || "Не удалось получить геолокацию. Разреши доступ."),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  }

  // init map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;
    if (!maptilerKey) return;

    const styleUrl = `https://api.maptiler.com/maps/dataviz/style.json?key=${encodeURIComponent(maptilerKey)}`;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [37.6173, 55.7558],
      zoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("load", () => {
      applySmenuberuBrandStyle(map);
    });

    mapRef.current = map;

    return () => {
      try {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [maptilerKey]);

  // markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const withCoords = objects.filter(
      (o) => typeof o.lat === "number" && typeof o.lng === "number"
    ) as Array<ObjectItem & { lat: number; lng: number }>;

    for (const o of withCoords) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("data-smenuberu-pin", "1");

      el.className =
        "h-10 w-10 rounded-2xl bg-[#c29cf2] text-white shadow-[0_10px_22px_rgba(194,156,242,0.28)] flex items-center justify-center active:scale-[0.98] transition";
      el.title = o.name;

      el.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 18 15.5 18 10C18 5.5 14.5 2 12 2C9.5 2 6 5.5 6 10C6 15.5 12 22 12 22Z" fill="currentColor" stroke="white" stroke-width="1.2"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>`;

      el.addEventListener("click", () => {
        try {
          document.querySelectorAll("[data-smenuberu-pin='1']").forEach((n) => {
            n.classList.remove("bg-[#b088e8]");
            n.classList.add("bg-[#c29cf2]");
          });
        } catch {}

        el.classList.remove("bg-[#c29cf2]");
        el.classList.add("bg-[#b088e8]");

        setActive(o);
        map.flyTo({ center: [o.lng, o.lat], zoom: Math.max(map.getZoom(), 14), essential: true });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([o.lng, o.lat])
        .addTo(map);

      markersRef.current.push(marker);
    }

    if (withCoords.length > 0) {
      const b = new maplibregl.LngLatBounds();
      for (const o of withCoords) b.extend([o.lng, o.lat]);
      map.fitBounds(b, { padding: 80, maxZoom: 14, duration: 0 });
    }
  }, [objects]);

  // fly to user
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pos) return;
    map.flyTo({ center: [pos.lng, pos.lat], zoom: 13, essential: true });
  }, [pos]);

  const anyCoords = useMemo(
    () => objects.some((o) => typeof o.lat === "number" && typeof o.lng === "number"),
    [objects]
  );

  const filteredObjects = useMemo(() => {
    if (!searchQuery) return objects;
    const query = searchQuery.toLowerCase();
    return objects.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.city.toLowerCase().includes(query) ||
        (o.address && o.address.toLowerCase().includes(query))
    );
  }, [objects, searchQuery]);

  const nearest = useMemo(() => {
    if (!pos) return [];
    return filteredObjects
      .filter((o) => typeof o.lat === "number" && typeof o.lng === "number")
      .map((o) => ({
        ...o,
        distKm: haversineKm(pos.lat, pos.lng, o.lat as number, o.lng as number),
      }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 8);
  }, [filteredObjects, pos]);

  return (
    <div className="fixed inset-0 h-full w-full overflow-hidden">
      {/* Карта на весь экран */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      {/* UI компоненты поверх */}
      <div className="relative z-10 flex h-full flex-col pointer-events-none">
        {/* Верхняя панель */}
        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pt-4">
          <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/20">
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold text-zinc-900">Карта</div>
                  <div className="text-sm text-zinc-500">Пины объектов</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={requestGeo}
                    className={cn(
                      uiTransition,
                      "inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm",
                      "hover:bg-zinc-50 active:scale-[0.97]"
                    )}
                    title="Определить местоположение"
                  >
                    <LocateFixed className="h-4 w-4" />
                    Рядом
                  </button>

                  <Link
                    href="/objects"
                    className={cn(
                      uiTransition,
                      "inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm",
                      "hover:bg-zinc-50 active:scale-[0.97]"
                    )}
                  >
                    Все объекты
                  </Link>
                </div>
              </div>

              {!maptilerKey ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  Нет ключа MapTiler. Добавь <span className="font-mono">NEXT_PUBLIC_MAPTILER_KEY</span>.
                </div>
              ) : null}

              {err ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {err}
                </div>
              ) : null}

              {geoErr ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  {geoErr}
                </div>
              ) : null}

              {!loading && maptilerKey && !anyCoords ? (
                <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
                  У объектов пока нет координат (<span className="font-mono">lat/lng</span>), поэтому пины не показать.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Список ближайших — теперь поднят выше и не перекрывается флоатинг кнопками */}
        <div className="pointer-events-auto mx-auto mt-12 w-full max-w-3xl px-4">
          {pos && nearest.length > 0 && !active && (
            <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/20 p-4">
              <div className="text-sm font-semibold text-zinc-900">Ближайшие объекты</div>
              <div className="mt-2 grid gap-2 max-h-[280px] overflow-y-auto">
                {nearest.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setActive(o);
                      mapRef.current?.flyTo({
                        center: [Number(o.lng), Number(o.lat)],
                        zoom: 14,
                        essential: true,
                      });
                    }}
                    className={cn(
                      uiTransition,
                      "flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-left",
                      "hover:bg-zinc-50 active:scale-[0.98]"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900 truncate">{o.name}</div>
                      <div className="text-xs text-zinc-500 truncate">
                        {o.city}{o.address ? `, ${o.address}` : ""}
                      </div>
                    </div>
                    <div className="ml-3 text-xs font-medium text-[#c29cf2] whitespace-nowrap">
                      ~ {Number((o as any).distKm).toFixed(1)} км
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Плавающие кнопки */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={cn(
            uiTransition,
            "flex items-center justify-center h-12 w-12 rounded-xl bg-white border border-zinc-200",
            "shadow-lg hover:shadow-xl active:scale-95",
            "text-zinc-600 hover:text-[#c29cf2]"
          )}
          aria-label="Поиск объектов"
        >
          <Search size={20} />
        </button>

        <Link
          href="/objects"
          className={cn(
            uiTransition,
            "flex items-center justify-center h-12 w-12 rounded-xl bg-[#c29cf2] border border-[#c29cf2]",
            "shadow-lg hover:shadow-xl active:scale-95",
            "text-white"
          )}
          aria-label="Список объектов"
        >
          <List size={20} />
        </Link>

        <Link
          href="/objects"
          className={cn(
            uiTransition,
            "flex items-center justify-center h-12 w-12 rounded-xl bg-white border border-zinc-200",
            "shadow-lg hover:shadow-xl active:scale-95",
            "text-zinc-600 hover:text-[#c29cf2]"
          )}
          aria-label="Фильтры"
        >
          <SlidersHorizontal size={20} />
        </Link>
      </div>

      {/* Поисковая строка */}
      {showSearch && (
        <div className="fixed inset-x-0 bottom-32 z-50 px-4 pointer-events-auto">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, городу, адресу..."
                className={cn(
                  "w-full rounded-xl border border-zinc-200 bg-white",
                  "px-4 py-3 text-sm placeholder:text-zinc-400",
                  "focus:outline-none focus:ring-2 focus:ring-[#c29cf2]/20 focus:border-[#c29cf2]",
                  "shadow-lg transition-all duration-200"
                )}
                autoFocus
                onBlur={() => searchQuery === "" && setShowSearch(false)}
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

      {/* Активная карточка объекта — поднята выше, чтобы не перекрываться кнопками */}
      {active ? (
        <div className="fixed inset-x-0 bottom-[140px] z-20 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-3xl px-4">
            <div className="rounded-3xl border border-zinc-200 bg-white/95 backdrop-blur-md shadow-[0_18px_44px_rgba(0,0,0,0.18)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-zinc-900">{active.name}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {active.city}{active.address ? `, ${active.address}` : ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className={cn(
                    uiTransition,
                    "rounded-2xl p-2 hover:bg-zinc-100 active:scale-[0.95]"
                  )}
                  title="Закрыть"
                >
                  <X className="h-5 w-5 text-zinc-600" />
                </button>
              </div>

              <div className="mt-3">
                <Link
                  href={`/objects/${active.id}`}
                  className={cn(
                    uiTransition,
                    "flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c29cf2] px-4 py-3 text-sm font-medium text-white",
                    "hover:bg-[#b088e8] active:scale-[0.97]"
                  )}
                >
                  Подробнее об объекте
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-2">
                <a
                  href={
                    typeof active.lat === "number" && typeof active.lng === "number"
                      ? yandexMapsByCoords(active.lat, active.lng)
                      : yandexMapsByAddress(active.city, active.address)
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    uiTransition,
                    "flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700",
                    "hover:bg-zinc-50 active:scale-[0.97]"
                  )}
                >
                  <MapPin className="h-4 w-4" />
                  Открыть маршрут в Яндекс.Картах
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}