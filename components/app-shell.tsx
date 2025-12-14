"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import Topbar from "@/components/topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const title =
    pathname.startsWith("/shifts") ? "Смены" :
  pathname.startsWith("/objects") ? "Объекты" :
  pathname.startsWith("/payouts") ? "Выплаты" :
  pathname.startsWith("/profile") ? "Профиль" :
  pathname.startsWith("/support") ? "Поддержка" :
  pathname.startsWith("/notifications") ? "Уведомления" :
  "Главная";

  return (
    <div className="min-h-dvh">
      <Topbar title={title} />

      <main className="mx-auto w-full max-w-xl px-4 pb-24 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
