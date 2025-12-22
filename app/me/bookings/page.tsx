"use client";

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  status?: string | null;
  createdAt?: string | null;
  slot?: {
    startsAt?: string | null;
    endsAt?: string | null;
    object?: {
      name?: string | null;
      address?: string | null;
    } | null;
  } | null;
};

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    fetch(`${apiBase()}/bookings/me`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => setItems(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Забронированные смены</h1>
        <p className="text-sm text-gray-600">Нужно войти.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Забронированные смены</h1>

      {loading ? (
        <div className="text-sm text-gray-500">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">Пока нет бронирований</div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="rounded-xl border border-gray-200 p-4">
              <div className="font-medium">
                {b.slot?.object?.name ?? "Объект"}
              </div>
              <div className="text-sm text-gray-500">
                {b.slot?.startsAt} → {b.slot?.endsAt}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
