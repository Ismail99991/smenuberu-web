"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

export default function Topbar({ title }: { title: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const [userName, setUserName] = useState<string>("Исполнитель");

  const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setVar = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--topbar-offset", `${h}px`);
    };

    setVar();

    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${apiBase()}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.ok && data.user) {
          const name = data.user.displayName || data.user.yandexLogin || "Исполнитель";
          setUserName(name);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
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
        backdrop-blur-lg
        pt-[env(safe-area-inset-top)]
      "
    >
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
        <div>
          <span className="text-xs font-medium text-zinc-500">{userName}</span>
          <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
        </div>

        <Link
          href="/notifications"
          className={cn(
            uiTransition,
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "border border-zinc-200 bg-white",
            "hover:bg-zinc-50 active:scale-[0.95]",
            "text-zinc-600 hover:text-[#c29cf2]"
          )}
        >
          <Bell className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}