"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Gift,
  Sparkles,
  Users,
} from "lucide-react";

import {
  createPortal,
} from "react-dom";

import { cn } from "@/lib/cn";

export default function PromoBanner() {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(() => {
    setMounted(true);

    const hidden =
      localStorage.getItem(
        "promo-hidden"
      );

    if (!hidden) {
      const t =
        setTimeout(() => {
          setOpen(
            true
          );

          requestAnimationFrame(
            () =>
              setVisible(
                true
              )
          );
        }, 1200);

      return () =>
        clearTimeout(
          t
        );
    }
  }, []);

  const closeBanner =
    () => {
      setVisible(
        false
      );

      setTimeout(
        () =>
          setOpen(
            false
          ),
        500
      );
    };

  if (
    !mounted ||
    !open
  )
    return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        onClick={closeBanner}
        className={cn(
          "absolute inset-0 bg-black/25 backdrop-blur-xl transition-all duration-500 ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        className={cn(
          "absolute bottom-3 left-3 right-3 overflow-hidden rounded-[32px] bg-white pb-[calc(env(safe-area-inset-bottom)+18px)] shadow-[0_-10px_45px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          visible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-[110%] opacity-0 scale-[0.96]"
        )}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#c29cf2] via-[#d2aff7] to-[#e3cdfb] px-6 pt-4 pb-5">
          <div className="mx-auto mb-5 h-[5px] w-10 rounded-full bg-white/60" />

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

          <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-white/10" />

          <img
            src="https://s3.regru.cloud/smenuberu/illustrations/promoillustration.png"
            alt="promo"
            className="mx-auto h-[180px] object-contain animate-[promoFloat_4s_ease-in-out_infinite]"
          />
        </div>

        <div className="p-6 pt-5">
          <div className="flex items-start justify-between gap-4">
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

                <h3 className="mt-2 text-[22px] font-bold leading-tight text-zinc-900">
                  Пригласите друга
                  и получите
                  по 500 ₽
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Отправьте
                  приглашение
                  другу.
                  После его
                  первой смены
                  <b> вы оба получите по 500 ₽</b>.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem(
                  "promo-hidden",
                  "1"
                );
                closeBanner();
              }}
              className="rounded-2xl p-2.5 text-zinc-400 transition-all hover:bg-zinc-100 active:scale-95"
            >
              <X size={18} />
            </button>
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

          <button className="mt-6 w-full rounded-[20px] bg-[#c29cf2] py-4 text-[15px] font-semibold text-white shadow-lg shadow-violet-200 transition-all active:scale-[0.98]">
            Пригласить друга
          </button>
        </div>
      </div>

      <style>{`
        @keyframes promoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}