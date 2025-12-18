"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

function isoFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function weekdayMon0(d: Date) {
  // 0=Mon ... 6=Sun
  const js = d.getDay(); // 0=Sun
  return (js + 6) % 7;
}

export default function MonthCalendar({
  month,
  value,
  onChange,
  availableDays,
  hotDays,
  premiumDays
}: {
  month: Date; // любая дата внутри нужного месяца
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  availableDays?: Set<string>; // если передать, дни без слотов можно “приглушить”
  hotDays?: Set<string>;
  premiumDays?: Set<string>;
}) {
  const data = useMemo(() => {
    const m0 = startOfMonth(month);
    const m1 = endOfMonth(month);

    const firstCell = addDays(m0, -weekdayMon0(m0)); // с понедельника
    const lastCell = addDays(m1, (6 - weekdayMon0(m1))); // до воскресенья

    const days: { iso: string; inMonth: boolean }[] = [];
    for (let d = firstCell; d <= lastCell; d = addDays(d, 1)) {
      days.push({ iso: isoFromDate(d), inMonth: d.getMonth() === month.getMonth() });
    }

    const title = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(month);
    return { title, days };
  }, [month]);

  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3">
      <div className="px-1 pb-2 text-sm font-semibold capitalize">{data.title}</div>

      <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-[11px] text-zinc-500">
        {weekdays.map((w) => (
          <div key={w} className="text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 px-1">
        {data.days.map(({ iso, inMonth }) => {
          const dayNum = Number(iso.slice(8, 10));
          const active = iso === value;

          const hasAvail = availableDays ? availableDays.has(iso) : true;
          const isHot = hotDays?.has(iso);
          const isPremium = premiumDays?.has(iso);

          return (
            <button
              key={iso}
              onClick={() => onChange(iso)}
              className={cn(
                "relative h-10 rounded-xl border text-sm transition",
                active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                !inMonth ? "opacity-50" : "",
                !hasAvail ? "opacity-60" : ""
              )}
              title={!hasAvail ? "Слотов нет (пока)" : undefined}
            >
              <span className={cn("font-medium", active ? "text-white" : "text-zinc-900")}>
                {dayNum}
              </span>

              {/* notches */}
              <div className="absolute right-2 top-2 flex gap-1">
                {isPremium ? (
                  <span className={cn("h-2 w-2 rounded-full", active ? "bg-sky-300" : "bg-sky-500")} />
                ) : null}
                {isHot ? (
                  <span className={cn("h-2 w-2 rounded-full", active ? "bg-red-300" : "bg-red-500")} />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
