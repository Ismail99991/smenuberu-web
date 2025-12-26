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
    <nav className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-xl px-3 pb-2">
        <div
          className={cn(
            "grid grid-cols-5 gap-1 rounded-3xl",
            "border border-white/40 bg-white/55 backdrop-blur-2xl",
            "shadow-[0_18px_45px_rgba(0,0,0,0.18)]",
            "supports-[backdrop-filter:blur(0px)]:bg-white/45"
          )}
        >
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex flex-col items-center justify-center py-3",
                  "rounded-2xl transition duration-200",
                  active ? "text-zinc-900" : "text-zinc-500 active:scale-95"
                )}
              >
                {/* Liquid Glass active pill */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-1 rounded-2xl",
                    "transition duration-200",
                    active ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
                  )}
                >
                  {/* base glass */}
                  <span
                    className={cn(
                      "absolute inset-0 rounded-2xl",
                      "bg-white/35 backdrop-blur-2xl",
                      "border border-white/55",
                      // subtle tint (liquid glass vibe)
                      "bg-[radial-gradient(120%_120%_at_20%_0%,rgba(56,189,248,0.35)_0%,rgba(255,255,255,0.22)_45%,rgba(99,102,241,0.18)_100%)]",
                      "shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                    )}
                  />
                  {/* top highlight */}
                  <span
                    className={cn(
                      "absolute inset-0 rounded-2xl",
                      "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.70),rgba(255,255,255,0.15),rgba(255,255,255,0.00))]",
                      "opacity-70"
                    )}
                  />
                  {/* sheen (light streak) */}
                  <span
                    className={cn(
                      "absolute -inset-x-4 top-1/2 h-10 -translate-y-1/2 rotate-[-18deg] rounded-full",
                      "bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.65),rgba(255,255,255,0))]",
                      "opacity-60 blur-[1px]"
                    )}
                  />
                </span>

                <Icon
                  className={cn(
                    "relative h-5 w-5 transition duration-200",
                    active ? "translate-y-[-1px] scale-[1.06]" : "scale-100"
                  )}
                />

                <span
                  className={cn(
                    "relative mt-1 text-[11px] font-medium",
                    active ? "opacity-100" : "opacity-70"
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
