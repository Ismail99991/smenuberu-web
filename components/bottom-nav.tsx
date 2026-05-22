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
  { href: "/shifts", icon: Briefcase },
  { href: "/tours", icon: PlaneTakeoff },
  { href: "/objects", icon: Building2 },
  { href: "/payouts", icon: Wallet },
  { href: "/me", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto w-full max-w-xl px-3 pb-3">
        <div
          className="
            grid grid-cols-5 gap-1 rounded-2xl
            bg-white/80 backdrop-blur-md
            border border-white/30
            shadow-lg shadow-black/5
          "
        >
          {items.map(({ href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center justify-center py-5 rounded-xl transition-all duration-200",
                  active
                    ? "text-[#c29cf2] bg-[#c29cf2]/10"
                    : "text-zinc-500 hover:text-zinc-700 active:scale-95"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active && "scale-110"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
