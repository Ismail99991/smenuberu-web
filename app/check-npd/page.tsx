// app/check-npd/page.tsx
"use client";

import { useState } from "react";
import { Check, X, AlertCircle, Loader2, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

// Тип ответа от API
interface CheckNpdResponse {
  success: boolean;
  inn: string;
  isSelfEmployed: boolean;
  statusDate?: string | null;
  message?: string;
  error?: string;
}

export default function CheckNpdPage() {
  const [inn, setInn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckNpdResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Валидация: 10 или 12 цифр
  const isValidInn = (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.length === 10 || clean.length === 12;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanInn = inn.replace(/\D/g, "");

    if (!isValidInn(cleanInn)) {
      setError("ИНН должен содержать 10 или 12 цифр");
      setResult(null);
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      // TODO: замени URL на твой реальный бэкенд
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-npd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inn: cleanInn }),
      });

      const data: CheckNpdResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка проверки");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Не удалось проверить статус. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInn("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-8">
      {/* Заголовок */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#c29cf2]/10 p-2.5">
            <Shield className="h-6 w-6 text-[#c29cf2]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Проверка самозанятого</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              По данным ФНС — нужно для получения выплат на платформе
            </p>
          </div>
        </div>
      </div>

      {/* Карточка формы */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              ИНН исполнителя
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={inn}
              onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
              placeholder="Введите 10 или 12 цифр"
              className={cn(
                "w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none transition",
                "focus:border-[#c29cf2] focus:ring-1 focus:ring-[#c29cf2]/30",
                error && "border-red-300 bg-red-50"
              )}
            />
            {error && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                uiTransition,
                "flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#c29cf2] py-3 font-medium text-white",
                "hover:bg-[#b088e8] disabled:opacity-70 active:scale-[0.98]"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Проверить
                </>
              )}
            </button>
            {inn && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                Очистить
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Результат проверки */}
      {result && (
        <div className={cn(
          "rounded-2xl border p-5 transition-all",
          result.isSelfEmployed
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "rounded-full p-1",
              result.isSelfEmployed ? "bg-green-100" : "bg-red-100"
            )}>
              {result.isSelfEmployed ? (
                <Check className="h-5 w-5 text-green-700" />
              ) : (
                <X className="h-5 w-5 text-red-700" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold",
                result.isSelfEmployed ? "text-green-800" : "text-red-800"
              )}>
                {result.isSelfEmployed ? "Статус подтверждён" : "Не является самозанятым"}
              </h3>
              <p className="mt-1 text-sm text-zinc-700">
                {result.message}
              </p>
              {result.statusDate && (
                <p className="mt-1 text-xs text-zinc-500">
                  Дата регистрации: {result.statusDate}
                </p>
              )}

              {/* Инструкция для исполнителя */}
              {!result.isSelfEmployed && (
                <div className="mt-4 rounded-xl bg-white p-3 text-sm">
                  <p className="font-medium text-zinc-800">Что делать?</p>
                  <ul className="mt-2 space-y-1.5 text-zinc-600">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      Зарегистрируйтесь в приложении «Мой Налог»
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      Укажите ИНН в профиле платформы
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      После подтверждения статуса — выплаты станут доступны
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Пояснение */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 text-zinc-500">
          <Shield className="h-4 w-4" />
          <span className="text-xs">
            Данные передаются напрямую из реестра ФНС. Результат проверки валиден на текущий момент.
          </span>
        </div>
      </div>
    </div>
  );
}
