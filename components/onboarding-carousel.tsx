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
    title: "Запишитесь на первый день",
    description: "Выберите удобную дату и время",
    meta: [
      { icon: Clock3, text: "1 минута" },
      { icon: ShieldCheck, text: "Без звонков" },
      { icon: Smartphone, text: "В приложении" },
    ],
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/8abf90e9-b51b-49a6-a52b-a7a37d09cd96.png",
  },
  {
    id: 3,
    label: "Третий шаг",
    title: "Приходите на объект",
    description: "Мы будем ждать вас к началу смены",
    meta: [
      { icon: Clock3, text: "Вовремя" },
      { icon: ShieldCheck, text: "Всё готово" },
      { icon: Smartphone, text: "Статус онлайн" },
    ],
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/f5867c7d-1766-4195-b9a1-2feaa366f8a2.png",
  },
];

export function OnboardingCarousel() {
  const router = useRouter();

  return (
    <section className="rounded-3xl bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold leading-tight text-zinc-900">
            Для старта
          </h2>

          <p className="mt-0.5 text-sm text-zinc-500">
            3 простых шага
          </p>
        </div>

        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-2xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 active:scale-[0.97]"
        >
          Все 3
          <ChevronRight className="h-4 w-4 text-zinc-500" />
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
                flex
                min-w-[86%]
                snap-start
                items-center
                gap-4
                overflow-hidden
                rounded-3xl
                bg-gradient-to-r
                from-white
                via-white
                to-[#c29cf2]/15
                p-4
                shadow-sm
              "
            >
              <div className="flex h-28 w-24 shrink-0 items-center justify-center">
                <img
                  src={step.image}
                  alt={step.title}
                  className="h-24 w-24 object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#c29cf2]/15 text-sm font-semibold text-[#9f6ee8]">
                    {step.id}
                  </span>

                  <span className="text-xs font-medium text-zinc-500">
                    {step.label}
                  </span>
                </div>

                <h3 className="text-base font-semibold leading-snug text-zinc-900">
                  {step.title}
                </h3>

                <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                  {step.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {step.meta.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.text}
                        className="flex items-center gap-1.5 text-xs text-zinc-500"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-[#c29cf2]/10 text-[#9f6ee8]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(step.action?.link ?? "/shifts")}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-zinc-900
                  shadow-sm
                  active:scale-[0.95]
                "
                aria-label={step.action?.text ?? "Перейти"}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
