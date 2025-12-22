"use client";

import { useAuth } from "@/components/auth-provider";

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-700 mt-1">{value}</div>
    </div>
  );
}

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
  const phone = (user as any).phone ?? null; // пока заглушка, если нет в /auth/me
  const taxStatus = (user as any).taxStatus ?? null; // позже
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
          <Field label="ФИО" value={displayName} />
          <Field
            label="Телефон"
            value={phone ?? <span className="text-gray-400">— (позже из профиля исполнителя)</span>}
          />
          <Field label="Email" value={email ?? <span className="text-gray-400">—</span>} />
          <Field
            label="Учетные данные"
            value={yandexLogin ? `Яндекс (${yandexLogin})` : "Яндекс OAuth (cookie-сессия)"}
          />
          <Field
            label="Налоговый статус"
            value={taxStatus ?? <span className="text-gray-400">— (ИП / НПД / ГПХ… позже)</span>}
          />
          <Field
            label="Дата регистрации"
            value={
              createdAt
                ? new Date(createdAt).toLocaleString()
                : <span className="text-gray-400">—</span>
            }
          />
        </div>
      </div>
    </div>
  );
}
