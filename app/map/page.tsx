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

// фирменное “успокоение” dataviz под твой black/90 UI
function applySmenuberuBrandStyle(map: any) {
  const LABEL = "#6B7280";
  const HALO = "#FFFFFF";

  const layers = map.getStyle()?.layers ?? [];

  for (const l of layers) {
    const id: string = l.id || "";
    const type: string = l.type || "";

    // Убираем шум: POI / transit / иконки
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

    // Подписи — тише
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

    // Линии (дороги/границы) — чуть приглушаем
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

    // ✅ Dataviz стиль
    const styleUrl = `https://api.maptiler.com/maps/dataviz/style.json?key=${encodeURIComponent(maptilerKey)}`;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [37.6173, 55.7558], // default Moscow
      zoom: 10,
      // ВАЖНО: attributionControl НЕ true. По умолчанию он включен.
      // Если хочешь компактно — можно так:
      // attributionControl: { compact: true },
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

      // black/80 по умолчанию
      el.className =
        "h-10 w-10 rounded-2xl bg-black/80 text-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] flex items-center justify-center active:scale-[0.98] transition";
      el.title = o.name;

      // “капля” в твоём стиле
      el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" fill="currentColor"></path>
        <circle cx="12" cy="10" r="2.5" fill="white"></circle>
      </svg>`;

      el.addEventListener("click", () => {
        // снять active со всех
        try {
          document.querySelectorAll("[data-smenuberu-pin='1']").forEach((n) => {
            n.classList.remove("bg-black/90");
            n.classList.add("bg-black/80");
          });
        } catch {}

        // выделить текущий
        el.classList.remove("bg-black/80");
        el.classList.add("bg-black/90");

        setActive(o);
        map.flyTo({ center: [o.lng, o.lat], zoom: Math.max(map.getZoom(), 14), essential: true });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([o.lng, o.lat])
        .addTo(map);

      markersRef.current.push(marker);
    }

    // fit bounds
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

  const nearest = useMemo(() => {
    if (!pos) return [];
    return objects
      .filter((o) => typeof o.lat === "number" && typeof o.lng === "number")
      .map((o) => ({
        ...o,
        distKm: haversineKm(pos.lat, pos.lng, o.lat as number, o.lng as number),
      }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 8);
  }, [objects, pos]);

  return (
    <div className="relative">
      {/* top */}
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
            Следующий шаг — сохранять координаты при выборе адреса.
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
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black/90 px-4 py-3 text-sm font-medium text-white hover:bg-black/80 transition"
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
