"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { MapPin, ExternalLink, LocateFixed, X } from "lucide-react";

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
  // чтобы пины работали “по-настоящему”, объектам нужны координаты:
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

// простая дистанция в км (для сортировки “ближайшие”)
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

export default function MapPage() {
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  const [active, setActive] = useState<ObjectItem | null>(null);

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

  // 1) загружаем объекты
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

  // 2) геолокация (опционально)
  function requestGeo() {
    setGeoErr(null);
    if (!("geolocation" in navigator)) {
      setGeoErr("Геолокация недоступна в этом браузере.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      (e) => {
        setGeoErr(e?.message || "Не удалось получить геолокацию. Разреши доступ.");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  }

  // 3) инициализация карты
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // уже создана

    // если ключа нет — не падаем, покажем ошибку
    if (!maptilerKey) return;

    // базовый стиль (можно заменить на свой style.json)
    const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(maptilerKey)}`;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [37.6173, 55.7558], // Москва по умолчанию
      zoom: 10,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

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

  // 4) расставляем маркеры (только у кого есть координаты)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // чистим старые
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const withCoords = objects.filter(
      (o) => typeof o.lat === "number" && typeof o.lng === "number"
    ) as Array<ObjectItem & { lat: number; lng: number }>;

    for (const o of withCoords) {
      const el = document.createElement("button");
      el.type = "button";
      el.className =
        "h-10 w-10 rounded-2xl bg-zinc-900 text-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] flex items-center justify-center active:scale-[0.98] transition";
      el.title = o.name;

      // маленькая “капля”
      el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" fill="currentColor"></path>
        <circle cx="12" cy="10" r="2.5" fill="white"></circle>
      </svg>`;

      el.addEventListener("click", () => {
        setActive(o);
        map.flyTo({ center: [o.lng, o.lat], zoom: Math.max(map.getZoom(), 14), essential: true });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([o.lng, o.lat])
        .addTo(map);

      markersRef.current.push(marker);
    }

    // авто-fit если есть пины
    if (withCoords.length > 0) {
      const b = new maplibregl.LngLatBounds();
      for (const o of withCoords) b.extend([o.lng, o.lat]);
      map.fitBounds(b, { padding: 80, maxZoom: 14, duration: 0 });
    }
  }, [objects]);

  // 5) центрируем по пользователю (если дал гео)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!pos) return;
    map.flyTo({ center: [pos.lng, pos.lat], zoom: 13, essential: true });
  }, [pos]);

  // “ближайшие” (если есть координаты у объектов и у пользователя)
  const nearest = useMemo(() => {
    if (!pos) return [];
    const withCoords = objects
      .filter((o) => typeof o.lat === "number" && typeof o.lng === "number")
      .map((o) => ({
        ...o,
        distKm: haversineKm(pos.lat, pos.lng, o.lat as number, o.lng as number),
      }))
      .sort((a, b) => a.distKm - b.distKm);

    return withCoords.slice(0, 8);
  }, [objects, pos]);

  const anyCoords = useMemo(
    () => objects.some((o) => typeof o.lat === "number" && typeof o.lng === "number"),
    [objects]
  );

  return (
    <div className="relative">
      {/* top bar */}
      <div className="mx-auto max-w-3xl px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-zinc-900">Карта</div>
            <div className="text-sm text-zinc-500">Пины объектов</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestGeo}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 transition"
              title="Определить местоположение"
            >
              <LocateFixed className="h-4 w-4" />
              Рядом
            </button>

            <Link
              href="/objects"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 transition"
            >
              Объекты
            </Link>
          </div>
        </div>

        {!maptilerKey ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Нет ключа MapTiler. Добавь <span className="font-mono">NEXT_PUBLIC_MAPTILER_KEY</span> в окружение.
          </div>
        ) : null}

        {err ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {err}
          </div>
        ) : null}

        {!loading && maptilerKey && !anyCoords ? (
          <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
            У объектов пока нет координат (<span className="font-mono">lat/lng</span>), поэтому пины не показать.
            Следующий шаг — сохранять координаты при выборе адреса (геокодинг).
            Пока можно открыть адреса в Яндекс.Картах из списка объектов.
          </div>
        ) : null}

        {geoErr ? (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {geoErr}
          </div>
        ) : null}

        {pos && nearest.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="text-sm font-semibold text-zinc-900">Ближайшие</div>
            <div className="mt-2 grid gap-2">
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
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-left hover:bg-zinc-50 transition"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-900 truncate">{o.name}</div>
                    <div className="text-xs text-zinc-500 truncate">
                      {o.city}{o.address ? `, ${o.address}` : ""}
                    </div>
                  </div>
                  <div className="ml-3 text-xs text-zinc-600 whitespace-nowrap">
                    ~ {Number((o as any).distKm).toFixed(1)} км
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* map */}
      <div className="mx-auto max-w-3xl px-4">
        <div
          ref={containerRef}
          className="h-[calc(100vh-210px)] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50"
        />
      </div>

      {/* active card */}
      {active ? (
        <div className="fixed inset-x-0 bottom-[78px] z-40 px-4">
          <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900">{active.name}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {active.city}{active.address ? `, ${active.address}` : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-2xl p-2 hover:bg-zinc-50 transition"
                title="Закрыть"
              >
                <X className="h-5 w-5 text-zinc-600" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <a
                href={
                  typeof active.lat === "number" && typeof active.lng === "number"
                    ? yandexMapsByCoords(active.lat, active.lng)
                    : yandexMapsByAddress(active.city, active.address)
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition"
              >
                <MapPin className="h-5 w-5" />
                Открыть в Яндекс
                <ExternalLink className="h-4 w-4 opacity-90" />
              </a>

              <Link
                href={`/dashboard/objects/${active.id}`}
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm hover:bg-zinc-50 transition"
              >
                Детали
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
