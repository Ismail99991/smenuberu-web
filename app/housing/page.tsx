"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Home, 
  Star,
  MapPinned,
  ChevronRight,
  Building2,
  Hotel,
  Bed,
  Users,
  Wifi,
  Utensils,
  Bath,
  ParkingCircle,
  Tv,
  Shirt
} from "lucide-react";
import { cn } from "@/lib/cn";
import { mockHostels, type Hostel } from "@/lib/housing";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  kitchen: Utensils,
  washing: Shirt,
  shower: Bath,
  parking: ParkingCircle,
  tv: Tv,
  lockers: Bed,
  canteen: Utensils
};

const amenityLabels: Record<string, string> = {
  wifi: "Wi-Fi",
  kitchen: "Кухня",
  washing: "Прачечная",
  shower: "Душ",
  parking: "Парковка",
  tv: "ТВ",
  lockers: "Камеры хранения",
  canteen: "Столовая"
};

const typeLabels: Record<string, string> = {
  hostel: "Хостел",
  hotel: "Гостиница",
  apartment: "Апартаменты",
  dormitory: "Общежитие",
  camp: "Лагерь"
};

const typeIcons: Record<string, any> = {
  hostel: Home,
  hotel: Hotel,
  apartment: Building2,
  dormitory: Bed,
  camp: MapPinned
};

export default function HousingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  const cities = useMemo(() => [...new Set(mockHostels.map(h => h.city))], []);

  const filteredHostels = useMemo(() => {
    let result = mockHostels;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
      );
    }

    if (selectedCity) {
      result = result.filter(h => h.city === selectedCity);
    }

    if (selectedType) {
      result = result.filter(h => h.type === selectedType);
    }

    result = result.filter(h => 
      h.pricePerNight >= priceRange[0] && h.pricePerNight <= priceRange[1]
    );

    return result;
  }, [searchQuery, selectedCity, selectedType, priceRange]);

  const HostelCard = ({ hostel }: { hostel: Hostel }) => {
    const TypeIcon = typeIcons[hostel.type];
    
    return (
      <div className={cn(
        "rounded-2xl border border-zinc-200 bg-white overflow-hidden",
        "hover:shadow-xl hover:border-zinc-300 transition-all duration-200"
      )}>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-48 h-48 md:h-auto relative bg-gray-100">
            <img 
              src={hostel.photos[0]} 
              alt={hostel.name}
              className="h-full w-full object-cover"
            />
            {hostel.isPartner && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Партнёр
              </div>
            )}
          </div>

          <div className="flex-1 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500">
                    {typeLabels[hostel.type]}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{hostel.rating}</span>
                    <span className="text-xs text-zinc-500">({hostel.reviews})</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{hostel.name}</h3>
                <div className="flex items-center gap-1 text-zinc-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{hostel.city}, {hostel.address}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-zinc-900">
                  {hostel.pricePerNight.toLocaleString()} ₽
                </div>
                <div className="text-xs text-zinc-500">за ночь</div>
                {hostel.pricePerWeek && (
                  <div className="mt-1 text-xs text-green-600">
                    от {hostel.pricePerWeek.toLocaleString()} ₽ / неделя
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {hostel.amenities.slice(0, 5).map(amenity => {
                const Icon = amenityIcons[amenity];
                return (
                  <div key={amenity} className="flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1">
                    <Icon className="h-3 w-3 text-zinc-500" />
                    <span className="text-xs text-zinc-600">{amenityLabels[amenity]}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Свободно {hostel.availableBeds} из {hostel.totalBeds} мест</span>
              </div>
              {hostel.distanceToTransport && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>до транспорта: {hostel.distanceToTransport}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/housing/${hostel.id}`}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-600 transition-all"
              >
                Подробнее
              </Link>
              <a
                href={`tel:${hostel.contactPhone}`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-all"
              >
                📞
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white">
        <h1 className="text-2xl font-bold">Жильё для рабочих</h1>
        <p className="mt-2 text-emerald-100 max-w-2xl">
          Уютные хостелы, гостиницы и общежития рядом с местом работы
        </p>
      </div>

      <div className="sticky top-0 z-20 rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-md p-4 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или городу..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm hover:bg-zinc-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-zinc-200 pt-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700">Город</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <option value="">Все города</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700">Тип жилья</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <option value="">Все типы</option>
                <option value="hostel">Хостел</option>
                <option value="hotel">Гостиница</option>
                <option value="apartment">Апартаменты</option>
                <option value="dormitory">Общежитие</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700">Цена за ночь (₽)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="от"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="до"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredHostels.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <Home className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">Жильё не найдено</h3>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Найдено {filteredHostels.length} вариантов жилья
            </div>
          </div>
          <div className="space-y-4">
            {filteredHostels.map(hostel => (
              <HostelCard key={hostel.id} hostel={hostel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}