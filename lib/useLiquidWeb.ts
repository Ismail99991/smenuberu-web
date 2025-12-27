"use client";

import { useEffect } from "react";

type Cleanup = (() => void) | undefined;

export function useLiquidWeb(
  ref: React.RefObject<HTMLElement | null>,
  options?: Record<string, any>
) {
  useEffect(() => {
    let cleanup: Cleanup;
    let cancelled = false;

    (async () => {
      if (!ref.current) return;

      const mod = await import("liquid-web");
      if (cancelled) return;

      /**
       * ВАЖНО:
       * liquid-web экспортирует функцию, а не класс
       * чаще всего это default export
       */
      const init =
        (mod as any).default ??
        (mod as any).init ??
        (mod as any).create ??
        mod;

      if (typeof init !== "function") {
        console.error("[LiquidWeb] Invalid export:", mod);
        return;
      }

      cleanup = init(ref.current, {
        mode: "prominent",
        blur: 2,
        saturation: 170,
        scale: 16,
        aberration: 18,
        ...options,
      });
    })();

    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
    };
  }, [ref, options]);
}
