"use client";

import { useAuth } from "@/components/auth-provider";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function RatingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Загрузка…</div>;
  }

  if (!user) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold">Личный рейтинг</h1>
        <p className="text-sm text-gray-600">
          Войдите, чтобы увидеть свой рейтинг.
        </p>
      </div>
    );
  }

  /**
   * ⚠️ Сейчас это UI-заглушка.
   * В будущем сюда можно подключить API:
   * - средний рейтинг
   * - количество смен
   * - отмены / опоздания
   */

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Личный рейтинг</h1>
        <p className="text-sm text-gray-500 mt-1">
          Показатели вашей работы (пока в режиме заглушки)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Средняя оценка" value={<span className="text-gray-300">—</span>} />
        <StatCard label="Выполнено смен" value={<span className="text-gray-300">—</span>} />
        <StatCard label="Отмены" value={<span className="text-gray-300">—</span>} />
        <StatCard label="Опоздания" value={<span className="text-gray-300">—</span>} />
      </div>

      <div className="rounded-xl border border-gray-200 p-4 space-y-2">
        <div className="text-sm font-medium">Как формируется рейтинг</div>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Оценки от объектов после смен</li>
          <li>Количество успешно отработанных смен</li>
          <li>Отмены и опоздания</li>
        </ul>

        <div className="text-xs text-gray-400 pt-2">
          Скоро подключим реальные данные из API
        </div>
      </div>
    </div>
  );
}
