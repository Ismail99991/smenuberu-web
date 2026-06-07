"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatDayLabelRu, formatWeekdayShortRu } from "@/lib/slots";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import MonthCalendar from "@/components/month-calendar";

type Props = {
  days: string[];
  value: string;
  onChange: (iso: string) => void;

  hotDays?: Set<string>;
  premiumDays?: Set<string>;

  calendarOpen?: boolean;
  onToggleCalendar?: () => void;
  month?: Date;
  availableDays?: Set<string>;

  onPrevMonth?: () => void;
  onNextMonth?: () => void;
};

export default function DayTabs({
  days,
  value,
  onChange,
  hotDays,
  premiumDays,
  calendarOpen,
  onToggleCalendar,
  month,
  availableDays,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <div className="rounded-3xl bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-zinc-900">Календарь</div>

          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 active:scale-[0.96]"
            aria-label="Что означают точки"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        {onToggleCalendar ? (
          <button
            onClick={onToggleCalendar}
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-200 active:scale-[0.97]"
            aria-label="Переключить календарь"
          >
            {calendarOpen ? "Табы" : "Месяц"}
            {calendarOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      {legendOpen ? (
        <div className="mb-2 rounded-2xl bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Высокий тариф
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Горящие слоты
          </div>
        </div>
      ) : null}

      {!calendarOpen ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {days.map((iso) => {
            const active = iso === value;
            const isHot = hotDays?.has(iso);
            const isPremium = premiumDays?.has(iso);

            return (
              <button
                key={iso}
                onClick={() => onChange(iso)}
                className={cn(
                  "relative min-w-[76px] flex-shrink-0 rounded-xl px-2.5 py-1.5 text-left transition-all active:scale-[0.98]",
                  active
                    ? "bg-[#c29cf2] text-white shadow-[0_8px_18px_rgba(194,156,242,0.28)]"
                    : "bg-zinc-50 text-zinc-800 hover:bg-zinc-100"
                )}
              >
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  {isPremium ? (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-sky-200" : "bg-sky-500"
                      )}
                      title="Высокий тариф"
                    />
                  ) : null}

                  {isHot ? (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-red-300" : "bg-red-500"
                      )}
                      title="Горящие слоты"
                    />
                  ) : null}
                </div>

                <div className={cn("text-[11px]", active ? "text-white/80" : "text-zinc-500")}>
                  {formatWeekdayShortRu(iso)}
                </div>

                <div className="mt-0.5 text-sm font-semibold">
                  {formatDayLabelRu(iso)}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <MonthCalendar
          month={month ?? new Date()}
          value={value}
          onChange={onChange}
          availableDays={availableDays}
          hotDays={hotDays}
          premiumDays={premiumDays}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
        />
      )}
    </div>
  );
}
