"use client";

import { useEffect } from "react";

type LiquidWebInstance = { destroy?: () => void };

export function useLiquidWeb(
  ref: React.RefObject<HTMLElement | null>,
  options?: Record<string, any>
) {
  useEffect(() => {
    let instance: LiquidWebInstance | null = null;
    let cancelled = false;

    (async () => {
      if (!ref.current) return;

      // Важно: динамический импорт — чтобы не сломать SSR
      const mod = await import("liquid-web");
      if (cancelled) return;

      const LiquidWeb = (mod as any).LiquidWeb;
      instance = new LiquidWeb(ref.current, {
        // хорошие “дефолты” под iOS-like glass
        mode: "prominent",   // или "shader" если хочется сильнее
        blur: 2,
        saturation: 170,
        scale: 18,
        aberration: 25,
        ...options,
      });
    })();

    return () => {
      cancelled = true;
      instance?.destroy?.();
    };
  }, [ref, options]);
}
