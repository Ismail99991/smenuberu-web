export default function RatingPage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Личный рейтинг</h1>
      <p className="text-sm text-gray-600">Пока UI-заглушка (подключим позже из API).</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Средняя оценка</div>
          <div className="text-2xl font-semibold text-gray-300 mt-1">—</div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Выполнено смен</div>
          <div className="text-2xl font-semibold text-gray-300 mt-1">—</div>
        </div>
      </div>
    </div>
  );
}
