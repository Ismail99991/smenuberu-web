// components/TopBar.tsx
"use client";

import { Bell, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopBar({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border tap"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div>
            <span className="text-xs text-zinc-500">Объект</span>
            <h1 className="text-base font-semibold line-clamp-1">{title}</h1>
          </div>
        </div>

        <Link
          href="/notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl border tap"
          aria-label="Уведомления"
        >
          <Bell className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
