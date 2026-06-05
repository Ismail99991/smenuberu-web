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
  Filter,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  Info,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

// Типы для статусов выплат (расширенные)
type WithdrawalStatus = 
  | "pending"      // выплата инициирована, ждём ответа банка
  | "processing"   // банк обрабатывает
  | "completed"    // деньги ушли
  | "failed"       // ошибка (с кодом)
  | "blocked"      // заблокировано по 115-ФЗ
  | "retry";       // повторная попытка через N часов

interface Operation {
  id: number;
  type: "income" | "withdrawal";
  title: string;
  amount: number;
  date: string;
  status: WithdrawalStatus | "completed" | "inProcess";
  failReason?: string;
  failMessage?: string;
  retryAt?: string;
  cardMask?: string;
}

export default function PayoutsPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"balance" | "history" | "referrals">("balance");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("month");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState("card");
  const [expandedErrorId, setExpandedErrorId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Мок-данные
  const balanceData = {
    available: 12540,
    inProcess: 3500,
    totalEarned: 84320,
    referralsEarned: 12000,
    thisMonth: 28450,
    lastMonth: 19500
  };

  // Расширенные операции с поддержкой ошибок
  const operations: Operation[] = [
    { id: 1, type: "income", title: "Смена: Курьер", amount: 2500, date: "15.03.2024", status: "completed" },
    { id: 2, type: "income", title: "Смена: Официант", amount: 1800, date: "14.03.2024", status: "completed" },
    { id: 3, type: "withdrawal", title: "Вывод на карту", amount: -5000, date: "10.03.2024", status: "completed", cardMask: "•••• 4321" },
    { id: 4, type: "income", title: "Реферальное вознаграждение", amount: 3000, date: "08.03.2024", status: "completed" },
    { id: 5, type: "income", title: "Смена: Грузчик", amount: 3200, date: "05.03.2024", status: "inProcess" },
    { 
      id: 6, 
      type: "withdrawal", 
      title: "Вывод на карту", 
      amount: -1200, 
      date: "16.03.2024", 
      status: "failed", 
      failReason: "bank_timeout",
      failMessage: "Банк получателя временно недоступен. Деньги вернутся на баланс в течение 1-2 часов.",
      cardMask: "•••• 9876"
    },
    { 
      id: 7, 
      type: "withdrawal", 
      title: "Вывод на карту", 
      amount: -3000, 
      date: "16.03.2024", 
      status: "blocked", 
      failReason: "115fz_check",
      failMessage: "Выплата заблокирована банком по требованию 115-ФЗ. Обычно проверка занимает 1-3 дня.",
      cardMask: "•••• 4321"
    },
    { 
      id: 8, 
      type: "withdrawal", 
      title: "Вывод на карту", 
      amount: -2500, 
      date: "16.03.2024", 
      status: "retry", 
      retryAt: "2024-03-17T10:00:00",
      failReason: "recipient_error",
      failMessage: "Неверные реквизиты карты. Повторная попытка через 2 часа.",
      cardMask: "•••• 5555"
    },
  ];

  const referralData = {
    totalReferrals: 12,
    activeReferrals: 8,
    earned: 12000,
    link: "https://smenuberu.ru/ref/7a8b9c"
  };

  // Конфигурация статусов для отображения
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Ожидает", icon: Clock, className: "bg-gray-100 text-gray-700" };
      case "processing":
        return { label: "В обработке", icon: RefreshCw, className: "bg-amber-100 text-amber-700" };
      case "completed":
        return { label: "Выполнено", icon: Check, className: "bg-green-100 text-green-700" };
      case "failed":
        return { label: "Ошибка", icon: AlertCircle, className: "bg-red-100 text-red-700" };
      case "blocked":
        return { label: "Заблокировано", icon: Shield, className: "bg-orange-100 text-orange-700" };
      case "retry":
        return { label: "Повтор через 2ч", icon: RefreshCw, className: "bg-blue-100 text-blue-700" };
      case "inProcess":
        return { label: "В обработке", icon: Clock, className: "bg-amber-100 text-amber-700" };
      default:
        return { label: status, icon: Info, className: "bg-gray-100 text-gray-700" };
    }
  };

  // Инструкции для разных типов ошибок
  const getErrorInstruction = (failReason: string) => {
    switch (failReason) {
      case "bank_timeout":
        return "Ничего не нужно делать — средства автоматически вернутся на баланс в течение 1-2 часов. После этого можно повторить вывод.";
      case "115fz_check":
        return "Банк проводит проверку по закону 115-ФЗ. Это стандартная процедура, может занять до 3 рабочих дней. Если статус не изменится дольше — обратитесь в поддержку.";
      case "recipient_error":
        return "Проверьте правильность реквизитов карты в разделе «Способы выплаты». После исправления можно запросить выплату заново.";
      case "limit_exceeded":
        return "Превышен суточный лимит вывода. Следующая попытка будет доступна через 24 часа.";
      case "self_employed_expired":
        return "Ваш статус самозанятого не подтверждён. Зайдите в приложение «Мой Налог» и обновите статус, затем повторите вывод.";
      default:
        return "Попробуйте повторить вывод позже. Если проблема повторяется — свяжитесь с поддержкой платформы.";
    }
  };

  const handleCopyRefLink = () => {
    navigator.clipboard.writeText(referralData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 500) {
      alert("Минимальная сумма вывода — 500 ₽");
      return;
    }
    if (amount > balanceData.available) {
      alert("Недостаточно средств на балансе");
      return;
    }
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    alert(`Запрос на вывод ${amount} ₽ отправлен в обработку`);
  };

  const filteredOperations = operations.filter(op => {
    if (filterStatus === "all") return true;
    if (filterStatus === "income") return op.type === "income";
    if (filterStatus === "withdrawal") return op.type === "withdrawal";
    if (filterStatus === "failed") return op.status === "failed" || op.status === "blocked";
    return true;
  });

  return (
    <div className="space-y-4 pb-8">
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

        {/* Быстрые действия */}
        <div className="mt-6">
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className={cn(
              uiTransition,
              "group flex w-full items-center justify-center gap-2 rounded-xl bg-[#c29cf2] p-3 text-sm font-medium text-white",
              "hover:bg-[#b088e8] active:scale-[0.98] shadow-md"
            )}
          >
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
                "active:scale-[0.97]",
                activeTab === tab.id
                  ? "bg-[#c29cf2] text-white"
                  : "text-zinc-700 hover:bg-zinc-50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Модалка вывода средств */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Вывод средств</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="rounded-full p-1 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Способ вывода</label>
                <div className="mt-2 space-y-2">
                  {[
                    { id: "card", title: "Банковская карта", subtitle: "•••• 4321", icon: CreditCard },
                    { id: "sbp", title: "СБП", subtitle: "Т-Банк", icon: Banknote }
                  ].map((method) => (
                    <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-3">
                      <input
                        type="radio"
                        name="withdrawMethod"
                        value={method.id}
                        checked={selectedCard === method.id}
                        onChange={(e) => setSelectedCard(e.target.value)}
                        className="h-4 w-4 text-[#c29cf2]"
                      />
                      <div className="rounded-lg bg-[#c29cf2]/10 p-2">
                        <method.icon className="h-5 w-5 text-[#c29cf2]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{method.title}</div>
                        <div className="text-xs text-zinc-500">{method.subtitle}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Сумма</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Минимум 500 ₽"
                    className="flex-1 rounded-xl border border-zinc-200 p-3 focus:border-[#c29cf2] focus:outline-none"
                  />
                  <button 
                    onClick={() => setWithdrawAmount(balanceData.available.toString())}
                    className="rounded-xl bg-zinc-100 px-4 py-3 text-sm font-medium hover:bg-zinc-200"
                  >
                    Все
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Сумма вывода</span>
                  <span className="font-medium">{parseFloat(withdrawAmount) || 0} ₽</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>Комиссия (0%)</span>
                  <span>0 ₽</span>
                </div>
                <div className="mt-2 border-t border-zinc-200 pt-2 flex justify-between font-medium">
                  <span>Итого к получению</span>
                  <span>{parseFloat(withdrawAmount) || 0} ₽</span>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                className="w-full rounded-xl bg-[#c29cf2] p-3 font-medium text-white hover:bg-[#b088e8]"
              >
                Подтвердить вывод
              </button>
            </div>
          </div>
        </div>
      )}

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
                      "rounded-lg px-3 py-1.5 text-xs active:scale-[0.97]",
                      selectedPeriod === period
                        ? "bg-[#c29cf2] text-white"
                        : "text-zinc-600 hover:bg-zinc-100"
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
                      className="w-8 rounded-t-lg bg-gradient-to-t from-[#c29cf2] to-[#c29cf2]/70"
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
                  <div className="mt-1 text-xl font-semibold text-[#c29cf2]">
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
                { id: "card", title: "Банковская карта", icon: CreditCard, connected: true, mask: "•••• 4321" },
                { id: "sbp", title: "СБП", icon: Banknote, connected: true, mask: "Т-Банк" },
                { id: "yoomoney", title: "ЮMoney", icon: QrCode, connected: false, mask: null },
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
                      method.connected ? "bg-[#c29cf2]/10" : "bg-zinc-100"
                    )}>
                      <method.icon className={cn(
                        "h-5 w-5",
                        method.connected ? "text-[#c29cf2]" : "text-zinc-400"
                      )} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{method.title}</div>
                      <div className="text-xs text-zinc-500">
                        {method.connected ? method.mask : "Не подключено"}
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
            <div className="flex gap-2">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs"
              >
                <option value="all">Все операции</option>
                <option value="income">Поступления</option>
                <option value="withdrawal">Выводы</option>
                <option value="failed">Ошибки</option>
              </select>
              <button className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-2 text-xs active:scale-[0.97]">
                <Filter className="h-3 w-3" />
                Дата
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filteredOperations.map((op) => {
              const statusConfig = getStatusConfig(op.status);
              const StatusIcon = statusConfig.icon;
              const isError = op.status === "failed" || op.status === "blocked";
              
              return (
                <div
                  key={op.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex items-center justify-between">
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
                          {op.cardMask && (
                            <span className="text-zinc-400">{op.cardMask}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-semibold",
                        op.amount > 0 ? "text-green-600" : "text-zinc-900"
                      )}>
                        {op.amount > 0 ? "+" : ""}{op.amount.toLocaleString("ru-RU")} ₽
                      </div>
                      <div className="mt-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
                          statusConfig.className
                        )}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Детали ошибки (если есть) */}
                  {isError && op.failMessage && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-800">
                            {op.status === "blocked" ? "Выплата заблокирована банком" : "Ошибка выплаты"}
                          </div>
                          <div className="mt-0.5 text-xs text-red-700">
                            {op.failMessage}
                          </div>
                          
                          {/* Кнопка "Что делать?" с разворачивающейся инструкцией */}
                          <button
                            onClick={() => setExpandedErrorId(expandedErrorId === op.id ? null : op.id)}
                            className="mt-2 flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
                          >
                            {expandedErrorId === op.id ? "Скрыть инструкцию" : "Что делать?"}
                            <ChevronRight className={cn(
                              "h-3 w-3 transition-transform",
                              expandedErrorId === op.id && "rotate-90"
                            )} />
                          </button>
                          
                          {expandedErrorId === op.id && op.failReason && (
                            <div className="mt-2 rounded-md bg-white p-2 text-xs text-zinc-700">
                              <div className="font-medium">Инструкция:</div>
                              <div className="mt-1">{getErrorInstruction(op.failReason)}</div>
                              <div className="mt-2 flex gap-2">
                                {op.status === "failed" && op.failReason === "recipient_error" && (
                                  <button className="rounded-lg bg-[#c29cf2] px-3 py-1 text-xs text-white">
                                    Исправить реквизиты
                                  </button>
                                )}
                                <button className="rounded-lg border border-zinc-200 px-3 py-1 text-xs">
                                  Связаться с поддержкой
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {op.status === "retry" && op.retryAt && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                              <RefreshCw className="h-3 w-3" />
                              Повторная попытка автоматически: после {new Date(op.retryAt).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredOperations.length === 0 && (
              <div className="py-8 text-center text-sm text-zinc-500">
                Операций не найдено
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "referrals" && (
        <>
          {/* Реферальная статистика */}
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-[#c29cf2]/5 to-[#c29cf2]/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900">Реферальная программа</div>
                <div className="mt-1 text-xs text-zinc-600">
                  Приглашайте друзей и зарабатывайте 3 000 ₽ за каждого
                </div>
              </div>
              <div className="rounded-full bg-white/80 p-2">
                <Users className="h-5 w-5 text-[#c29cf2]" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/80 p-3 text-center backdrop-blur-sm">
                <div className="text-xs text-zinc-500">Приглашено</div>
                <div className="mt-1 text-xl font-semibold text-[#c29cf2]">
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
                <div className="flex-1 rounded-xl bg-white/80 p-3 text-sm font-mono backdrop-blur-sm truncate">
                  {referralData.link}
                </div>
                <button
                  onClick={handleCopyRefLink}
                  className={cn(
                    uiTransition,
                    "flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium",
                    "active:scale-[0.97]",
                    copied ? "bg-green-50 text-green-700" : "text-[#c29cf2] hover:bg-white/90"
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
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c29cf2]/10 text-xs font-semibold text-[#c29cf2]">
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
