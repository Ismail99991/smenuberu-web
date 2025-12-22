"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

export default function Topbar({ title }: { title: string }) {
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
