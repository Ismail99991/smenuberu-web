import Link from "next/link";
import Badge from "@/components/badge";
import type { Shift } from "@/lib/mock";
import { formatMoneyRub, formatDayLabelRu, formatWeekdayShortRu } from "@/lib/mock";

export default function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <Link
      href={`/shifts/${shift.id}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{shift.title}</div>
          <div className="mt-1 text-sm text-zinc-600">
            {shift.company} · {shift.city}
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-semibold">{formatMoneyRub(shift.pay)}</div>
          <div className="mt-1 text-xs text-zinc-500">
            {formatWeekdayShortRu(shift.date)} · {formatDayLabelRu(shift.date)} · {shift.time}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {shift.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>

      <div className="mt-3 text-sm text-zinc-600">{shift.address}</div>
    </Link>
  );
}
