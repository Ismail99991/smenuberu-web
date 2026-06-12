"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import Topbar from "@/components/topbar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const title =
    pathname.startsWith("/shifts") ? "Смены" :
    pathname.startsWith("/objects") ? "Объекты" :
    pathname.startsWith("/payouts") ? "Выплаты" :
    pathname.startsWith("/me") ? "Профиль" :
    pathname.startsWith("/support") ? "Поддержка" :
    pathname.startsWith("/notifications") ? "Уведомления" :
    "Главная";

  const canSearch =
    pathname === "/shifts" ||
    pathname === "/";

  return (
    <div className="app-shell bg-[#fcfafe]">
      <Topbar
        title={title}
        onToggleSearch={
          canSearch
            ? () => {
                window.dispatchEvent(
                  new CustomEvent(
                    "smenube:toggle-search"
                  )
                );
              }
            : undefined
        }
      />

      <div className="app-scroll">
        <main className="mx-auto w-full max-w-xl px-4 pt-4 pb-24">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
