"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;

  /** если скроллится контейнер overflow-auto — передай ref */
  scrollRef?: React.RefObject<HTMLElement | null>;

  maxPull?: number;
  triggerPull?: number;
  startThreshold?: number;
  settleMs?: number;

  axisLockRatio?: number;
  respectSkipAttr?: boolean;

  /** iOS иногда даёт 1–2px вместо 0 */
  topTolerance?: number;
};

export default function PullToRefresh({
  onRefresh,
  children,
  scrollRef,
  maxPull = 88,
  triggerPull = 56,
  startThreshold = 6,
  settleMs = 250,
  axisLockRatio = 1.2,
  respectSkipAttr = true,
  topTolerance = 4, // увеличил до 4px для надёжности
}: PullToRefreshProps) {
  const [pullUI, setPullUI] = useState(0);
  const [refreshingUI, setRefreshingUI] = useState(false);

  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const pullRef = useRef(0);
  const pullingRef = useRef(false);
  const refreshingRef = useRef(false);
  const skipGestureRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  
  // ✅ Добавляем флаг: было ли движение вверх до того, как дошли до верха
  const wasScrollingUpRef = useRef(false);

  const commitPull = useCallback((v: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setPullUI(v));
  }, []);

  const reset = useCallback(() => {
    startYRef.current = null;
    startXRef.current = null;
    pullRef.current = 0;
    pullingRef.current = false;
    skipGestureRef.current = false;
    wasScrollingUpRef.current = false;
    commitPull(0);
  }, [commitPull]);

  const getScrollTop = useCallback(() => {
    if (typeof window === "undefined") return 0;

    const container = scrollRef?.current;
    if (container) return container.scrollTop;

    return document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;
  }, [scrollRef]);

  const atTopStrict = useCallback(() => {
    if (typeof window === "undefined") return true;
    const scrollTop = getScrollTop();
    return scrollTop <= topTolerance;
  }, [getScrollTop, topTolerance]);

  // ✅ Дополнительная проверка: точно ли юзер пытается потянуть с верха
  const canStartPull = useCallback(() => {
    if (!atTopStrict()) return false;
    
    // ✅ Если был скролл вверх (пальцем вниз) — не запускаем PTR
    // Это ключевое исправление!
    if (wasScrollingUpRef.current) return false;
    
    return true;
  }, [atTopStrict]);

  const rubber = (d: number) => {
    const dist = Math.max(0, d);
    const k = 0.55;
    const r = maxPull * (1 - Math.exp((-k * dist) / maxPull));
    return Math.min(maxPull, r);
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (e.touches.length !== 1) return;

      const t = e.touches[0];

      // ✅ Сбрасываем флаг скролла вверх при новом касании
      wasScrollingUpRef.current = false;

      // ✅ skip-зоны (карусели/карточки)
      if (respectSkipAttr) {
        const target = e.target as HTMLElement | null;
        if (target?.closest?.("[data-ptr-skip]")) {
          skipGestureRef.current = true;
          return;
        }
      }

      startYRef.current = t.clientY;
      startXRef.current = t.clientX;
      pullingRef.current = false;
      pullRef.current = 0;
      commitPull(0);
    },
    [commitPull, respectSkipAttr]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (skipGestureRef.current) return;
      if (e.touches.length !== 1) return;
      if (startYRef.current == null || startXRef.current == null) return;

      const t = e.touches[0];
      const dy = t.clientY - startYRef.current;
      const dx = t.clientX - startXRef.current;

      // ✅ Если жест горизонтальный — не вмешиваемся
      if (Math.abs(dx) > Math.abs(dy) * axisLockRatio) return;

      // ✅ Если палец движется ВВЕРХ (dy < 0) — это обычный скролл вниз по странице
      // Запоминаем, что юзер скроллит, и не даём PTR активироваться
      if (dy < 0) {
        wasScrollingUpRef.current = true;
        if (pullingRef.current) {
          reset();
        }
        return;
      }

      // ✅ Если палец движется ВНИЗ (dy > 0) — проверяем, можем ли запустить PTR
      if (dy > 0) {
        // ✅ Если юзер скроллил вверх (по странице вниз) — не активируем PTR
        if (wasScrollingUpRef.current) {
          return;
        }
        
        // ✅ Проверяем, что мы точно наверху
        if (!canStartPull()) {
          return;
        }
      }

      // Небольшой порог перед активацией
      if (!pullingRef.current && dy < startThreshold) return;
      
      pullingRef.current = true;

      if (e.cancelable) e.preventDefault();

      const eased = rubber(dy);
      pullRef.current = eased;
      commitPull(eased);
    },
    [axisLockRatio, canStartPull, commitPull, reset, rubber, startThreshold]
  );

  const finishRefresh = useCallback(async () => {
    refreshingRef.current = true;
    setRefreshingUI(true);

    try {
      await onRefresh();
    } finally {
      window.setTimeout(() => {
        refreshingRef.current = false;
        setRefreshingUI(false);
        reset();
      }, settleMs);
    }
  }, [onRefresh, reset, settleMs]);

  const handleTouchEnd = useCallback(() => {
    if (skipGestureRef.current) {
      reset();
      return;
    }
    if (refreshingRef.current) {
      reset();
      return;
    }

    // ✅ Сбрасываем флаг скролла
    wasScrollingUpRef.current = false;

    if (pullRef.current >= triggerPull && canStartPull()) {
      commitPull(maxPull);
      void finishRefresh();
      return;
    }

    reset();
  }, [commitPull, finishRefresh, maxPull, reset, triggerPull, canStartPull]);

  const handleTouchCancel = useCallback(() => {
    wasScrollingUpRef.current = false;
    if (!refreshingRef.current) reset();
  }, [reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = document;

    el.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
    el.addEventListener("touchcancel", handleTouchCancel, { passive: true, capture: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart, { capture: true } as any);
      el.removeEventListener("touchmove", handleTouchMove, { capture: true } as any);
      el.removeEventListener("touchend", handleTouchEnd, { capture: true } as any);
      el.removeEventListener("touchcancel", handleTouchCancel, { capture: true } as any);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  const progress = Math.min(pullUI / maxPull, 1);
  const translateY = Math.min(pullUI, maxPull) - maxPull;
  const visible = pullUI > 4 || refreshingUI;
  const rotateDeg = refreshingUI ? 0 : progress * 360 * 1.2;

  return (
    <>
      <div
        className="fixed left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        style={{
          top: "var(--topbar-offset, env(safe-area-inset-top))",
          transform: `translateY(${translateY}px)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 160ms ease",
        }}
      >
        <div className="mt-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 px-4 py-3 flex items-center gap-3">
          <div className="grid place-items-center rounded-xl h-11 w-11 bg-gradient-to-br from-black/5 to-black/0">
            <RefreshCw
              size={22}
              className={cn(refreshingUI ? "animate-spin" : "", "text-[#c29cf2]")}
              style={{
                transform: `rotate(${rotateDeg}deg)`,
                transition: refreshingUI ? "none" : "transform 80ms linear",
              }}
            />
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-sm font-medium text-black/80">
              {refreshingUI
                ? "Обновляю…"
                : progress >= 1
                ? "Отпусти, чтобы обновить"
                : "Потяни вниз"}
            </div>
            <div className="text-xs text-black/45">
              {refreshingUI ? "Секунду" : `${Math.round(progress * 100)}%`}
            </div>
          </div>
        </div>
      </div>

      <div className={refreshingUI ? "opacity-60 pointer-events-none" : ""}>
        {children}
      </div>
    </>
  );
}