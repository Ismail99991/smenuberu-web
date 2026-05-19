"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Users, 
  Wifi, 
  Utensils, 
  Bath,
  ParkingCircle,
  Tv,
  Shirt,
  Bed,
  Phone,
  Calendar,
  CheckCircle
} from "lucide-react";
import { mockHostels } from "@/lib/housing";
import { cn } from "@/lib/cn";

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

export default function HousingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const hostel = mockHostels.find(h => h.id === id);

  if (!hostel) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 p-8 text-center">
        <h2 className="text-lg font-semibold">Жильё не найдено</h2>
        <button
          onClick={() => router.push("/housing")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Вернуться к списку
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Назад</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 space-y-6 py-6">
        <div className="overflow-hidden rounded-2xl bg-gray-100">
          <img 
            src={hostel.photos[0]} 
            alt={hostel.name}
            className="h-64 w-full object-cover"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{hostel.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-zinc-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{hostel.city}, {hostel.address}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-zinc-900">
                {hostel.pricePerNight.toLocaleString()} ₽
              </div>
              <div className="text-xs text-zinc-500">за ночь</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{hostel.rating}</span>
              <span className="text-sm text-zinc-500">({hostel.reviews} отзывов)</span>
            </div>
            {hostel.isPartner && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                Партнёр платформы
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Описание</h2>
          <p className="text-zinc-600 leading-relaxed">{hostel.description}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Удобства</h2>
          <div className="grid grid-cols-2 gap-3">
            {hostel.amenities.map(amenity => {
              const Icon = amenityIcons[amenity];
              return (
                <div key={amenity} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2">
                  <Icon className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-700">{amenityLabels[amenity]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-3">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Users className="h-4 w-4" />
              <span>Свободные места</span>
            </div>
            <div className="mt-1 text-xl font-bold text-zinc-900">
              {hostel.availableBeds} / {hostel.totalBeds}
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
              <div 
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(hostel.availableBeds / hostel.totalBeds) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Calendar className="h-4 w-4" />
              <span>Доступно с</span>
            </div>
            <div className="mt-1 text-lg font-semibold text-zinc-900">
              {new Date(hostel.availableFrom).toLocaleDateString("ru-RU")}
            </div>
          </div>
        </div>

        {hostel.pricePerWeek && (
          <div className="space-y-2 rounded-xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-4">
            <h3 className="font-semibold text-zinc-900">Специальные цены</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <div className="text-xs text-zinc-500">Неделя</div>
                <div className="text-lg font-bold text-emerald-700">
                  {hostel.pricePerWeek.toLocaleString()} ₽
                </div>
              </div>
              {hostel.pricePerMonth && (
                <div>
                  <div className="text-xs text-zinc-500">Месяц</div>
                  <div className="text-lg font-bold text-emerald-700">
                    {hostel.pricePerMonth.toLocaleString()} ₽
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
          <h2 className="font-semibold text-zinc-900">Контакты для связи</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-zinc-500" />
              <a href={`tel:${hostel.contactPhone}`} className="text-blue-600 hover:underline">
                {hostel.contactPhone}
              </a>
            </div>
            <div className="text-sm text-zinc-500">
              Контактное лицо: {hostel.contactName}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={`tel:${hostel.contactPhone}`}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-center font-semibold text-white hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            Позвонить
          </a>
          <button
            onClick={() => alert("Функция бронирования в разработке")}
            className="flex-1 rounded-xl border border-emerald-600 bg-white px-4 py-3 text-center font-semibold text-emerald-600 hover:bg-emerald-50 transition-all"
          >
            Забронировать
          </button>
        </div>

        {hostel.isPartner && (
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Партнёрское жильё</span>
            </div>
            <p className="mt-1 text-sm text-blue-600">
              Этот объект сотрудничает с нашей платформой
            </p>
          </div>
        )}
      </div>
    </div>
  );
}