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
        "block h-[25px] w-[25px] bg-current transition-all duration-200",
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
    <nav className="pointer-events-none fixed inset-x-0 bottom-2 z-50 px-4">
      <div className="pointer-events-auto mx-auto flex h-[58px] max-w-[430px] items-center justify-between rounded-[29px] border border-white/70 bg-white/90 px-2 shadow-[0_14px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl">
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
              className="flex h-full flex-1 items-center justify-center"
            >
              <span
                className={cn(
                  "flex h-[44px] w-[52px] items-center justify-center rounded-[24px] transition-all duration-200",
                  active && "bg-[#c29cf2]/14"
                )}
              >
                <BottomNavIcon
                  src={item.icon}
                  active={active}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
