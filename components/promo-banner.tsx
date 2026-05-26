"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Gift,
  Sparkles,
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

  useEffect(() => {
    setMounted(true);

    const hidden =
      localStorage.getItem(
        "promo-hidden"
      );

    if (!hidden) {
      const t =
        setTimeout(
          () =>
            setOpen(
              true
            ),
          1200
        );

      return () =>
        clearTimeout(
          t
        );
    }
  }, []);

  if (
    !mounted ||
    !open
  )
    return null;

  return createPortal(
    <div className="
      fixed
      inset-0
      z-[9999]
    ">

      <div
        className="
          absolute
          inset-0
          bg-black/40
          backdrop-blur-sm
        "
        onClick={() =>
          setOpen(
            false
          )
        }
      />

      <div className="
        absolute
        bottom-0
        left-0
        right-0

        rounded-t-[32px]

        bg-white

        shadow-2xl

        animate-in
        slide-in-from-bottom

        p-6
      ">

        <div className="
          mx-auto
          mb-4

          h-1.5
          w-14

          rounded-full

          bg-zinc-200
        " />

        <div className="
          flex
          items-start
          justify-between
          gap-4
        ">

          <div className="
            flex
            gap-3
          ">

            <div className="
              flex
              h-12
              w-12

              items-center
              justify-center

              rounded-2xl

              bg-[#c29cf2]/10

              text-[#c29cf2]
            ">
              <Gift
                size={24}
              />
            </div>

            <div>

              <div className="
                flex
                items-center
                gap-2
              ">

                <Sparkles
                  size={16}
                  className="
                    text-[#c29cf2]
                  "
                />

                <span className="
                  text-sm
                  font-medium

                  text-[#c29cf2]
                ">
                  Акция
                </span>

              </div>

              <h3 className="
                mt-1

                text-lg
                font-bold

                text-zinc-900
              ">
                Пригласи друга
              </h3>

              <p className="
                mt-2

                text-sm

                text-zinc-600
              ">
                Получите
                по
                <b>
                  {" "}
                  500 ₽
                </b>

                после
                первой
                смены
              </p>

            </div>

          </div>

          <button
            onClick={() => {
              localStorage.setItem(
                "promo-hidden",
                "1"
              );

              setOpen(
                false
              );
            }}
            className="
              rounded-xl

              p-2

              text-zinc-400

              hover:bg-zinc-100
            "
          >
            <X
              size={18}
            />
          </button>

        </div>

        <button
          className="
            mt-6

            w-full

            rounded-2xl

            bg-[#c29cf2]

            py-3

            font-medium
            text-white

            transition

            active:scale-[0.98]
          "
        >
          Пригласить друга
        </button>

      </div>

    </div>,
    document.body
  );
}