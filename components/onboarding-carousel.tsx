"use client";

import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    title: "Подтвердите налоговый статус",
    description: "Это нужно для получения выплат",
    action: { text: "Подтвердить", link: "/check-npd" },
    image: "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/98135409-28ff-487e-9f9c-1f3314b35f5a.png",
  },
  {
    id: 2,
    title: "Выберите подходящее задание",
    description: "Курьер, сборщик, упаковщик — на любой вкус",
    image: "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/8abf90e9-b51b-49a6-a52b-a7a37d09cd96.png",
  },
  {
    id: 3,
    title: "Запишитесь на первый день",
    description: "И начинайте зарабатывать уже сегодня",
    image: "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/f5867c7d-1766-4195-b9a1-2feaa366f8a2.png",
  },
];

export function OnboardingCarousel() {
  const router = useRouter();

  const handleAction = () => {
    router.push("/check-npd");
  };

  return (
    <div className="mx-4 my-2 overflow-x-auto scrollbar-hide rounded-2xl bg-[#c29cf2]/5 p-3">
      <div className="flex gap-4 min-w-max">
        {steps.map((step) => (
          <div key={step.id} className="relative flex w-80 flex-shrink-0 gap-3">
            {/* Цифра в кружке */}
            <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c29cf2] text-xs font-bold text-white shadow-sm">
              {step.id}
            </div>

            {/* Иллюстрация */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <img src={step.image} alt={step.title} className="h-12 w-12 object-contain" />
            </div>

            {/* Текст + кнопка */}
            <div className="flex flex-col justify-center">
              <div className="text-sm font-semibold text-zinc-800">{step.title}</div>
              <div className="text-xs text-zinc-500">{step.description}</div>
              {step.action && (
                <button
                  onClick={handleAction}
                  className="mt-2 self-start rounded-lg bg-[#c29cf2] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#b088e8]"
                >
                  {step.action.text}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
