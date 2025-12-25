"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const js = d.getDay(); // 0=Sun
  return (js + 6) % 7; // 0=Mon ... 6=Sun
}

export default function MonthCalendar({
  month,
  value,
  onChange,
  availableDays,
  hotDays,
  premiumDays,
  onPrevMonth,
  onNextMonth,
}: {
  month: Date;
  value: string;
  onChange: (iso: string) => void;
  availableDays?: Set<string>;
  hotDays?: Set<string>;
  premiumDays?: Set<string>;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}) {
  const data = useMemo(() => {
    const m0 = startOfMonth(month);
    const m1 = endOfMonth(month);

    const firstCell = addDays(m0, -weekdayMon0(m0));
    const lastCell = addDays(m1, 6 - weekdayMon0(m1));

    const days: { iso: string; inMonth: boolean }[] = [];
    for (let d = firstCell; d <= lastCell; d = addDays(d, 1)) {
      days.push({
        iso: isoFromDate(d),
        inMonth: d.getMonth() === month.getMonth(),
      });
    }

    const title = new Intl.DateTimeFormat("ru-RU", {
      month: "long",
      year: "numeric",
    }).format(month);

    const today = new Date();
    const todayIso = isoFromDate(today);

    return { title, days, todayIso };
  }, [month]);

  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className={cn(
      "rounded-2xl border border-zinc-200 bg-white p-4",
      "shadow-[0_10px_28px_rgba(0,0,0,0.06)]"
    )}>
      {/* Заголовок с навигацией */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className={cn(
              uiTransition,
              "rounded-xl border border-zinc-200 p-2",
              "hover:bg-zinc-50 active:shadow-inner",
              !onPrevMonth && "invisible"
            )}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="text-sm font-semibold capitalize text-zinc-900">
            {data.title}
          </div>
          
          <button
            onClick={onNextMonth}
            className={cn(
              uiTransition,
              "rounded-xl border border-zinc-200 p-2",
              "hover:bg-zinc-50 active:shadow-inner",
              !onNextMonth && "invisible"
            )}
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={() => onChange(data.todayIso)}
          className={cn(
            uiTransition,
            "rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium",
            "hover:bg-zinc-50 active:shadow-inner"
          )}
        >
          Сегодня
        </button>
      </div>

      {/* Дни недели */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w) => (
          <div 
            key={w} 
            className="text-xs font-medium text-zinc-500 py-1.5"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Дни месяца */}
      <div className="grid grid-cols-7 gap-1">
        {data.days.map(({ iso, inMonth }) => {
          const dayNum = Number(iso.slice(8, 10));
          const active = iso === value;
          const isToday = iso === data.todayIso;

          const hasAvail = availableDays ? availableDays.has(iso) : true;
          const disabled = !hasAvail;
          const isHot = hotDays?.has(iso);
          const isPremium = premiumDays?.has(iso);

          return (
            <button
              key={iso}
              onClick={() => onChange(iso)}
              disabled={disabled}
              className={cn(
                uiTransition,
                "relative flex h-12 flex-col items-center justify-center rounded-xl text-sm",
                "border-2",
                active
                  ? "border-brand bg-brand text-white"
                  : isToday
                  ? "border-brand/30 bg-brand/5 text-brand"
                  : "border-transparent bg-white text-zinc-900 hover:bg-zinc-50",
                !inMonth && "opacity-30",
                disabled && "opacity-50 cursor-not-allowed hover:bg-white"
              )}
              title={!hasAvail ? "Слотов нет (пока)" : undefined}
            >
              {/* Номер дня */}
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-white" : isToday ? "text-brand" : "text-zinc-900",
                  !inMonth && "text-zinc-500"
                )}
              >
                {dayNum}
              </span>

              {/* Индикаторы */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                {isPremium ? (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      active ? "bg-sky-300" : isToday ? "bg-sky-500" : "bg-sky-500"
                    )}
                  />
                ) : null}
                {isHot ? (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      active ? "bg-red-300" : isToday ? "bg-red-500" : "bg-red-500"
                    )}
                  />
                ) : null}
              </div>
              
              {/* Бейдж "Сегодня" */}
              {isToday && !active && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-600">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-brand/20 border border-brand/30"></div>
          <span>Сегодня</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-sky-500"></div>
          <span>Высокий тариф</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span>Горящие</span>
        </div>
      </div>
    </div>
  );
}
