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
import React from "react";

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
        {/* GLASS CONTAINER */}
        <div className="relative rounded-[28px]">
          {/* outer glass edge */}
          <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/40" />
          {/* inner edge */}
          <div className="pointer-events-none absolute inset-[1px] rounded-[26px] border border-white/10" />

          {/* specular highlight */}
          <div className="pointer-events-none absolute inset-x-4 top-2 h-1/2 rounded-full bg-gradient-to-b from-white/40 to-transparent blur-sm" />

          {/* blur + background */}
          <div
            className="
              relative grid grid-cols-5 gap-1 rounded-[28px] px-1 py-1
              bg-white/25
              backdrop-blur-xl
              shadow-[0_20px_50px_rgba(0,0,0,0.25)]
            "
          >
            {items.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-200",
                    active
                      ? "text-zinc-900"
                      : "text-zinc-500 active:scale-95"
                  )}
                >
                  {/* ACTIVE GLASS BUBBLE */}
                  {active && (
                    <span
                      className="
                        absolute inset-0 rounded-2xl
                        bg-white/45
                        backdrop-blur-md
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_6px_18px_rgba(0,0,0,0.25)]
                        before:absolute before:inset-x-2 before:top-1
                        before:h-1/2 before:rounded-full
                        before:bg-gradient-to-b before:from-white/50 before:to-transparent
                        before:content-['']
                      "
                    />
                  )}

                  <Icon
                    className={cn(
                      "relative h-5 w-5 transition-transform",
                      active && "scale-[1.08]"
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
      </div>
    </nav>
  );
}
