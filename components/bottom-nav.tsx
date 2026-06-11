"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  {
    href: "/shifts",
    icon: "/icons/shifts.svg",
    label: "Смены",
  },
  {
    href: "/tours",
    icon: "/icons/tours.svg",
    label: "Туры",
  },
  {
    href: "/objects",
    icon: "/icons/objects.svg",
    label: "Объекты",
  },
  {
    href: "/payouts",
    icon: "/icons/payouts.svg",
    label: "Выплаты",
  },
  {
    href: "/bookings",
    icon: "/icons/bookings.svg",
    label: "Брони",
  },
];

function BottomNavIcon({
  src,
  active,
}: {
  src: string;
  active: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-[24px] w-[24px] bg-current transition-all duration-200",
        active ? "text-[#c29cf2]" : "text-[#1f2937]"
      )}
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-50 px-4">
      <div className="pointer-events-auto mx-auto flex h-[76px] max-w-[520px] items-center justify-between rounded-[32px] border border-white/70 bg-white/90 px-2 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex h-full flex-1 items-center justify-center"
            >
              <span
                className={cn(
                  "flex min-w-[58px] flex-col items-center justify-center gap-1 rounded-[26px] px-3 py-2 transition-all duration-200",
                  active && "bg-[#c29cf2]/16"
                )}
              >
                <BottomNavIcon
                  src={item.icon}
                  active={active}
                />

                <span
                  className={cn(
                    "text-[11px] font-semibold leading-none transition-colors duration-200",
                    active ? "text-[#c29cf2]" : "text-[#1f2937]"
                  )}
                >
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
