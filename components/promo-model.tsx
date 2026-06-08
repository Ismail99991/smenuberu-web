"use client";

import { X, Trophy, Gift, Flame } from "lucide-react";
import { useEffect, useState } from "react";

type PromoType = "special" | "referral" | "hot";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: PromoType;
}

export default function PromoModal({
  isOpen,
  onClose,
  type = "special",
}: PromoModalProps) {
  const [activeTab, setActiveTab] = useState<PromoType>(type);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);

      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);

      const timer = setTimeout(() => {
        setMounted(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleClose = () => {
    setVisible(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const content = {
    special: {
      title: "Спецзадание",
      icon: <Trophy className="h-6 w-6 text-[#c29cf2]" />,
      reward: "10 000 ₽",
      condition: "Выполните 10 заданий за 7 дней",
      progress: "6/10",
      daysLeft: 7,
      rules: [
        "Задания автоматически засчитываются после завершения смены",
        "Учитываются только смены от 4 часов",
        "Одна смена = одно задание",
      ],
    },
    referral: {
      title: "Пригласи друга",
      icon: <Gift className="h-6 w-6 text-[#c29cf2]" />,
      reward: "3 000 ₽",
      condition: "За каждого приглашённого друга",
      progress: "2 друга",
      daysLeft: null,
      rules: [
        "Друг должен выполнить первое задание",
        "Бонус начисляется через 3 дня после регистрации",
        "Лимит — 10 друзей в месяц",
      ],
    },
    hot: {
      title: "Горящие слоты",
      icon: <Flame className="h-6 w-6 text-[#c29cf2]" />,
      reward: "+20%",
      condition: "К стандартному тарифу",
      progress: "5 смен доступно",
      daysLeft: 1,
      rules: [
        "Доплата начисляется автоматически",
        "Слоты обновляются каждый день",
        "Успейте забронировать до исчезновения",
      ],
    },
  };

  const current = content[activeTab];

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-end justify-center
        bg-black/50 transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleClose}
    >
      <div
        className={`
          relative w-full max-w-md transform transition-transform duration-300 ease-out
          ${visible ? "translate-y-0" : "translate-y-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className={`
            absolute -top-16 right-4 z-20 flex h-14 w-14 items-center justify-center
            rounded-full bg-white shadow-lg transition-all duration-300 active:scale-95
            ${visible ? "scale-100 opacity-100" : "scale-90 opacity-0"}
          `}
        >
          <X className="h-8 w-8 text-zinc-900" />
        </button>

        <div className="max-h-[58vh] min-h-[50vh] overflow-hidden rounded-t-[34px] bg-white p-4 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-300" />

          <div className="max-h-[calc(58vh-32px)] overflow-y-auto px-1 pb-4">
            <div className="mb-5 flex gap-2 rounded-2xl bg-zinc-100 p-1">
              <button
                onClick={() => setActiveTab("special")}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  activeTab === "special"
                    ? "bg-white text-[#c29cf2] shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                Спец
              </button>

              <button
                onClick={() => setActiveTab("referral")}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  activeTab === "referral"
                    ? "bg-white text-[#c29cf2] shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                Реферал
              </button>

              <button
                onClick={() => setActiveTab("hot")}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  activeTab === "hot"
                    ? "bg-white text-[#c29cf2] shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                Горящие
              </button>
            </div>

            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-[#c29cf2]/10">
                {current.icon}
              </div>

              <div>
                <div className="text-sm font-bold text-[#c29cf2]">
                  Федеральная программа
                </div>
                <h2 className="mt-1 text-2xl font-black leading-tight text-zinc-900">
                  {current.title}
                </h2>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-5xl font-black tracking-tight text-zinc-900">
                {current.reward}
              </div>

              <div className="mt-2 text-base text-zinc-500">
                {current.condition}
              </div>

              {current.daysLeft !== null && (
                <div className="mt-3 inline-flex rounded-full bg-[#c29cf2]/10 px-4 py-2 text-sm font-semibold text-[#c29cf2]">
                  Осталось {current.daysLeft}{" "}
                  {current.daysLeft === 1 ? "день" : "дней"}
                </div>
              )}

              <div className="mt-3 text-sm font-semibold text-zinc-700">
                {current.progress}
              </div>
            </div>

            <div className="mb-5 rounded-[24px] bg-[#c29cf2]/10 p-4">
              <div className="mb-2 text-xs font-bold uppercase text-zinc-400">
                Условия
              </div>

              <ul className="space-y-2">
                {current.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-snug text-zinc-600"
                  >
                    <span className="mt-0.5 text-[#c29cf2]">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                if (activeTab === "referral") {
                  navigator.clipboard.writeText(
                    "https://smenuberu.ru/ref/USER789"
                  );
                  alert("Ссылка скопирована!");
                } else {
                  handleClose();
                }
              }}
              className="h-14 w-full rounded-[22px] bg-[#c29cf2] text-base font-bold text-white shadow-lg shadow-[#c29cf2]/30 transition active:scale-[0.98]"
            >
              {activeTab === "referral"
                ? "Получить ссылку"
                : activeTab === "hot"
                ? "Выбрать слот"
                : "К заданиям"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
