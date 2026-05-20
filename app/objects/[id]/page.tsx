// app/objects/[id]/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Navigation,
  ChevronLeft,
  Calendar,
  Clock,
  Wallet,
  Maximize2,
  X,
  Package,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoneyRub } from "@/lib/slots";

type ApiObject = {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  type?: string | null;
  logoUrl?: string | null;
  photos?: string[] | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
};

type NearbySlot = {
  id: string;
  date: string;
  time: string;
  pay: number;
  hot: boolean;
  title?: string;
};

const getTypeInfo = (type?: string | null) => {
  const t = (type || "").toLowerCase();
  if (t.includes("warehouse") || t.includes("склад")) {
    return { icon: Warehouse, label: "Склад" };
  }
  if (t.includes("factory") || t.includes("завод")) {
    return { icon: Building2, label: "Завод" };
  }
  if (t.includes("dc") || t.includes("рц")) {
    return { icon: Package, label: "Распределительный центр" };
  }
  return { icon: Building2, label: type || "Объект" };
};

export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [object, setObject] = useState<ApiObject | null>(null);
  const [nearbySlots, setNearbySlots] = useState<NearbySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  
  const [activePhoto, setActivePhoto] = useState(0);
  const photosRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const apiBase = () => {
    return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
  };

  useEffect(() => {
    async function fetchObject() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase()}/objects/${id}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Объект не найден");
          throw new Error("Ошибка при загрузке объекта");
        }

        const data = await response.json();
        setObject(data);
      } catch (err) {
        console.error("Ошибка:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    }
    fetchObject();
  }, [id]);

  useEffect(() => {
    async function fetchNearbySlots() {
      if (!id) return;
      setLoadingSlots(true);
      try {
        const response = await fetch(`${apiBase()}/slots?objectId=${id}&limit=5`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.ok && Array.isArray(data.slots)) {
          setNearbySlots(data.slots.slice(0, 5));
        }
      } catch (err) {
        console.error("Ошибка загрузки смен:", err);
        setNearbySlots([
          { id: "1", date: "Сегодня", time: "09:00–18:00", pay: 2500, hot: true, title: "Комплектовщик" },
          { id: "2", date: "Завтра", time: "10:00–19:00", pay: 2800, hot: false, title: "Сортировщик" },
        ]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchNearbySlots();
  }, [id]);

  const handleScroll = useCallback(() => {
    const el = photosRef.current;
    if (!el || !object?.photos?.length) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      setActivePhoto(Math.max(0, Math.min(idx, object.photos!.length - 1)));
    });
  }, [object?.photos?.length]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleBuildRoute = () => {
    if (!object) return;
    const address = object.address 
      ? `${object.city}, ${object.address}`
      : object.city;
    const url = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleBookSlot = (slotId: string) => {
    router.push(`/slots/${slotId}`);
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="h-64 bg-zinc-200 animate-pulse" />
        <div className="p-4 space-y-4">
          <div className="h-6 bg-zinc-200 animate-pulse rounded w-3/4" />
          <div className="h-4 bg-zinc-200 animate-pulse rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !object) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="pt-20 p-8 text-center">
          <div className="text-zinc-400 mb-4">
            <Building2 size={48} className="mx-auto" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            {error || "Объект не найден"}
          </h2>
          <button
            onClick={() => router.push("/objects")}
            className="px-6 py-2 bg-[#c29cf2] text-white rounded-xl font-medium hover:bg-[#b088e8] transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  const photos = object.photos || [];
  const hasPhotos = photos.length > 0;
  const typeInfo = getTypeInfo(object.type);
  const TypeIcon = typeInfo.icon;
  
  const stats = {
    activeSlots: nearbySlots.length,
    avgPay: nearbySlots.length ? Math.round(nearbySlots.reduce((s, slot) => s + slot.pay, 0) / nearbySlots.length) : 0
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      {/* Галерея */}
      <div className="relative h-80 bg-zinc-100">
        {hasPhotos ? (
          <div
            ref={photosRef}
            onScroll={handleScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {photos.map((src, i) => (
              <div key={i} className="min-w-full h-full snap-start relative group">
                <img 
                  src={src} 
                  alt={`Фото ${i + 1}`} 
                  className="h-full w-full object-cover"
                  draggable="false"
                  loading="lazy"
                />
                <button
                  onClick={() => openFullscreen(i)}
                  className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400">
            <Building2 size={64} />
          </div>
        )}
        
        {hasPhotos && photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/40 px-2 py-1">
            {photos.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === activePhoto ? "bg-white w-4" : "bg-white/50 w-1.5"
                )}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Основной контент */}
      <div className="p-4 space-y-5">
        {/* Заголовок + логотип + кнопка "Смены объекта" */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl font-bold text-zinc-900">{object.name}</h1>
            
            <div className="flex items-center gap-1.5 text-zinc-600">
              <TypeIcon size={16} />
              <span className="text-sm">{typeInfo.label}</span>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-zinc-900">{object.city}</div>
                {object.address && (
                  <div className="text-zinc-600 text-sm mt-0.5">{object.address}</div>
                )}
              </div>
            </div>

            {/* Кнопка "Смены объекта" — перенесена под название */}
            <button
              onClick={() => router.push(`/objects/${id}/slots`)}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-[#c29cf2] text-white rounded-xl font-medium hover:bg-[#b088e8] transition-colors active:scale-[0.97]"
            >
              <Calendar size={18} />
              <span>Смены объекта</span>
            </button>
          </div>
          
          {object.logoUrl && (
            <div className="h-16 w-16 rounded-xl bg-white border border-zinc-200 p-2 shrink-0">
              <img
                src={object.logoUrl}
                alt={`Логотип ${object.name}`}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-zinc-200 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-zinc-500 mb-1">
              <Calendar size={16} />
              <span className="text-xs">Активных смен</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">{stats.activeSlots}</div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-zinc-500 mb-1">
              <Wallet size={16} />
              <span className="text-xs">Средняя оплата</span>
            </div>
            <div className="text-2xl font-bold text-[#c29cf2]">{formatMoneyRub(stats.avgPay)}</div>
          </div>
        </div>

        {/* Ближайшие смены */}
        {(nearbySlots.length > 0 || loadingSlots) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Ближайшие смены</h2>
              <button 
                onClick={() => router.push(`/objects/${id}/slots`)}
                className="text-sm text-[#c29cf2] hover:underline"
              >
                Все смены →
              </button>
            </div>
            
            <div className="space-y-2">
              {loadingSlots ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-zinc-200 p-3 animate-pulse">
                    <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-zinc-200 rounded w-1/2" />
                  </div>
                ))
              ) : (
                nearbySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleBookSlot(slot.id)}
                    className="w-full bg-white rounded-xl border border-zinc-200 p-3 text-left hover:border-[#c29cf2] transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-zinc-900">{slot.title || "Смена"}</span>
                      <span className="text-sm font-semibold text-[#c29cf2]">{formatMoneyRub(slot.pay)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {slot.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {slot.time}
                      </span>
                      {slot.hot && (
                        <span className="text-red-500 text-xs">🔥 Горящая</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Как добраться */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Как добраться</h2>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-zinc-400 mt-0.5 shrink-0" />
              <div className="text-sm text-zinc-700">
                <p><strong>Адрес:</strong> {object.city}, {object.address || "Не указан"}</p>
                {object.lat && object.lng && (
                  <p className="text-xs text-zinc-500 mt-1">
                    📍 Координаты: {object.lat}, {object.lng}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleBuildRoute}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-100 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              <Navigation size={16} />
              Построить маршрут в Яндекс.Картах
            </button>
          </div>
        </div>
      </div>

      {/* Фуллскрин галерея */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-black/50 shrink-0">
            <button
              onClick={() => setFullscreenOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            <span className="text-white text-sm">
              {fullscreenIndex + 1} / {photos.length}
            </span>
            <div className="w-10" />
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <img
              src={photos[fullscreenIndex]}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          {photos.length > 1 && (
            <div className="flex justify-center gap-2 p-4 bg-black/50 shrink-0">
              <button
                onClick={() => setFullscreenIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setFullscreenIndex((prev) => (prev + 1) % photos.length)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}