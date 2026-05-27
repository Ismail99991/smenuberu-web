"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Slot } from "@/lib/slots";

interface MapProps {
  slots: Slot[];
  selectedDay: string;
  onSlotSelect?: (slot: Slot) => void;
}

type ObjectItem = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  lat?: number | null;
  lng?: number | null;
};

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

export default function Map({ slots, selectedDay, onSlotSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [activeObject, setActiveObject] = useState<ObjectItem | null>(null);
  const [objects, setObjects] = useState<ObjectItem[]>([]);

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

  // Загрузка объектов с координатами
  useEffect(() => {
    let alive = true;
    
    fetch(`${apiBase()}/objects`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setObjects(list);
      })
      .catch((err) => {
        console.error("Failed to load objects:", err);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Получаем ID объектов, у которых есть слоты на выбранную дату
  const activeObjectIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slot of slots) {
      if (slot.objectId) {
        ids.add(slot.objectId);
      }
    }
    return ids;
  }, [slots]);

  // Фильтруем объекты: показываем только те, у которых есть слоты
  const visibleObjects = useMemo(() => {
    return objects.filter((obj) => activeObjectIds.has(obj.id));
  }, [objects, activeObjectIds]);

  // Инициализация карты
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;
    if (!maptilerKey) return;

    const styleUrl = `https://api.maptiler.com/maps/dataviz/style.json?key=${encodeURIComponent(maptilerKey)}`;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [37.6173, 55.7558],
      zoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [maptilerKey]);

  // Добавление маркеров объектов
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const withCoords = visibleObjects.filter(
      (o) => typeof o.lat === "number" && typeof o.lng === "number"
    ) as Array<ObjectItem & { lat: number; lng: number }>;

    for (const obj of withCoords) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("data-object-pin", "1");

      el.className =
        "h-8 w-8 rounded-xl bg-[#c29cf2] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95";
      
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 18 15.5 18 10C18 5.5 14.5 2 12 2C9.5 2 6 5.5 6 10C6 15.5 12 22 12 22Z" fill="currentColor" stroke="white" stroke-width="1.2"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        
        document.querySelectorAll("[data-object-pin='1']").forEach((n) => {
          n.classList.remove("bg-[#b088e8]", "scale-110");
          n.classList.add("bg-[#c29cf2]");
        });

        el.classList.remove("bg-[#c29cf2]");
        el.classList.add("bg-[#b088e8]", "scale-110");

        setActiveObject(obj);
        map.flyTo({ center: [obj.lng, obj.lat], zoom: 14, essential: true });
        
        // Находим слот для этого объекта и открываем бронирование
        const slotForObject = slots.find((s) => s.objectId === obj.id);
        if (slotForObject && onSlotSelect) {
          onSlotSelect(slotForObject);
        }
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([obj.lng, obj.lat])
        .addTo(map);

      markersRef.current.push(marker);
    }

    if (withCoords.length > 0 && !expanded) {
      const bounds = new maplibregl.LngLatBounds();
      for (const obj of withCoords) bounds.extend([obj.lng, obj.lat]);
      map.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 0 });
    }
  }, [visibleObjects, expanded, slots, onSlotSelect]);

  if (!maptilerKey) {
    return (
      <div className="w-full rounded-xl bg-gray-100 p-3 text-center text-xs text-gray-500">
        Нет ключа MapTiler
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div 
        className={cn(
          "w-full overflow-hidden rounded-xl bg-gray-100 transition-all duration-300",
          expanded ? "h-[300px]" : "h-[120px]"
        )}
      >
        <div ref={mapContainer} className="h-full w-full" />
      </div>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium shadow-md backdrop-blur-sm hover:bg-white"
      >
        {expanded ? "Свернуть" : "Развернуть карту"}
      </button>
    </div>
  );
}
