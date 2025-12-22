export default function DocumentsPage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Мои документы</h1>
      <p className="text-sm text-gray-600">
        Здесь будет список активных договоров (пока UI-заглушка).
      </p>

      <div className="rounded-xl border border-gray-200 p-4">
        <div className="text-sm font-medium">Активные договоры</div>
        <div className="text-sm text-gray-500 mt-1">Пока нет данных.</div>
      </div>
    </div>
  );
}
