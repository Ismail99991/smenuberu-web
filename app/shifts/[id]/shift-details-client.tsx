"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/components/badge";
import { AlertTriangle } from "lucide-react";

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

function formatMoneyRub(v: number) {
  try {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${v} ₽`;
  }
}

function weekdayShortRu(dateISO: string) {
  // dateISO: YYYY-MM-DD
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("ru-RU", { weekday: "short" });
}

function dayLabelRu(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
}

type SlotDetails = {
  id: string;
  objectId: string;
  title: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  pay: number;
  type?: string | null;
  hot?: boolean | null;

  // если бэк отдаёт объект — отлично; если нет, этот блок можно убрать
  object?: {
    id: string;
    name: string;
    city: string;
    address?: string | null;
  } | null;
};

export default function ShiftDetailsClient({ id }: { id: string }) {
  const [shift, setShift] = useState<SlotDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    // ⚠️ если у тебя другой эндпоинт — поменяй здесь
    api<SlotDetails>(`/slots/${encodeURIComponent(id)}`)
      .then((d) => {
        if (!alive) return;
        setShift(d);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message ?? "Не удалось загрузить смену");
        setShift(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const tags = useMemo(() => {
    const t: string[] = [];
    if (shift?.hot) t.push("🔥 Горячая");
    if (shift?.type) t.push(String(shift.type));
    return t;
  }, [shift]);

  if (loading) {
    return <div className="text-sm text-zinc-500">Загрузка…</div>;
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="min-w-0">
            <div className="text-base font-semibold">Ошибка</div>
            <p className="mt-1 text-sm break-words">{err}</p>
            <Link className="mt-4 inline-block text-sm underline" href="/shifts">
              Вернуться к списку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-base font-semibold">Смена не найдена</div>
        <p className="mt-1 text-sm text-zinc-600">Возможно, ссылка устарела.</p>
        <Link className="mt-4 inline-block text-sm underline" href="/shifts">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  const time = `${shift.startTime}–${shift.endTime}`;
  const company = shift.object?.name ?? "Объект";
  const city = shift.object?.city ?? "—";
  const address = shift.object?.address ?? "—";

  return (
    <div className="space-y-4">
      {/* Основное */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">{shift.title}</div>
            <div className="mt-1 text-sm text-zinc-600">
              {company} · {city}
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-semibold">{formatMoneyRub(shift.pay)}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {weekdayShortRu(shift.date)} · {dayLabelRu(shift.date)} · {time}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <div className="mt-4 text-sm text-zinc-600">
          <div>
            <span className="font-medium text-zinc-800">Адрес:</span> {address}
          </div>
        </div>
      </div>

      {/* Оплата и выплаты (оставил как заглушку, ок) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">Оплата и выплаты</div>
        <div className="mt-3 grid gap-3 text-sm">
          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="font-medium text-zinc-900">Когда платят</div>
            <p className="mt-1 text-zinc-600">
              Обычно — <span className="font-medium text-zinc-900">в течение 1–3 рабочих дней</span> после подтверждения смены заказчиком.
            </p>
          </div>
        </div>
      </div>

      <Link href="/shifts" className="block text-center text-sm text-zinc-600 underline">
        Назад к списку
      </Link>
    </div>
  );
}
