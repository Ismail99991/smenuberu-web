"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useLayoutEffect, useRef } from "react";

export default function Topbar({ title }: { title: string }) {
  const ref = useRef<HTMLElement | null>(null);

  // На клиенте измеряем фактическую высоту topbar и пишем в глобальную CSS-переменную.
  // useLayoutEffect — чтобы избежать “мигания” в первый кадр.
  const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setVar = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--topbar-offset", `${h}px`);
    };

    setVar();

    // Следим за изменениями высоты (например, шрифты/динамический контент)
    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, []);

  return (
    <header
      ref={(node) => {
        ref.current = node;
      }}
      className="
        sticky
        top-0
        z-10
        border-b
        border-zinc-200
        bg-white/80
        backdrop-blur
        pt-[env(safe-area-inset-top)]
      "
    >
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
        <div>
          <span className="text-xs text-zinc-500">Исполнитель</span>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>

        <Link
          href="/notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl border"
        >
          <Bell className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
