"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;

  /** если scroll не window, можно передать ref */
  scrollRef?: React.RefObject<HTMLElement | null>;

  maxPull?: number;
  triggerPull?: number;
  startThreshold?: number;
  settleMs?: number;

  /** защита от горизонтальных свайпов */
  axisLockRatio?: number;

  /** игнорировать жесты внутри data-ptr-skip */
  respectSkipAttr?: boolean;
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

  const baseElRef = useRef<HTMLElement | null>(null);

  /* ================= helpers ================= */

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
    commitPull(0);
  }, [commitPull]);

  const getScrollTop = useCallback(() => {
    if (typeof window === "undefined") return 0;

    const el = scrollRef?.current ?? baseElRef.current;
    if (el && el !== document.documentElement) return el.scrollTop;

    return document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;
  }, [scrollRef]);

  const atTop = useCallback(() => {
    if (typeof window === "undefined") return true;
    return getScrollTop() <= 0;
  }, [getScrollTop]);

  /** резиновое сопротивление */
  const rubber = (d: number) => {
    const dist = Math.max(0, d);
    const k = 0.55;
    const r = maxPull * (1 - Math.exp((-k * dist) / maxPull));
    return Math.min(maxPull, r);
  };

  /* ================= touch handlers ================= */

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (!atTop()) return;
      if (e.touches.length !== 1) return;

      if (respectSkipAttr) {
        const target = e.target as HTMLElement | null;
        if (target?.closest?.("[data-ptr-skip]")) {
          skipGestureRef.current = true;
          return;
        }
      }

      const t = e.touches[0];
      startYRef.current = t.clientY;
      startXRef.current = t.clientX;
      pullingRef.current = false;
      pullRef.current = 0;
      commitPull(0);
    },
    [atTop, commitPull, respectSkipAttr]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (skipGestureRef.current) return;
      if (!atTop()) return;
      if (e.touches.length !== 1) return;
      if (startYRef.current == null || startXRef.current == null) return;

      const t = e.touches[0];
      const dy = t.clientY - startYRef.current;
      const dx = t.clientX - startXRef.current;

      // 👉 горизонтальный жест — не вмешиваемся
      if (Math.abs(dx) > Math.abs(dy) * axisLockRatio) return;

      if (dy <= 0) {
        reset();
        return;
      }

      if (!pullingRef.current && dy < startThreshold) return;
      pullingRef.current = true;

      if (e.cancelable) e.preventDefault();

      const eased = rubber(dy);
      pullRef.current = eased;
      commitPull(eased);
    },
    [atTop, axisLockRatio, commitPull, maxPull, reset, startThreshold]
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

    if (pullRef.current >= triggerPull) {
      commitPull(maxPull);
      void finishRefresh();
      return;
    }

    reset();
  }, [commitPull, finishRefresh, maxPull, reset, triggerPull]);

  const handleTouchCancel = useCallback(() => {
    if (!refreshingRef.current) reset();
  }, [reset]);

  /* ================= lifecycle ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    baseElRef.current = scrollRef?.current ?? document.documentElement;
    const el = baseElRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchCancel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  /* ================= UI ================= */

  const progress = Math.min(pullUI / maxPull, 1);
  const translateY = Math.min(pullUI, maxPull) - maxPull;
  const visible = pullUI > 4 || refreshingUI;
  const rotateDeg = refreshingUI ? 0 : progress * 360 * 1.2;

  return (
    <>
      {/* индикатор */}
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
              className={`text-brand ${refreshingUI ? "animate-spin" : ""}`}
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

      {/* контент */}
      <div className={refreshingUI ? "opacity-60 pointer-events-none" : ""}>
        {children}
      </div>
    </>
  );
}
