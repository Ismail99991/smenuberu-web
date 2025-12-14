"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/components/badge";
import { shifts, formatMoneyRub } from "@/lib/mock";
import {
  getStatus,
  setStatus,
  type ApplicationStatus
} from "@/lib/application-state";

function StatusPill({ status }: { status: ApplicationStatus }) {
  const text =
    status === "none"
      ? "Не откликался"
      : status === "applied"
        ? "Отклик отправлен"
        : status === "accepted"
          ? "Принят"
          : "Отклонён";

  const cls =
    status === "none"
      ? "border-zinc-200 text-zinc-700"
      : status === "applied"
        ? "border-zinc-300 text-zinc-900"
        : status === "accepted"
          ? "border-emerald-200 text-emerald-700"
          : "border-rose-200 text-rose-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs ${cls}`}
    >
      {text}
    </span>
  );
}

export default function ShiftDetailsClient({ id }: { id: string }) {
  const shift = useMemo(() => shifts.find((s) => s.id === id), [id]);
  const [status, setLocalStatus] = useState<ApplicationStatus>("none");

  useEffect(() => {
    setLocalStatus(getStatus(id));
  }, [id]);

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

  const canApply = status === "none" || status === "rejected";
  const canCancel = status === "applied";

  return (
    <div className="space-y-4">
      {/* Основное */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">{shift.title}</div>
            <div className="mt-1 text-sm text-zinc-600">
              {shift.company} · {shift.city}
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-semibold">
              {formatMoneyRub(shift.pay)}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {shift.dateLabel} · {shift.time}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={status} />
          {shift.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <div className="mt-4 text-sm text-zinc-700">{shift.description}</div>

        <div className="mt-4 text-sm text-zinc-600">
          <div>
            <span className="font-medium text-zinc-800">Адрес:</span>{" "}
            {shift.address}
          </div>
        </div>
      </div>

      {/* Требования */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">Требования</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
          {shift.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      {/* Оплата и выплаты */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">Оплата и выплаты</div>

        <div className="mt-3 grid gap-3 text-sm">
          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="font-medium text-zinc-900">Когда платят</div>
            <p className="mt-1 text-zinc-600">
              Обычно —{" "}
              <span className="font-medium text-zinc-900">
                в течение 1–3 рабочих дней
              </span>{" "}
              после подтверждения смены заказчиком. (UI-only, правило уточним в
              контракте)
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="font-medium text-zinc-900">Как считается сумма</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-600">
              <li>Оплата за смену фиксированная (как в карточке смены)</li>
              <li>Если есть бонусы/чаевые — они будут отдельной строкой (позже)</li>
              <li>Комиссии/налоги зависят от статуса исполнителя (позже)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="font-medium text-zinc-900">Условия удержаний</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-600">
              <li>
                <span className="font-medium text-zinc-900">No-show</span>{" "}
                (неявка без предупреждения) — возможна отмена оплаты и ограничения
                доступа
              </li>
              <li>
                <span className="font-medium text-zinc-900">Опоздание</span> —
                может уменьшить оплату (по правилам объекта/заказчика)
              </li>
              <li>
                <span className="font-medium text-zinc-900">
                  Отмена в последний момент
                </span>{" "}
                — возможен штраф/понижение рейтинга (позже)
              </li>
            </ul>
            <p className="mt-2 text-xs text-zinc-500">
              Это пока UX-заглушка: конкретные правила зафиксируем в продуктовой
              политике и контракте.
            </p>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-2">
          <button
            disabled={!canApply}
            onClick={() => {
              setStatus(id, "applied");
              setLocalStatus("applied");
            }}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Откликнуться
          </button>

          <button
            disabled={!canCancel}
            onClick={() => {
              setStatus(id, "none");
              setLocalStatus("none");
            }}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 disabled:opacity-50"
          >
            Отменить отклик
          </button>

          {/* Демо-переключатель статуса (уберём позже) */}
          <div className="mt-3 text-xs text-zinc-500">
            Демо: сменить статус →
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                ["none", "applied", "accepted", "rejected"] as ApplicationStatus[]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(id, s);
                    setLocalStatus(s);
                  }}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Link href="/shifts" className="block text-center text-sm text-zinc-600 underline">
        Назад к списку
      </Link>
    </div>
  );
}
