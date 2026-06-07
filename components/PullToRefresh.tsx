"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  scrollRef?: React.RefObject<HTMLElement | null>;
  maxPull?: number;
  triggerPull?: number;
  startThreshold?: number;
  settleMs?: number;
  axisLockRatio?: number;
  respectSkipAttr?: boolean;
  topTolerance?: number;
};

export default function PullToRefresh({
  onRefresh,
  children,
  scrollRef,
  maxPull = 76,
  triggerPull = 52,
  startThreshold = 6,
  settleMs = 250,
  axisLockRatio = 1.2,
  respectSkipAttr = true,
  topTolerance = 4,
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
  const wasScrollingUpRef = useRef(false);

  const commitPull = useCallback((v: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      setPullUI(v);
    });
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

  const canStartPull = useCallback(() => {
    if (!atTopStrict()) return false;
    if (wasScrollingUpRef.current) return false;

    return true;
  }, [atTopStrict]);

  const rubber = useCallback(
    (d: number) => {
      const dist = Math.max(0, d);
      const k = 0.55;
      const r = maxPull * (1 - Math.exp((-k * dist) / maxPull));

      return Math.min(maxPull, r);
    },
    [maxPull]
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (e.touches.length !== 1) return;

      const t = e.touches[0];

      wasScrollingUpRef.current = false;

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

      if (Math.abs(dx) > Math.abs(dy) * axisLockRatio) return;

      if (dy < 0) {
        wasScrollingUpRef.current = true;

        if (pullingRef.current) {
          reset();
        }

        return;
      }

      if (dy > 0) {
        if (wasScrollingUpRef.current) return;
        if (!canStartPull()) return;
      }

      if (!pullingRef.current && dy < startThreshold) return;

      pullingRef.current = true;

      if (e.cancelable) e.preventDefault();

      const eased = rubber(dy);

      pullRef.current = eased;
      commitPull(eased);
    },
    [
      axisLockRatio,
      canStartPull,
      commitPull,
      reset,
      rubber,
      startThreshold,
    ]
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

    wasScrollingUpRef.current = false;

    if (pullRef.current >= triggerPull && canStartPull()) {
      commitPull(maxPull);
      void finishRefresh();
      return;
    }

    reset();
  }, [canStartPull, commitPull, finishRefresh, maxPull, reset, triggerPull]);

  const handleTouchCancel = useCallback(() => {
    wasScrollingUpRef.current = false;

    if (!refreshingRef.current) reset();
  }, [reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = document;

    el.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });

    el.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });

    el.addEventListener("touchend", handleTouchEnd, {
      passive: true,
      capture: true,
    });

    el.addEventListener("touchcancel", handleTouchCancel, {
      passive: true,
      capture: true,
    });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      } as any);

      el.removeEventListener("touchmove", handleTouchMove, {
        capture: true,
      } as any);

      el.removeEventListener("touchend", handleTouchEnd, {
        capture: true,
      } as any);

      el.removeEventListener("touchcancel", handleTouchCancel, {
        capture: true,
      } as any);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  const progress = Math.min(pullUI / maxPull, 1);
  const translateY = Math.min(pullUI, maxPull) - maxPull;
  const visible = pullUI > 4 || refreshingUI;
  const rotateDeg = refreshingUI ? 0 : progress * 320;

  return (
    <>
      <div
        className="pointer-events-none fixed left-0 right-0 z-50 flex items-center justify-center"
        style={{
          top: "var(--topbar-offset, env(safe-area-inset-top))",
          transform: `translateY(${translateY}px)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 140ms ease",
        }}
      >
        <RefreshCw
          size={22}
          className={cn(
            "mt-3 text-[#c29cf2] drop-shadow-sm",
            refreshingUI ? "animate-spin" : ""
          )}
          style={{
            transform: refreshingUI ? undefined : `rotate(${rotateDeg}deg)`,
            transition: refreshingUI ? "none" : "transform 80ms linear",
          }}
        />
      </div>

      <div className={refreshingUI ? "opacity-80 pointer-events-none" : ""}>
        {children}
      </div>
    </>
  );
}
