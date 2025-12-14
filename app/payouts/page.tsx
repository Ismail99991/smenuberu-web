export default function PayoutsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-base font-semibold">Выплаты</div>
        <p className="mt-1 text-sm text-zinc-600">
          UI-only. Тут будет история выплат, статусы (в обработке / выплачено) и реквизиты.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">Реквизиты</div>
        <div className="mt-3 grid gap-2">
          <div className="rounded-xl border border-zinc-200 p-3 text-sm text-zinc-700">
            Способ выплаты: не указан
          </div>
          <div className="rounded-xl border border-zinc-200 p-3 text-sm text-zinc-700">
            Налоговый статус: не указан
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">История</div>
        <p className="mt-1 text-sm text-zinc-600">
          Пока пусто. После завершённых смен появятся начисления и выплаты.
        </p>
      </div>
    </div>
  );
}
