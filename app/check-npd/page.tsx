"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Frown,
  Smile
} from "lucide-react";
import { cn } from "@/lib/cn";
import { setLocalSelfEmployed } from "@/lib/user-state";

interface CheckNpdResponse {
  success: boolean;
  inn: string;
  isSelfEmployed: boolean;
  statusDate?: string | null;
  message?: string;
  error?: string;
}

export default function CheckNpdPage() {
  const router = useRouter();
  const [inn, setInn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckNpdResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

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
      const response = await fetch("https://api.smenube.ru/check-npd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inn: cleanInn }),
      });

      const data: CheckNpdResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка проверки");
      }

      setResult(data);
      setSheetVisible(true);

      if (data.success && data.isSelfEmployed) {
        setLocalSelfEmployed(true);
      }
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
    setSheetVisible(false);
  };

  const isValid = isValidInn(inn);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f0ff] to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Hero секция */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c29cf2] to-[#a070d0] shadow-lg mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Подтверждение самозанятости
          </h1>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">
            Проверка через ФНС — нужно для получения выплат
          </p>
        </div>

        {/* Форма */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-4">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              ИНН исполнителя
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={inn}
                onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
                placeholder="000 000 0000"
                className={cn(
                  "w-full text-center text-xl font-mono tracking-wide rounded-xl border-0 bg-zinc-50 px-4 py-4 outline-none transition-all",
                  "focus:ring-2 focus:ring-[#c29cf2]/30 focus:bg-white",
                  "placeholder:text-zinc-300 placeholder:text-base"
                )}
              />
              {inn && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={cn(
                "mt-6 w-full py-4 rounded-xl font-semibold text-white transition-all",
                "bg-gradient-to-r from-[#c29cf2] to-[#a070d0]",
                "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Проверяем...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Проверить статус
                </>
              )}
            </button>
          </form>
        </div>

        {/* Ошибка формы */}
        {error && !result && (
          <div className="text-center text-sm text-red-500 mt-4">
            {error}
          </div>
        )}

        {/* Доверительный блок */}
        <div className="text-center mt-8">
          <p className="text-xs text-zinc-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Данные передаются напрямую из реестра ФНС
          </p>
        </div>
      </div>

      {/* Bottom Sheet — выезжает снизу */}
      {sheetVisible && result && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
            onClick={() => setSheetVisible(false)}
          />
          
          {/* Sheet */}
          <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-white rounded-t-3xl shadow-2xl",
            "animate-in slide-in-from-bottom duration-300",
            "flex flex-col"
          )}
          style={{ height: "70vh" }}>
            
            {/* Drag indicator */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-zinc-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              {result.isSelfEmployed ? (
                // Успех — счастливый путь
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Smile className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-3">
                    Отлично!
                  </h2>
                  <p className="text-zinc-600 mb-6">
                    Ваш статус самозанятого подтверждён.
                    Теперь вам доступна запись на смены.
                  </p>
                  <button
                    onClick={() => router.push("/shifts")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c29cf2] text-white font-medium hover:bg-[#b088e8] transition-colors"
                  >
                    Перейти к сменам
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // Неудача — печальный путь
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                    <Frown className="w-12 h-12 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-3">
                    К сожалению...
                  </h2>
                  <p className="text-zinc-600 mb-2">
                    Мы пока не можем сотрудничать с вами,
                  </p>
                  <p className="text-zinc-600 mb-6">
                    так как вы не зарегистрированы как самозанятый.
                  </p>

                  <div className="bg-zinc-50 rounded-xl p-5 text-left mb-6">
                    <p className="font-semibold text-zinc-800 mb-3">Что делать?</p>
                    <div className="space-y-3">
                      <a 
                        href="https://npd.nalog.ru/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-zinc-600 hover:text-[#c29cf2] transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Зарегистрироваться в «Мой Налог»</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Указать ИНН в профиле платформы</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">3</span>
                        <span>После подтверждения — выплаты станут доступны</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400">
                    ИНН {result.inn} проверен {result.statusDate}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
