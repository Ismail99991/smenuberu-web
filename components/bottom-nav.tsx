"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, Wallet, User } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/shifts", label: "Смены", icon: Briefcase },
  { href: "/objects", label: "Объекты", icon: Building2 },
  { href: "/payouts", label: "Выплаты", icon: Wallet },
  { href: "/me", label: "Профиль", icon: User },
];

function getActiveIndex(pathname: string) {
  const idx = items.findIndex(
    (it) => pathname === it.href || pathname.startsWith(it.href + "/")
  );
  return Math.max(0, idx);
}

export default function BottomNav() {
  const pathname = usePathname();
  const activeIndex = getActiveIndex(pathname);

  // 4 колонки => шаг 25%
  const leftPct = `${activeIndex * 25}%`;

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-10
        pb-[env(safe-area-inset-bottom)]
      "
      aria-label="Навигация"
    >
      <div className="mx-auto w-full max-w-xl px-3 pb-2">
        {/* iOS-like “floating bar” */}
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border border-black/10
            bg-white/70
            shadow-[0_10px_30px_rgba(0,0,0,0.12)]
            backdrop-blur-xl
          "
        >
          {/* Active highlight pill (animated) */}
          <div
            className="absolute inset-y-1 left-1 w-1/4"
            style={{ transform: `translateX(${leftPct})` }}
            aria-hidden="true"
          >
            <div
              className="
                h-full w-full
                rounded-2xl
                bg-black/90
                shadow-[0_8px_18px_rgba(0,0,0,0.25)]
                transition-transform duration-300 ease-out
              "
            />
          </div>

          <div className="relative grid grid-cols-4 px-1 py-1">
            {items.map(({ href, label, icon: Icon }, idx) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group relative flex flex-col items-center justify-center rounded-2xl py-2",
                    "transition-colors duration-200",
                    active ? "text-white" : "text-zinc-700"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      "transition-transform duration-300 ease-out",
                      active ? "translate-y-[-1px] scale-[1.04]" : "scale-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        "transition-transform duration-300 ease-out",
                        // лёгкий “bounce” только активной
                        active ? "translate-y-[-1px]" : "translate-y-0",
                        // hover (в вебе)
                        "group-hover:scale-[1.05]"
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      "mt-1 text-[11px] leading-none",
                      "transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-80"
                    )}
                  >
                    {label}
                  </span>

                  {/* subtle haptic-like ripple imitation */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl",
                      "opacity-0 group-active:opacity-100",
                      "transition-opacity duration-150",
                      active ? "bg-white/10" : "bg-black/5"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
