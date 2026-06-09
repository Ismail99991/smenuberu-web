"use client";

import { Clock3, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    label: "Первый шаг",
    title: "Подтвердите статус НПД",
    description: "Это быстро и просто",
    meta: [
      { icon: Clock3, text: "2 минуты" },
      { icon: ShieldCheck, text: "Безопасно" },
    ],
    link: "/check-npd",
    image: "/illustrations/IMG_3908.png",
  },
  {
    id: 2,
    label: "Второй шаг",
    title: "Привяжите банковские реквизиты",
    description: "Чтобы получать выплаты",
    meta: [
      { icon: Clock3, text: "1 минута" },
      { icon: ShieldCheck, text: "Один раз" },
    ],
    link: "/payouts",
    image: "/illustrations/IMG_3906.png",
  },
  {
    id: 3,
    label: "Третий шаг",
    title: "Забронируйте смену",
    description: "Выберите удобную дату",
    meta: [
      { icon: Clock3, text: "1 минута" },
      { icon: ShieldCheck, text: "Без звонков" },
    ],
    link: "/shifts",
    image: "/illustrations/IMG_3910.png",
  },
];

export function OnboardingCarousel() {
  const router = useRouter();

  return (
    <section className="rounded-3xl bg-[#fafafa] p-4">
      <div className="mb-3">
        <h2 className="text-[14px] font-semibold leading-none text-zinc-900">
          Для старта
        </h2>

        <p className="mt-1 text-[12px] leading-none text-zinc-500">
          3 простых шага
        </p>
      </div>

      <div className="overflow-hidden">
        <div
          data-ptr-skip
          className="
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            py-2
            pl-[8px]
            pr-[8px]
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {steps.map((step) => (
            <article
              key={step.id}
              onClick={() => router.push(step.link)}
              className="
                h-[136px]
                min-w-[100%]
                snap-start
                cursor-pointer
                overflow-hidden
                rounded-[24px]
                border
                border-[#e4d7f8]
                bg-gradient-to-br
                from-[#f2ebfc]
                via-[#efe7fb]
                to-[#e3d1f8]
                shadow-[0_6px_18px_rgba(194,156,242,0.14)]
                transition-transform
                active:scale-[0.99]
              "
            >
              <div className="flex h-full items-center">
                <div className="flex h-full w-[124px] shrink-0 items-center justify-center">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="
                      h-[108px]
                      w-[108px]
                      object-contain
                      drop-shadow-[0_8px_18px_rgba(0,0,0,0.08)]
                    "
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#c29cf2]/25 text-[11px] font-semibold text-[#8f5ce4]">
                      {step.id}
                    </span>

                    <span className="truncate text-[11px] font-medium leading-none text-zinc-500">
                      {step.label}
                    </span>
                  </div>

                  <h3 className="mt-2 text-[13px] font-semibold leading-tight text-zinc-900">
                    {step.title}
                  </h3>

                  <p className="mt-1 truncate text-[10px] leading-none text-zinc-500">
                    {step.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 overflow-hidden">
                    {step.meta.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.text}
                          className="flex shrink-0 items-center gap-1 text-[10px] leading-none text-zinc-500"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-white/60 text-[#8f5ce4]">
                            <Icon className="h-3 w-3" />
                          </span>

                          <span className="whitespace-nowrap">
                            {item.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
