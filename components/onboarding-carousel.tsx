"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    title: "Подтвердите статус НПД",
    description: "Это нужно для получения выплат. НПД — это налог на профессиональный доход.",
    action: { text: "Подтвердить", link: "/check-npd" },
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/98135409-28ff-487e-9f9c-1f3314b35f5a.png",
  },
  {
    id: 2,
    title: "Запишитесь на первый день",
    description: "Выберите удобную дату и время. Мы ждём вас на объекте.",
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/8abf90e9-b51b-49a6-a52b-a7a37d09cd96.png",
  },
  {
    id: 3,
    title: "Готово, мы ждем вас на объекте",
    description: "Остался последний шаг — просто придите в назначенное время.",
    image:
      "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/f5867c7d-1766-4195-b9a1-2feaa366f8a2.png",
  },
];

export function OnboardingCarousel() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAction = () => {
    router.push("/check-npd");
  };

  const handleStepClick = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <div className="mx-4 my-2">
      {/* Заголовок по центру */}
      <h2 className="mb-4 text-center text-xl font-semibold text-zinc-800">
        Мы рады вас видеть!
      </h2>

      {/* Общий фон */}
      <div className="flex h-auto min-h-[150px] w-full items-stretch overflow-hidden rounded-2xl bg-[#c29cf2]/5 transition-all duration-300">
        {steps.map((step, index) => {
          const isExpanded = expandedIndex === index;
          const isCollapsed = expandedIndex !== null && !isExpanded;

          return (
            <div
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`
                cursor-pointer transition-all duration-300 ease-in-out
                ${isExpanded ? "w-full" : isCollapsed ? "w-0" : "flex-1"}
                flex items-center justify-center overflow-hidden
              `}
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
                {/* Иллюстрация */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="h-8 w-8 object-contain"
                  />
                </div>

                {/* Текст */}
                <div className="text-center text-xs font-medium text-zinc-800">
                  {step.title}
                </div>

                {/* Описание — показывается только в развёрнутом состоянии */}
                {isExpanded && (
                  <div className="mt-2 text-center text-xs text-zinc-500 animate-in fade-in duration-200">
                    {step.description}
                  </div>
                )}

                {/* Кнопка только на первом шаге, показывается в развёрнутом состоянии */}
                {isExpanded && index === 0 && step.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction();
                    }}
                    className="mt-2 rounded-lg bg-[#c29cf2] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#b088e8]"
                  >
                    {step.action.text}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
