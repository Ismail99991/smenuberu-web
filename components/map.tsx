"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Slot } from "@/lib/slots";

interface MapProps {
  slots: Slot[];
  selectedDay: string;
  onSlotSelect?: (slot: Slot) => void;
}

export default function Map({ slots, selectedDay, onSlotSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

  // Функция для группировки слотов
  const getUniqueSlots = useCallback(() => {
    const withCoords = slots.filter(
      (s): s is Slot & { lat: number; lng: number } => 
        s.lat !== undefined && s.lat !== null && 
        s.lng !== undefined && s.lng !== null
    );
    
    const unique: Record<string, Slot & { lat: number; lng: number }> = {};
    for (const slot of withCoords) {
      const key = `${slot.city}|${slot.address}`;
      if (!unique[key]) {
        unique[key] = slot as Slot & { lat: number; lng: number };
      }
    }
    return Object.values(unique);
  }, [slots]);

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
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [maptilerKey]);

  // Добавление маркеров
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const uniqueSlots = getUniqueSlots();

    for (const slot of uniqueSlots) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("data-slot-pin", "1");

      el.className =
        "h-8 w-8 rounded-xl bg-[#c29cf2] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95";
      
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 18 15.5 18 10C18 5.5 14.5 2 12 2C9.5 2 6 5.5 6 10C6 15.5 12 22 12 22Z" fill="currentColor" stroke="white" stroke-width="1.2"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        
        document.querySelectorAll("[data-slot-pin='1']").forEach((n) => {
          n.classList.remove("bg-[#b088e8]", "scale-110");
          n.classList.add("bg-[#c29cf2]");
        });

        el.classList.remove("bg-[#c29cf2]");
        el.classList.add("bg-[#b088e8]", "scale-110");

        setActiveSlot(slot);
        map.flyTo({ center: [slot.lng, slot.lat], zoom: 14, essential: true });
        
        if (onSlotSelect) {
          onSlotSelect(slot);
        }
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([slot.lng, slot.lat])
        .addTo(map);

      markersRef.current.push(marker);
    }

    if (uniqueSlots.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      for (const slot of uniqueSlots) {
        bounds.extend([slot.lng, slot.lat]);
      }
      map.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 0 });
    }
  }, [getUniqueSlots, onSlotSelect]);

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

      {activeSlot && expanded && (
        <div className="absolute bottom-12 left-2 right-2 rounded-xl bg-white/95 p-2 text-xs shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{activeSlot.title}</div>
              <div className="text-gray-500 truncate">{activeSlot.address}</div>
            </div>
            <button
              onClick={() => setActiveSlot(null)}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
