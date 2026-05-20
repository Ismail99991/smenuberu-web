"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  PlaneTakeoff,
  Building2,
  Wallet,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import React, { useRef } from "react";
import { useLiquidWeb } from "@/lib/useLiquidWeb";

const items = [
  { href: "/shifts", label: "Смены", icon: Briefcase },
  { href: "/tours", label: "Вахты", icon: PlaneTakeoff },
  { href: "/objects", label: "Объекты", icon: Building2 },
  { href: "/payouts", label: "Выплаты", icon: Wallet },
  { href: "/me", label: "Профиль", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const glassRef = useRef<HTMLDivElement | null>(null);

  useLiquidWeb(glassRef, {
    mode: "prominent",
    scale: 24,           // ↑ увеличено с 16 → сильнее искажение
    blur: 8,             // ↑ увеличено с 2 → сильнее размытие
    saturation: 200,     // ↑ увеличено с 170 → ярче цвета
    aberration: 12,      // ↓ уменьшено с 18 → меньше цветных артефактов
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-xl px-3 pb-2">
        <div
          ref={glassRef}
          className="
            grid grid-cols-5 gap-1 rounded-3xl
            border border-white/50      // ↑ увеличена видимость границы
            bg-white/30                 // ↑ увеличена плотность фона
            shadow-[0_8px_32px_rgba(0,0,0,0.2)]  // ← более выраженная тень
            backdrop-blur-xl            // ← дополнительное размытие (fallback)
          "
        >
          {items.map(({ href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center justify-center py-4 rounded-2xl transition-all duration-200",
                  active
                    ? "text-[#c29cf2]"  // ← фиолетовый для активной иконки
                    : "text-zinc-400 active:scale-95"  // ← светлее неактивные
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-transform",
                    active && "scale-[1.08]"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}