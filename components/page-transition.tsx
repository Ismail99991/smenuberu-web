"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // каждый новый маршрут "въезжает"
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={[
        "transform-gpu",
        "transition-all",
        "duration-300",
        "ease-out",
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
