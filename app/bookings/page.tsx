"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
} from "lucide-react";

type BookingStatus = "booked" | "cancelled" | "completed" | "pending";

type Booking = {
  id: string;
  status: BookingStatus;
  createdAt: string;
  startsAt: string;
  endsAt: string;
  slot: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    pay: number;
    hot: boolean;
    object: {
      id: string;
      name: string;
      city: string;
      address: string | null;
      logoUrl: string | null;
    };
  };
};

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5);
}

function getStatusConfig(status: BookingStatus) {
  switch (status) {
    case "booked":
      return {
        label: "Подтверждено",
        icon: CheckCircle,
        color: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    case "cancelled":
      return {
        label: "Отменено",
        icon: XCircle,
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
      };
    case "completed":
      return {
        label: "Завершено",
        icon: CheckCircle,
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
    case "pending":
      return {
        label: "Ожидает подтверждения",
        icon: ClockIcon,
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    default:
      return {
        label: "Неизвестно",
        icon: AlertCircle,
        color: "text-gray-700",
        bg: "bg-gray-50",
        border: "border-gray-200",
      };
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BookingStatus | "all">("all");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch(`${apiBase()}/bookings/me`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Ошибка загрузки бронирований");

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить бронирования");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const tabs: { value: BookingStatus | "all"; label: string }[] = [
    { value: "all", label: "Все" },
    { value: "booked", label: "Активные" },
    { value: "pending", label: "Ожидают" },
    { value: "completed", label: "Завершённые" },
    { value: "cancelled", label: "Отменённые" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-semibold">Мои бронирования</h1>
        <p className="text-sm text-gray-500 mt-1">
          {bookings.length} бронировани{getDeclension(bookings.length)}
        </p>
      </div>

      {/* Табы */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = tab.value === "all" 
            ? bookings.length 
            : bookings.filter((b) => b.status === tab.value).length;
          
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? "bg-[#c29cf2] text-white" 
                  : "text-gray-600 hover:bg-gray-100"}
              `}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-2 text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Список бронирований */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="flex justify-center mb-4">
            <Calendar className="h-12 w-12 text-gray-300" />
          </div>
          <h2 className="text-lg font-medium mb-2">Нет бронирований</h2>
          <p className="text-sm text-gray-500">
            {activeTab === "all" 
              ? "У вас пока нет бронирований. Перейдите в раздел «Смены», чтобы записаться."
              : "В этой категории нет бронирований"}
          </p>
          {activeTab !== "all" && (
            <button
              onClick={() => setActiveTab("all")}
              className="mt-4 text-sm text-[#c29cf2] hover:underline"
            >
              Показать все
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const slot = booking.slot;
            const object = slot?.object;

            return (
              <Link
                key={booking.id}
                href={`/shifts/${slot?.id}`}
                className={`
                  block rounded-xl border p-4 transition-all hover:shadow-md
                  ${statusConfig.bg} ${statusConfig.border}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-zinc-900">
                        {slot?.title || "Смена"}
                      </h3>
                      {slot?.hot && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          🔥 Горящая
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{object?.name || "Объект не найден"}</span>
                      <span>•</span>
                      <MapPin className="h-4 w-4" />
                      <span>{object?.city || "—"}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {slot?.date ? formatDate(slot.date) : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {slot?.startTime && slot?.endTime 
                          ? `${formatTime(slot.startTime)}–${formatTime(slot.endTime)}`
                          : "—"}
                      </span>
                      <span className="font-semibold text-[#c29cf2]">
                        {slot?.pay ? `${slot.pay.toLocaleString()} ₽` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${statusConfig.bg} ${statusConfig.color}
                    `}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getDeclension(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "е";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "я";
  return "й";
}