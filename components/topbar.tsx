"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

export default function Topbar({
  title,
  onToggleSearch,
}: {
  title: string;
  onToggleSearch?: () => void;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement | null>(null);
  const [userName, setUserName] = useState<string>("Исполнитель");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const useIsoLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
          const name =
            data.user.displayName || data.user.yandexLogin || "Исполнитель";

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
  const firstLetter = userName !== "Исполнитель" ? userName[0]?.toUpperCase() : "?";

  return (
    <header
      ref={(node) => {
        ref.current = node;
      }}
      className="
        sticky
        top-0
        z-10
        bg-white/80
        backdrop-blur-lg
        pt-[env(safe-area-inset-top)]
      "
    >
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
        <Link href="/me" className="flex min-w-0 items-center gap-3 group">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full",
              "bg-gradient-to-br from-[#c29cf2] to-[#b088e8]",
              "transition-transform group-active:scale-95"
            )}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold text-white">
                {firstLetter}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-medium leading-tight text-zinc-500">
              {isProfilePage ? "Профиль" : "Мой профиль"}
            </span>

            <span className="truncate text-base font-semibold leading-tight text-zinc-900">
              {userName}
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {onToggleSearch ? (
            <button
              type="button"
              onClick={onToggleSearch}
              className={cn(
                uiTransition,
                "flex h-10 w-10 items-center justify-center rounded-xl",
                "bg-white",
                "hover:bg-zinc-50 active:scale-[0.95]",
                "text-zinc-600 hover:text-[#c29cf2]"
              )}
              aria-label="Поиск"
            >
              <Search className="h-5 w-5" />
            </button>
          ) : null}

          <Link
            href="/notifications"
            className={cn(
              uiTransition,
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "bg-white",
              "hover:bg-zinc-50 active:scale-[0.95]",
              "text-zinc-600 hover:text-[#c29cf2]"
            )}
            aria-label="Уведомления"
          >
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
