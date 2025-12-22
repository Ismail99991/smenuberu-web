"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // сначала чуть прячем
    setVisible(false);

    // микрозадержка — iOS ловит корректно
    const t = setTimeout(() => {
      setVisible(true);
    }, 20);

    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      className={[
        "will-change-transform will-change-opacity",
        "transition-[opacity,transform]",
        "duration-200",
        "ease-out",
        visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-1.5",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
