// app/objects/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/topbar";
import { 
  Building2, 
  Bus, 
  BadgePercent, 
  Utensils, 
  MapPin, 
  Navigation,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/cn";

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
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
};

export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [object, setObject] = useState<ApiObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для свайпа фотографий (как на главной)
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const photosRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const apiBase = () => {
    return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
  };

  // Загрузка данных объекта
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
          if (response.status === 404) {
            throw new Error("Объект не найден");
          }
          throw new Error("Ошибка при загрузке объекта");
        }

        const data = await response.json();
        setObject(data);
      } catch (err) {
        console.error("Ошибка загрузки объекта:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    }

    fetchObject();
  }, [id]);

  // Функции для свайпа фотографий (как на главной странице)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold && object?.photos?.length) {
      const direction = diff > 0 ? 1 : -1;
      const newIndex = (activePhoto + direction + object.photos.length) % object.photos.length;
      
      if (newIndex !== activePhoto) {
        setActivePhoto(newIndex);
        const el = photosRef.current;
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

  const handleScroll = () => {
    const el = photosRef.current;
    if (!el || !object?.photos?.length) return;

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      setActivePhoto(Math.max(0, Math.min(idx, object.photos!.length - 1)));
    });
  };

  // Кнопка "Построить маршрут"
  const handleBuildRoute = () => {
    if (!object) return;
    
    const address = object.address 
      ? `${object.city}, ${object.address}`
      : object.city;
    
    const url = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  // Кнопка "Записаться"
  const handleBook = () => {
    router.push(`/objects/${id}/slots`);
  };

  // Скелетон загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar title="Загрузка..." />
        
        <div className="h-64 bg-gray-200 animate-pulse" />
        
        <div className="p-4 space-y-4">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
          
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !object) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar title="Ошибка" />
        
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Building2 size={48} className="mx-auto" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {error || "Объект не найден"}
          </h2>
          <p className="text-gray-600 mb-6">
            Возможно, объект был удален или перемещен
          </p>
          <button
            onClick={() => router.push("/objects")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  const photos = object.photos || [];
  const hasPhotos = photos.length > 0;
  const swipeOffset = isSwiping ? startX - currentX : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* TopBar */}
      <TopBar title={object.name} />
      
      {/* Галерея фотографий (как на главной) */}
      <div className="h-64 bg-gray-100">
        {hasPhotos ? (
          <div
            ref={photosRef}
            onScroll={handleScroll}
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
            {photos.map((src, i) => (
              <div 
                key={i} 
                className="min-w-full h-full snap-start relative"
                style={{
                  transform: i === activePhoto ? `translateX(${swipeOffset}px)` : 'none',
                  transition: isSwiping ? 'none' : 'transform 0.3s ease'
                }}
              >
                <img 
                  src={src} 
                  alt={`Фото ${i + 1} объекта ${object.name}`} 
                  className="h-full w-full object-cover" 
                  draggable="false"
                />
                {isSwiping && i === activePhoto && (
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
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <Building2 size={48} />
          </div>
        )}
        
        {/* Индикаторы фотографий */}
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
      </div>

      {/* Основная информация */}
      <div className="p-4 space-y-6">
        {/* Заголовок и тип */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{object.name}</h1>
            
            {object.type && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Building2 size={16} className="shrink-0" />
                <span className="text-sm">{object.type}</span>
              </div>
            )}
            
            {/* Адрес */}
            <div className="flex items-start gap-2 pt-1">
              <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">{object.city}</div>
                {object.address && (
                  <div className="text-gray-600 text-sm mt-0.5">{object.address}</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Логотип */}
          {object.logoUrl && (
            <div className="h-16 w-16 rounded-xl bg-white border p-2 shrink-0">
              <img
                src={object.logoUrl}
                alt={`Логотип ${object.name}`}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Описание (только если есть) */}
        {object.description && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Описание</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {object.description}
            </p>
          </div>
        )}

        {/* Преимущества (только если есть хотя бы одно) */}
        {(object.hasBus || object.isPremium || object.hasFood) && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Условия</h2>
            <div className="grid grid-cols-2 gap-3">
              {object.hasBus && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Bus size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-800">Есть автобусы</span>
                </div>
              )}
              
              {object.isPremium && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <BadgePercent size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-800">Высокий тариф</span>
                </div>
              )}
              
              {object.hasFood && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Utensils size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-800">Есть обеды</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Кнопка "Построить маршрут" */}
        <button
          onClick={handleBuildRoute}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
            bg-white border border-gray-300 text-gray-800 
            rounded-lg font-medium hover:bg-gray-50 
            transition-colors tap"
        >
          <Navigation size={20} />
          <span>Построить маршрут</span>
        </button>
      </div>

      {/* Футер с кнопкой "Записаться" */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleBook}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
            bg-blue-600 text-white rounded-lg font-medium 
            hover:bg-blue-700 transition-colors tap"
        >
          <span>Смены объекта</span>
        </button>
      </div>
    </div>
  );
}
