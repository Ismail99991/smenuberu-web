"use client";

import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    title: "Подтвердите налоговый статус",
    description: "Это нужно для получения выплат",
    action: { text: "Подтвердить", link: "/check-npd" },
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/98135409-28ff-487e-9f9c-1f3314b35f5a.png",
  },
  {
    id: 2,
    title: "Запишитесь на первый день",
    description: "Запишитесь на удобное вам время, дату и задание",
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/8abf90e9-b51b-49a6-a52b-a7a37d09cd96.png",
  },
  {
    id: 3,
    title: "Мы ждем вас на объекте",
    description: "не забудьте построить маршрут и получить пропуск на КПП",
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/f5867c7d-1766-4195-b9a1-2feaa366f8a2.png",
  },
];

export function OnboardingCarousel() {
  const router = useRouter();

  const handleAction = () => {
    router.push("/check-npd");
  };

  return (
    <div className="mx-4 my-2">
      {/* Заголовок */}
      <h2 className="mb-4 text-xl font-semibold text-zinc-800">
        Мы рады вас видеть!
      </h2>

      {/* Три карточки в ряд, на всю ширину, без скролла */}
      <div className="grid grid-cols-3 gap-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="relative flex flex-col items-center gap-3 rounded-2xl bg-[#c29cf2]/5 p-4 text-center"
          >
            {/* Цифра в кружке */}
            <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c29cf2] text-xs font-bold text-white shadow-sm">
              {step.id}
            </div>

            {/* Иллюстрация */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <img
                src={step.image}
                alt={step.title}
                className="h-12 w-12 object-contain"
              />
            </div>

            {/* Текст с переносом */}
            <div className="w-full text-sm font-semibold text-zinc-800 break-words">
              {step.title}
            </div>
            <div className="w-full text-xs text-zinc-500 break-words leading-relaxed">
              {step.description}
            </div>

            {/* Кнопка (только для первого шага) */}
            {step.action && (
              <button
                onClick={handleAction}
                className="mt-2 rounded-lg bg-[#c29cf2] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#b088e8]"
              >
                {step.action.text}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
