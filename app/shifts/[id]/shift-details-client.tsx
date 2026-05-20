// components/ShiftDetailsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Calendar, Clock, MapPin, Building2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

function formatMoneyRub(v: number) {
  try {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${v} ₽`;
  }
}

function formatDate(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("ru-RU", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });
}

type SlotDetails = {
  id: string;
  objectId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  pay: number;
  type?: string | null;
  hot?: boolean | null;
  published?: boolean;
  object?: {
    id: string;
    name: string;
    city: string;
    address?: string | null;
    logoUrl?: string | null;
  } | null;
};

export default function ShiftDetailsClient({ id }: { id: string }) {
  const [shift, setShift] = useState<SlotDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchShift() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${apiBase()}/slots/${encodeURIComponent(id)}`, {
          credentials: "include",
          headers: { "Accept": "application/json" }
        });
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (data.ok && data.slot) {
          setShift(data.slot);
        } else {
          setError(data.error || "Слот не найден");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Не удалось загрузить данные");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchShift();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const tags = useMemo(() => {
    const t: string[] = [];
    if (shift?.hot) t.push("🔥 Горячая");
    if (shift?.type) t.push(shift.type);
    return t;
  }, [shift]);

  // ✅ ВАЖНО: проверяем loading ПЕРВЫМ!
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-zinc-200 rounded w-3/4" />
              <div className="h-4 bg-zinc-200 rounded w-1/2" />
            </div>
            <div className="h-8 bg-zinc-200 rounded w-24" />
          </div>
          <div className="mt-3 h-4 bg-zinc-200 rounded w-1/3" />
          <div className="mt-4 h-4 bg-zinc-200 rounded w-full" />
        </div>
      </div>
    );
  }

  // ✅ ВАЖНО: проверяем error ВТОРЫМ!
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-base font-semibold">Ошибка</div>
            <p className="mt-1 text-sm break-words">{error}</p>
            <p className="mt-2 text-xs text-red-600/70">ID слота: {id}</p>
            <Link className="mt-4 inline-block text-sm underline" href="/shifts">
              Вернуться к списку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ВАЖНО: если нет данных — показываем "не найдено"
  if (!shift) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
        <div className="text-base font-semibold">Смена не найдена</div>
        <p className="mt-1 text-sm text-zinc-600">Возможно, ссылка устарела</p>
        <Link className="mt-4 inline-block text-sm text-[#c29cf2] hover:underline" href="/shifts">
          ← Вернуться к списку
        </Link>
      </div>
    );
  }

  const time = `${shift.startTime}–${shift.endTime}`;
  const company = shift.object?.name ?? "Объект";
  const city = shift.object?.city ?? "—";
  const address = shift.object?.address ?? "—";
  const formattedDate = formatDate(shift.date);

  return (
    <div className="space-y-4 pb-8">
      {/* Кнопка назад */}
      <Link href="/shifts" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-[#c29cf2] transition-colors">
        <ArrowLeft size={16} />
        Назад к списку
      </Link>

      {/* Основная информация */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-zinc-900">{shift.title}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-600">
                <Building2 size={14} />
                <span>{company}</span>
                <span>·</span>
                <span>{city}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold text-[#c29cf2]">{formatMoneyRub(shift.pay)}</div>
              <div className="mt-1 text-xs text-zinc-500">{time}</div>
            </div>
          </div>

          {/* Теги */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span key={t} className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Дата */}
          <div className="flex items-start gap-2 pt-2 border-t border-zinc-100">
            <Calendar size={16} className="text-zinc-400 mt-0.5 shrink-0" />
            <span className="text-sm text-zinc-700">{formattedDate}</span>
          </div>

          {/* Время */}
          <div className="flex items-start gap-2">
            <Clock size={16} className="text-zinc-400 mt-0.5 shrink-0" />
            <span className="text-sm text-zinc-700">{shift.startTime} – {shift.endTime}</span>
          </div>

          {/* Адрес */}
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-zinc-400 mt-0.5 shrink-0" />
            <div className="text-sm text-zinc-700">{address}</div>
          </div>
        </div>

        {/* Кнопка записи */}
        <div className="border-t border-zinc-200 bg-zinc-50 p-4">
          <button
            onClick={() => {
              // TODO: добавить логику записи
              console.log("Запись на смену:", shift.id);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#c29cf2] text-white rounded-xl font-medium hover:bg-[#b088e8] transition-colors active:scale-[0.97]"
          >
            Записаться на смену
          </button>
        </div>
      </div>

      {/* Оплата */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold text-zinc-900">Оплата</h2>
        <div className="mt-3 rounded-xl border border-zinc-200 p-4">
          <div className="font-medium text-zinc-900">{formatMoneyRub(shift.pay)}</div>
          <p className="mt-1 text-sm text-zinc-600">
            Выплата в течение 1–3 рабочих дней после подтверждения смены
          </p>
        </div>
      </div>
    </div>
  );
}