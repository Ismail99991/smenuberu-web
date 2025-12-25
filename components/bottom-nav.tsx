"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, PlaneTakeoff, Building2, Wallet, User } from "lucide-react";
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
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-10
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="mx-auto w-full max-w-xl px-3 pb-2">
        <div
          className="
            grid grid-cols-5 gap-1
            rounded-3xl
            border border-black/10
            bg-white/70
            backdrop-blur-xl
            shadow-[0_10px_30px(rgba(0,0,0,0.12))]
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
                  "relative flex flex-col items-center justify-center py-3",
                  "rounded-2xl transition-all duration-200",
                  active
                    ? "text-white"
                    : "text-zinc-600 active:scale-95"
                )}
              >
                {/* Active background */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-1 rounded-2xl",
                    "transition-all duration-200",
                    active
                      ? "bg-brand opacity-100"
                      : "opacity-0 scale-95"
                  )}
                />

                <Icon
                  className={cn(
                    "relative h-5 w-5 transition-transform duration-200",
                    active
                      ? "translate-y-[-1px] scale-[1.05]"
                      : "scale-100"
                  )}
                />

                <span
                  className={cn(
                    "relative mt-1 text-[11px]",
                    active ? "opacity-100" : "opacity-80"
                  )}
                >
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
