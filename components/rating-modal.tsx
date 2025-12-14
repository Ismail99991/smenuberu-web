"use client";

import { useEffect, useState } from "react";
import { setRating } from "@/lib/rating-state";

export default function RatingModal({
  open,
  slotTitle,
  onClose,
  slotId
}: {
  open: boolean;
  slotId: string;
  slotTitle: string;
  onClose: () => void;
}) {
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setStars(5);
      setComment("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-10 w-[min(520px,calc(100%-16px))] -translate-x-1/2">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4">
            <div>
              <div className="text-sm text-zinc-500">Оценка после смены</div>
              <div className="text-base font-semibold">{slotTitle}</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              Закрыть
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <div className="text-sm font-medium">Рейтинг</div>
              <div className="mt-2 flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setStars(n as 1|2|3|4|5)}
                    className={[
                      "h-10 w-10 rounded-xl border text-lg",
                      stars >= n ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white"
                    ].join(" ")}
                    aria-label={`${n} звезд`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Комментарий (необязательно)</div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например: всё ок, адекватный менеджер, понятные задачи…"
                className="mt-2 w-full rounded-2xl border border-zinc-200 p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                rows={4}
              />
            </div>

            <button
              onClick={() => {
                setRating(slotId, stars, comment.trim() || undefined);
                onClose();
              }}
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
            >
              Сохранить оценку
            </button>

            <div className="text-xs text-zinc-500">UI-only: сохраняем в localStorage.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
