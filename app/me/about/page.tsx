"use client";

import { useAuth } from "@/components/auth-provider";

export default function AboutMePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Загрузка…</div>;
  }

  if (!user) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold">О себе</h1>
        <p className="text-sm text-gray-600">Нужно войти, чтобы увидеть данные.</p>
      </div>
    );
  }

  const displayName =
    (user as any).displayName ?? (user as any).name ?? (user as any).fullName ?? "Без имени";

  const email = (user as any).email ?? null;
  const phone = (user as any).phone ?? null;
  const taxStatus = (user as any).taxStatus ?? null;
  const yandexLogin = (user as any).yandexLogin ?? null;
  const createdAt = (user as any).createdAt ?? null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">О себе</h1>

      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="text-sm text-gray-500">
          Сейчас показываем только то, что реально приходит из <span className="font-mono">/auth/me</span>.
          Остальное — UI-заглушки под будущий профиль исполнителя.
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500">ФИО</div>
            <div className="text-sm">{displayName}</div>
          </div>

          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500">Телефон</div>
            <div className="text-sm text-gray-700">
              {phone ?? <span className="text-gray-400">— (позже из профиля исполнителя)</span>}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500">Email</div>
            <div className="text-sm text-gray-700">{email ?? <span className="text-gray-400">—</span>}</div>
          </div>

          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500">Учетные данные</div>
            <div className="text-sm text-gray-700">
              {yandexLogin ? `Яндекс (${yandexLogin})` : "Яндекс OAuth (cookie-сессия)"}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500">Налоговый статус</div>
            <div className="text-sm text-gray-700">
              {taxStatus ?? <span className="text-gray-400">— (ИП / НПД / ГПХ… позже)</span>}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500">Дата регистрации</div>
            <div className="text-sm text-gray-700">
              {createdAt ? new Date(createdAt).toLocaleString() : <span className="text-gray-400">—</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
