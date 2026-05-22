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
    scale: 24,
    blur: 8,
    saturation: 200,
    aberration: 12,
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-xl px-3 pb-2">
        <div
          ref={glassRef}
          className="
            grid grid-cols-5 gap-1 rounded-3xl
            border border-white/50
            bg-white/30
            shadow-[0_8px_32px_rgba(0,0,0,0.2)]
            backdrop-blur-xl
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
                    ? "text-[#c29cf2]"
                    : "text-zinc-400 active:scale-95"
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
