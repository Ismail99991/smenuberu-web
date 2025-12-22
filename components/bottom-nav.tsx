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

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-10
        border-t
        bg-white/95
        backdrop-blur
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="mx-auto grid max-w-xl grid-cols-4 px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-2 text-xs",
                active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
