"use client";

import { cn } from "@/lib/cn";
import {
  uiCard,
  uiTab,
  uiButtonGhost,
  uiTransition,
} from "@/lib/ui";
import { formatDayLabelRu, formatWeekdayShortRu } from "@/lib/slots";
import { ChevronDown, ChevronUp } from "lucide-react";
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
}: Props) {
  return (
    <div className={cn(uiCard, "p-3")}>
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="text-sm font-semibold">Календарь</div>

        {onToggleCalendar && (
          <button
            onClick={onToggleCalendar}
            className={cn(
              uiButtonGhost,
              "px-3 py-2 text-sm rounded-xl border border-zinc-200"
            )}
            aria-label="Переключить календарь"
          >
            {calendarOpen ? "Табы" : "Месяц"}
            {calendarOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* РЕЖИМ 1: табы */}
      {!calendarOpen ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            {days.map((iso) => {
              const active = iso === value;
              const isHot = hotDays?.has(iso);
              const isPremium = premiumDays?.has(iso);

              return (
                <button
                  key={iso}
                  onClick={() => onChange(iso)}
                  data-active={active}
                  className={cn(
                    uiTab,
                    "relative min-w-[92px] flex-shrink-0 border text-left",
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                  )}
                >
                  {/* маркеры */}
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    {isPremium && (
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors duration-150",
                          active ? "bg-sky-300" : "bg-sky-500"
                        )}
                        title="Высокий тариф"
                      />
                    )}
                    {isHot && (
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors duration-150",
                          active ? "bg-red-300" : "bg-red-500"
                        )}
                        title="Горящие слоты"
                      />
                    )}
                  </div>

                  <div
                    className={cn(
                      "text-xs transition-colors duration-150",
                      active ? "text-white/80" : "text-zinc-500"
                    )}
                  >
                    {formatWeekdayShortRu(iso)}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {formatDayLabelRu(iso)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex flex-wrap gap-3 px-1 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> высокий тариф
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> горящие слоты
            </div>
          </div>
        </>
      ) : (
        <div className={cn(uiTransition)}>
          <MonthCalendar
            month={month ?? new Date()}
            value={value}
            onChange={onChange}
            availableDays={availableDays}
            hotDays={hotDays}
            premiumDays={premiumDays}
          />
        </div>
      )}
    </div>
  );
}
