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
        "block h-7 w-7 bg-current transition-all duration-200",
        active
          ? "text-[#c29cf2] scale-105"
          : "text-gray-400"
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white">
      <div className="flex items-center justify-around px-2 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex flex-1 items-center justify-center py-2"
            >
              <BottomNavIcon
                src={item.icon}
                active={active}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
