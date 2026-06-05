"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
  {
    title: "Подтвердите налоговый статус",
    description: "Это нужно для получения выплат",
    action: { text: "Подтвердить", link: "/check-npd" },
    image: "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/98135409-28ff-487e-9f9c-1f3314b35f5a.png",
  },
  {
    title: "Выберите подходящее задание",
    description: "Курьер, сборщик, упаковщик — на любой вкус",
    image: "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/8abf90e9-b51b-49a6-a52b-a7a37d09cd96.png",
  },
  {
    title: "Запишитесь на первый день",
    description: "И начинайте зарабатывать уже сегодня",
    image: "https://s3.regru.cloud/smenuberu/drafts/cmq10s71j00023clfsgr2snse/7e32d4cd-28a7-4695-912f-c4976134e970/logo/f5867c7d-1766-4195-b9a1-2feaa366f8a2.png",
  },
];

export function OnboardingCarousel() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("onboarding_completed") === "true";
    if (done) setCompleted(true);
  }, []);

  const handleNext = () => {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem("onboarding_completed", "true");
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const handleAction = () => {
    const step = steps[current];
    if (step.action) {
      router.push(step.action.link);
    } else {
      handleNext();
    }
  };

  if (completed) return null;

  const step = steps[current];

  return (
    <div className="relative mx-4 my-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#c29cf2]/10 to-[#a070d0]/10 p-6">
      <div className="flex flex-col items-center text-center">
        {/* Иллюстрация */}
        <div className="mb-4 h-32 w-32">
          <img
            src={step.image}
            alt={step.title}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Текст */}
        <h3 className="mb-2 text-xl font-bold text-zinc-800">{step.title}</h3>
        <p className="mb-6 text-sm text-zinc-500">{step.description}</p>

        {/* Кнопка действия */}
        <button
          onClick={handleAction}
          className="rounded-xl bg-[#c29cf2] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#b088e8]"
        >
          {step.action ? step.action.text : "Дальше"}
        </button>

        {/* Навигация (кнопки вперёд/назад + свайп) */}
        <div
          className="mt-4 flex gap-3"
          onTouchStart={(e) => {
            const startX = e.touches[0].clientX;
            const onTouchEnd = (endEvent: TouchEvent) => {
              const endX = endEvent.changedTouches[0].clientX;
              if (endX - startX > 50) handlePrev();
              if (startX - endX > 50) handleNext();
              window.removeEventListener("touchend", onTouchEnd);
            };
            window.addEventListener("touchend", onTouchEnd);
          }}
        >
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-white/50 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-white/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
