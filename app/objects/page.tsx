import EmptyState from "@/components/empty-state";

export default function ObjectsPage() {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Объекты пока не привязаны"
        description="Здесь появятся объекты, где ты можешь работать (назначения/допуски — позже)."
        actionHref="/shifts"
        actionLabel="Смотреть смены"
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">Как это будет работать</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
          <li>Объекты назначаются компанией или через приглашение</li>
          <li>По объектам будут правила/инструкции и контакты</li>
          <li>Смены будут фильтроваться по доступным объектам</li>
        </ul>
      </div>
    </div>
  );
}
