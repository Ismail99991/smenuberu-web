"use client";

import { useEffect } from "react";

type Instance = { destroy?: () => void };

export function useLiquidWeb(
  ref: React.RefObject<HTMLElement | null>,
  options?: Record<string, any>
) {
  useEffect(() => {
    let instance: Instance | undefined;
    let cancelled = false;

    (async () => {
      const el = ref.current;
      if (!el) return;

      const mod: any = await import("liquid-web");
      if (cancelled) return;

      // ✅ ВАЖНО: берем именно LiquidWeb (named export)
      const LiquidWebCtor =
        mod.LiquidWeb ?? mod.default?.LiquidWeb ?? mod.default;

      if (typeof LiquidWebCtor !== "function") {
        console.error("[LiquidWeb] LiquidWeb export not found:", mod);
        return;
      }

      instance = new LiquidWebCtor(el, {
        mode: "prominent",
        scale: 16,
        blur: 2,
        saturation: 170,
        aberration: 18,
        ...options,
      });
    })();

    return () => {
      cancelled = true;
      instance?.destroy?.();
    };
  }, [ref, options]);
}
