"use client";

import { X, Trophy, Gift, Flame, ChevronRight } from "lucide-react";
import { useState } from "react";

type PromoType = "special" | "referral" | "hot";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: PromoType;
}

export default function PromoModal({ isOpen, onClose, type = "special" }: PromoModalProps) {
  const [activeTab, setActiveTab] = useState<PromoType>(type);

  if (!isOpen) return null;

  const content = {
    special: {
      title: "Спецзадание",
      icon: <Trophy className="h-6 w-6 text-[#c29cf2]" />,
      description: "Выполняйте задания и получайте награды",
      reward: "10 000 ₽",
      condition: "Выполните 10 заданий за 7 дней",
      progress: "6/10",
      daysLeft: 7,
      rules: [
        "Задания автоматически засчитываются после завершения смены",
        "Учитываются только смены от 4 часов",
        "Одна смена = одно задание"
      ]
    },
    referral: {
      title: "Пригласи друга",
      icon: <Gift className="h-6 w-6 text-[#c29cf2]" />,
      description: "Приглашайте друзей и получайте бонусы",
      reward: "3 000 ₽",
      condition: "За каждого приглашённого друга",
      progress: "2 друга",
      daysLeft: null,
      rules: [
        "Друг должен выполнить первое задание",
        "Бонус начисляется через 3 дня после регистрации",
        "Лимит — 10 друзей в месяц"
      ]
    },
    hot: {
      title: "Горящие слоты",
      icon: <Flame className="h-6 w-6 text-[#c29cf2]" />,
      description: "Слоты с повышенной оплатой",
      reward: "+20%",
      condition: "К стандартному тарифу",
      progress: "5 смен доступно",
      daysLeft: 1,
      rules: [
        "Доплата начисляется автоматически",
        "Слоты обновляются каждый день",
        "Успейте забронировать до исчезновения"
      ]
    }
  };

  const current = content[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-t-3xl w-full max-w-md p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок с кнопкой закрытия */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {current.icon}
            <h2 className="text-xl font-bold text-zinc-900">{current.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-zinc-100">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Табы для переключения акций */}
        <div className="flex gap-2 mb-5 bg-zinc-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("special")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "special" 
                ? "bg-white text-[#c29cf2] shadow-sm" 
                : "text-zinc-500"
            }`}
          >
            Спецзадание
          </button>
          <button
            onClick={() => setActiveTab("referral")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "referral" 
                ? "bg-white text-[#c29cf2] shadow-sm" 
                : "text-zinc-500"
            }`}
          >
            Пригласи друга
          </button>
          <button
            onClick={() => setActiveTab("hot")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "hot" 
                ? "bg-white text-[#c29cf2] shadow-sm" 
                : "text-zinc-500"
            }`}
          >
            Горящие
          </button>
        </div>

        {/* Основной контент */}
        <div className="text-center mb-5">
          <div className="text-4xl font-bold text-zinc-900 mb-1">{current.reward}</div>
          <div className="text-sm text-zinc-500">{current.condition}</div>
          {current.daysLeft !== null && (
            <div className="inline-block mt-2 px-3 py-1 bg-[#c29cf2]/10 rounded-full text-xs text-[#c29cf2]">
              ⏰ Осталось {current.daysLeft} {current.daysLeft === 1 ? "день" : "дней"}
            </div>
          )}
          <div className="mt-3 text-sm font-medium text-zinc-700">{current.progress}</div>
        </div>

        {/* Правила */}
        <div className="bg-zinc-50 rounded-xl p-4 mb-5">
          <div className="text-xs font-semibold text-zinc-400 uppercase mb-2">Условия</div>
          <ul className="space-y-2">
            {current.rules.map((rule, i) => (
              <li key={i} className="text-sm text-zinc-600 flex items-start gap-2">
                <span className="text-[#c29cf2] mt-0.5">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Кнопка действия */}
        <button
          onClick={() => {
            if (activeTab === "referral") {
              navigator.clipboard.writeText("https://smenuberu.ru/ref/USER789");
              alert("Ссылка скопирована!");
            } else {
              onClose();
            }
          }}
          className="w-full bg-[#c29cf2] text-white py-3 rounded-xl font-medium"
        >
          {activeTab === "referral" ? "Получить ссылку" : 
           activeTab === "hot" ? "Выбрать слот" : 
           "К заданиям"}
        </button>
      </div>
    </div>
  );
}