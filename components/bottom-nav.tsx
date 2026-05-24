"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  PlaneTakeoff,
  Building2,
  Wallet,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/shifts", icon: Briefcase },
  { href: "/tours", icon: PlaneTakeoff },
  { href: "/objects", icon: Building2 },
  { href: "/payouts", icon: Wallet },
  { href: "/bookings", icon: CalendarCheck },  // ← вместо /me
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-[-34px] left-0 right-0 z-20 bg-white border-t border-gray-100">
      <div className="flex items-center justify-around px-2 py-3">
        {items.map(({ href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 items-center justify-center py-2"
            >
              <Icon
                className={cn(
                  "h-7 w-7 transition-all duration-200",
                  active ? "text-[#c29cf2]" : "text-gray-400"
                )}
                strokeWidth={active ? 2 : 1.5}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
