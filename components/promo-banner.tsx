"use client";

import { useEffect, useState } from "react";
import { X, Gift, Sparkles, Users } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export default function PromoBanner() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(() => {
      setOpen(true);

      requestAnimationFrame(() => {
        setVisible(true);
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const closeBanner = () => {
    setVisible(false);

    setTimeout(() => {
      setOpen(false);
    }, 420);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        onClick={closeBanner}
        className={cn(
          "absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity duration-[420ms]",
          visible ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          visible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full opacity-0 scale-[0.98]"
        )}
      >
        <button
          onClick={closeBanner}
          className={cn(
            "absolute -top-16 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl transition-all duration-[420ms] active:scale-95",
            visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          <X size={30} className="text-zinc-900" />
        </button>

        <div className="max-h-[62vh] min-h-[52vh] overflow-hidden rounded-t-[34px] bg-white shadow-[0_-16px_50px_rgba(0,0,0,0.18)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#c29cf2] via-[#d2aff7] to-[#e3cdfb]">
            <div className="absolute left-1/2 top-4 z-20 h-[5px] w-12 -translate-x-1/2 rounded-full bg-white/65" />

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-white/10" />

            <img
              src="https://s3.regru.cloud/smenuberu/illustrations/promoillustration.png"
              alt="promo"
              className="block h-[260px] w-full object-contain pt-8"
            />
          </div>

          <div className="max-h-[calc(62vh-260px)] overflow-y-auto px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+18px)]">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#c29cf2]/10 text-[#c29cf2]">
                <Gift size={26} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#c29cf2]" />
                  <span className="text-sm font-semibold text-[#c29cf2]">
                    Реферальная программа
                  </span>
                </div>

                <h3 className="mt-2 text-[24px] font-black leading-tight text-zinc-900">
                  Пригласите друга и получите по 500 ₽
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Отправьте приглашение другу. После его первой смены
                  <b> вы оба получите по 500 ₽</b>.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-violet-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Users size={18} className="text-[#c29cf2]" />
                </div>

                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    Больше друзей — больше бонусов
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Приглашайте неограниченно и получайте выплаты за каждого
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-6 h-14 w-full rounded-[22px] bg-[#c29cf2] text-[15px] font-bold text-white shadow-lg shadow-violet-200 transition active:scale-[0.98]">
              Пригласить друга
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
