"use client";

import { ChevronRight, Clock3, ShieldCheck, Smartphone } from "lucide-react";
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
      { icon: Smartphone, text: "Онлайн" },
    ],
    action: { text: "Подтвердить", link: "/check-npd" },
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/98135409-28ff-487e-9f9c-1f3314b35f5a.png",
  },
  {
    id: 2,
    label: "Второй шаг",
    title: "Запишитесь на смену",
    description: "Выберите удобную дату",
    meta: [
      { icon: Clock3, text: "1 минута" },
      { icon: ShieldCheck, text: "Без звонков" },
      { icon: Smartphone, text: "В приложении" },
    ],
    action: { text: "Выбрать", link: "/shifts" },
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/8abf90e9-b51b-49a6-a52b-a7a37d09cd96.png",
  },
  {
    id: 3,
    label: "Третий шаг",
    title: "Приходите на объект",
    description: "К началу смены",
    meta: [
      { icon: Clock3, text: "Вовремя" },
      { icon: ShieldCheck, text: "Всё готово" },
      { icon: Smartphone, text: "Статус онлайн" },
    ],
    action: { text: "Мои смены", link: "/profile" },
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/f5867c7d-1766-4195-b9a1-2feaa366f8a2.png",
  },
];

export function OnboardingCarousel() {
  const router = useRouter();

  return (
    <section className="rounded-3xl bg-white p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-zinc-900">
            Для старта
          </h2>

          <p className="mt-2 text-[19px] leading-none text-zinc-500">
            3 простых шага
          </p>
        </div>

        <button
          type="button"
          className="flex h-12 shrink-0 items-center gap-1 rounded-2xl bg-zinc-100 px-4 text-[18px] font-semibold text-zinc-900 active:scale-[0.97]"
        >
          Все 3
          <ChevronRight className="h-5 w-5 text-zinc-500" />
        </button>
      </div>

      <div className="-mx-4 overflow-hidden">
        <div
          data-ptr-skip
          className="
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            px-4
            pb-1
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {steps.map((step) => (
            <article
              key={step.id}
              className="
                relative
                h-[150px]
                min-w-[88%]
                snap-start
                overflow-hidden
                rounded-[28px]
                bg-gradient-to-r
                from-[#fbf7ff]
                via-white
                to-[#c29cf2]/20
                shadow-sm
              "
            >
              <div className="flex h-full items-center gap-3 px-4 pr-16">
                <div className="flex w-[92px] shrink-0 items-center justify-center">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="h-[92px] w-[92px] object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#c29cf2]/15 text-[15px] font-semibold text-[#9f6ee8]">
                      {step.id}
                    </span>

                    <span className="truncate text-[15px] font-medium leading-none text-zinc-500">
                      {step.label}
                    </span>
                  </div>

                  <h3 className="mt-2 max-w-[190px] truncate text-[21px] font-semibold leading-tight tracking-[-0.03em] text-zinc-900">
                    {step.title}
                  </h3>

                  <p className="mt-1 truncate text-[15px] leading-none text-zinc-500">
                    {step.description}
                  </p>

                  <div className="mt-4 flex items-center gap-3 overflow-hidden">
                    {step.meta.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.text}
                          className="flex shrink-0 items-center gap-1.5 text-[13px] leading-none text-zinc-500"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-[#c29cf2]/10 text-[#9f6ee8]">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="whitespace-nowrap">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(step.action.link)}
                className="
                  absolute
                  right-4
                  top-1/2
                  flex
                  h-11
                  w-11
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-zinc-900
                  shadow-sm
                  active:scale-[0.95]
                "
                aria-label={step.action.text}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
