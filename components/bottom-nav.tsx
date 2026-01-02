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

const items = [
  { href: "/shifts", label: "Смены", icon: Briefcase },
  { href: "/tours", label: "Вахты", icon: PlaneTakeoff },
  { href: "/objects", label: "Объекты", icon: Building2 },
  { href: "/payouts", label: "Выплаты", icon: Wallet },
  { href: "/me", label: "Профиль", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-xl px-3 pb-3">
        <div
          className="
            relative grid grid-cols-5 gap-1 rounded-[26px] px-1 py-1
            bg-white/70
            shadow-[0_10px_30px_rgba(0,0,0,0.12)]
          "
        >
          {/* top light */}
          <div className="pointer-events-none absolute inset-x-4 top-1 h-px bg-white/80" />

          {items.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all",
                  active
                    ? "text-zinc-900"
                    : "text-zinc-500 active:scale-95"
                )}
              >
                {/* ACTIVE LIQUID PLATE */}
                {active && (
                  <span
                    className="
                      absolute inset-0 rounded-2xl
                      bg-white
                      shadow-[0_1px_0_rgba(255,255,255,0.9),0_6px_14px_rgba(0,0,0,0.18)]
                    "
                  />
                )}

                <Icon
                  className={cn(
                    "relative h-5 w-5 transition-transform",
                    active && "scale-[1.05]"
                  )}
                />
                <span className="relative text-[11px] font-medium">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
