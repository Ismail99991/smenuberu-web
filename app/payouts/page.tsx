"use client";

import { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Copy, 
  Check, 
  CreditCard,
  Banknote,
  QrCode,
  Users,
  TrendingUp,
  Target,
  Shield,
  ChevronRight,
  Calendar,
  Filter
} from "lucide-react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

export default function PayoutsPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"balance" | "history" | "referrals">("balance");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("month");

  // Мок-данные
  const balanceData = {
    available: 12540,
    inProcess: 3500,
    totalEarned: 84320,
    referralsEarned: 12000,
    thisMonth: 28450,
    lastMonth: 19500
  };

  const operations = [
    { id: 1, type: "income", title: "Смена: Курьер", amount: 2500, date: "15.03.2024", status: "completed" },
    { id: 2, type: "income", title: "Смена: Официант", amount: 1800, date: "14.03.2024", status: "completed" },
    { id: 3, type: "withdrawal", title: "Вывод на карту", amount: -5000, date: "10.03.2024", status: "completed" },
    { id: 4, type: "income", title: "Реферальное вознаграждение", amount: 3000, date: "08.03.2024", status: "completed" },
    { id: 5, type: "income", title: "Смена: Грузчик", amount: 3200, date: "05.03.2024", status: "inProcess" },
  ];

  const referralData = {
    totalReferrals: 12,
    activeReferrals: 8,
    earned: 12000,
    link: "https://smenuberu.ru/ref/7a8b9c"
  };

  const handleCopyRefLink = () => {
    navigator.clipboard.writeText(referralData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Хедер с балансом */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Wallet className="h-4 w-4" />
              Общий баланс
            </div>
            <div className="mt-1 text-3xl font-bold text-zinc-900">
              {balanceData.available.toLocaleString("ru-RU")} ₽
            </div>
            <div className="mt-2 text-sm text-zinc-500">
              +{balanceData.thisMonth.toLocaleString("ru-RU")} ₽ в этом месяце
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-zinc-500">Доступно</div>
            <div className="mt-1 text-xl font-semibold text-green-600">
              {balanceData.available.toLocaleString("ru-RU")} ₽
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              В обработке: {balanceData.inProcess.toLocaleString("ru-RU")} ₽
            </div>
          </div>
        </div>

        {/* Быстрые действия - ТОЛЬКО вывод */}
        <div className="mt-6">
          <button className={cn(
            uiTransition,
            "group flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 text-sm font-medium text-white",
            "hover:bg-zinc-800 active:scale-[0.98] shadow-md"
          )}>
            <ArrowUpRight className="h-4 w-4" />
            Вывести деньги
          </button>
          
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-zinc-500">
            <Shield className="h-3 w-3" />
            Минимальная сумма вывода: 500 ₽ • Без комиссии раз в сутки
          </div>
        </div>
      </div>

      {/* Навигационные табы */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-1">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: "balance", label: "Баланс", icon: Wallet },
            { id: "history", label: "История", icon: History },
            { id: "referrals", label: "Рефералы", icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                uiTransition,
                "flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-medium",
                activeTab === tab.id
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Контент в зависимости от активного таба */}
      {activeTab === "balance" && (
        <>
          {/* Статистика */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Статистика доходов</div>
              <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                {["week", "month", "quarter"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period as any)}
                    className={cn(
                      uiTransition,
                      "rounded-lg px-3 py-1.5 text-xs",
                      selectedPeriod === period
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-600 hover:text-zinc-900"
                    )}
                  >
                    {period === "week" ? "Неделя" : period === "month" ? "Месяц" : "Квартал"}
                  </button>
                ))}
              </div>
            </div>

            {/* График (упрощённый) */}
            <div className="mt-4">
              <div className="flex h-32 items-end justify-between gap-1">
                {[40, 65, 85, 60, 90, 75, 100].map((height, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className="w-8 rounded-t-lg bg-gradient-to-t from-brand to-brand/70"
                      style={{ height: `${height}%` }}
                    />
                    <div className="mt-2 text-[10px] text-zinc-500">
                      {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-xs text-zinc-500">Всего заработано</div>
                  <div className="mt-1 text-xl font-semibold">
                    {balanceData.totalEarned.toLocaleString("ru-RU")} ₽
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-xs text-zinc-500">С рефералов</div>
                  <div className="mt-1 text-xl font-semibold text-green-600">
                    {balanceData.referralsEarned.toLocaleString("ru-RU")} ₽
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Способы выплаты */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold">Способы выплаты</div>
            <div className="mt-3 space-y-3">
              {[
                { id: "card", title: "Банковская карта", icon: CreditCard, connected: true },
                { id: "sbp", title: "СБП", icon: Banknote, connected: true },
                { id: "yoomoney", title: "ЮMoney", icon: QrCode, connected: false },
              ].map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    uiTransition,
                    "flex items-center justify-between rounded-xl border border-zinc-200 p-4",
                    method.connected ? "bg-white" : "bg-zinc-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-lg p-2",
                      method.connected ? "bg-brand/10" : "bg-zinc-100"
                    )}>
                      <method.icon className={cn(
                        "h-5 w-5",
                        method.connected ? "text-brand" : "text-zinc-400"
                      )} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{method.title}</div>
                      <div className="text-xs text-zinc-500">
                        {method.connected ? "Подключено" : "Не подключено"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">История операций</div>
            <button className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-2 text-xs">
              <Filter className="h-3 w-3" />
              Фильтр
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {operations.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-lg p-2",
                    op.type === "income" ? "bg-green-50" : "bg-blue-50"
                  )}>
                    {op.type === "income" ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{op.title}</div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Calendar className="h-3 w-3" />
                      {op.date}
                      {op.status === "inProcess" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                          В обработке
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  op.amount > 0 ? "text-green-600" : "text-zinc-900"
                )}>
                  {op.amount > 0 ? "+" : ""}{op.amount.toLocaleString("ru-RU")} ₽
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "referrals" && (
        <>
          {/* Реферальная статистика */}
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900">Реферальная программа</div>
                <div className="mt-1 text-xs text-zinc-600">
                  Приглашайте друзей и зарабатывайте 3 000 ₽ за каждого
                </div>
              </div>
              <div className="rounded-full bg-white/80 p-2">
                <Users className="h-5 w-5 text-sky-600" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/80 p-3 text-center backdrop-blur-sm">
                <div className="text-xs text-zinc-500">Приглашено</div>
                <div className="mt-1 text-xl font-semibold text-sky-700">
                  {referralData.totalReferrals}
                </div>
              </div>
              <div className="rounded-xl bg-white/80 p-3 text-center backdrop-blur-sm">
                <div className="text-xs text-zinc-500">Активных</div>
                <div className="mt-1 text-xl font-semibold text-green-600">
                  {referralData.activeReferrals}
                </div>
              </div>
              <div className="rounded-xl bg-white/80 p-3 text-center backdrop-blur-sm">
                <div className="text-xs text-zinc-500">Заработано</div>
                <div className="mt-1 text-xl font-semibold text-zinc-900">
                  {referralData.earned.toLocaleString("ru-RU")} ₽
                </div>
              </div>
            </div>

            {/* Реферальная ссылка */}
            <div className="mt-6">
              <div className="text-xs text-zinc-600 mb-2">Ваша реферальная ссылка</div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl bg-white/80 p-3 text-sm font-mono backdrop-blur-sm">
                  {referralData.link}
                </div>
                <button
                  onClick={handleCopyRefLink}
                  className={cn(
                    uiTransition,
                    "flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium",
                    copied ? "bg-green-50 text-green-700" : "text-sky-700 hover:bg-white/90"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Копировать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Как работает */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold">Как это работает</div>
            <div className="mt-3 space-y-3">
              {[
                "Друг регистрируется по вашей ссылке",
                "Друг выполняет первую смену",
                "Вы получаете 3 000 ₽ на баланс",
                "Друг получает 1 000 ₽ бонусом"
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                    {i + 1}
                  </div>
                  <div className="text-sm text-zinc-700">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Информационные блоки */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-500" />
            <div className="text-xs font-medium text-zinc-700">Безопасность</div>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Все операции защищены шифрованием. Минимальная сумма вывода — 500 ₽.
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-zinc-500" />
            <div className="text-xs font-medium text-zinc-700">Комиссия</div>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Вывод без комиссии раз в сутки. Далее — 1%. Пополнение — бесплатно.
          </div>
        </div>
      </div>
    </div>
  );
}