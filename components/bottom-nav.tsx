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
    <div
      className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1"
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active
                    ? "text-[#c29cf2]"
                    : "text-gray-400"
                )}
                strokeWidth={active ? 2 : 1.5}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  active
                    ? "text-[#c29cf2]"
                    : "text-gray-400"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
