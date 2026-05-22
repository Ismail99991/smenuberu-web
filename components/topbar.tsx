"use client";

import { Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

export default function Topbar({ title }: { title: string }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement | null>(null);
  const [userName, setUserName] = useState<string>("Исполнитель");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
          setAvatarUrl(data.user.avatarUrl || null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
  }, []);

  const isProfilePage = pathname === "/me" || pathname.startsWith("/me/");

  // Первая буква имени для аватарки-заглушки
  const firstLetter = userName !== "Исполнитель" ? userName[0]?.toUpperCase() : "?";
  const isDark = false; // можно позже добавить тему

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
        {/* Левая часть: профиль */}
        <Link
          href="/me"
          className="flex items-center gap-3 group"
        >
          {/* Аватарка */}
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center overflow-hidden",
            "bg-gradient-to-br from-[#c29cf2] to-[#b088e8]",
            "transition-transform group-active:scale-95"
          )}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-base">
                {firstLetter}
              </span>
            )}
          </div>

          {/* Имя и название раздела */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-500 leading-tight">
              {isProfilePage ? "Профиль" : "Мой профиль"}
            </span>
            <span className="text-base font-semibold text-zinc-900 leading-tight">
              {userName}
            </span>
          </div>
        </Link>

        {/* Правая часть: уведомления */}
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