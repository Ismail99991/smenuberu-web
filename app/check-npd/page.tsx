"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  UserCheck,
  FileText,
  CreditCard,
  ExternalLink
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

  const isValidInn = (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.length === 10 || clean.length === 12;
  };

  const formatInnDisplay = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 10)}`;
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

      if (data.success && data.isSelfEmployed) {
        setLocalSelfEmployed(true);
        setTimeout(() => {
          router.push("/shifts");
        }, 1500);
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
  };

  const isValid = isValidInn(inn);
  const displayInn = formatInnDisplay(inn);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f0ff] to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Hero секция */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c29cf2] to-[#a070d0] shadow-lg mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Подтверждение самозанятости
          </h1>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">
            Проверка через ФНС — нужно для получения выплат на платформе
          </p>
        </div>

        {/* Форма */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 mb-4">
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
                  "w-full text-center text-2xl font-mono tracking-wide rounded-xl border-2 px-4 py-4 outline-none transition-all",
                  "placeholder:text-zinc-300 placeholder:text-base",
                  "focus:border-[#c29cf2] focus:ring-2 focus:ring-[#c29cf2]/20",
                  error && "border-red-300 bg-red-50 focus:border-red-400",
                  result?.isSelfEmployed === true && "border-green-400 bg-green-50",
                  result?.isSelfEmployed === false && "border-red-300 bg-red-50"
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
            {inn && (
              <p className="text-xs text-zinc-400 mt-2 text-center">
                {displayInn} — {isValid ? "✓ формат верный" : "✗ должно быть 10 или 12 цифр"}
              </p>
            )}

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

        {/* Результат */}
        {result && (
          <div className={cn(
            "rounded-2xl p-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300",
            result.isSelfEmployed
              ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
              : "bg-gradient-to-br from-red-50 to-rose-50 border border-red-200"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                result.isSelfEmployed ? "bg-green-200" : "bg-red-200"
              )}>
                {result.isSelfEmployed ? (
                  <CheckCircle className="w-6 h-6 text-green-700" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-700" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "font-bold text-lg",
                  result.isSelfEmployed ? "text-green-800" : "text-red-800"
                )}>
                  {result.isSelfEmployed ? "Статус подтверждён" : "Не является самозанятым"}
                </h3>
                <p className="text-sm mt-1 text-zinc-700">
                  {result.message}
                </p>
                {result.statusDate && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Дата проверки: {result.statusDate}
                  </p>
                )}

                {!result.isSelfEmployed && (
                  <div className="mt-4 bg-white/60 rounded-xl p-4">
                    <p className="font-semibold text-zinc-800 mb-3">🔧 Что делать?</p>
                    <div className="space-y-3">
                      <a 
                        href="https://npd.nalog.ru/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-zinc-700 hover:text-[#c29cf2] transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#c29cf2]/10 flex items-center justify-center">
                          <FileText className="w-3 h-3 text-[#c29cf2]" />
                        </div>
                        <span>Зарегистрироваться в приложении «Мой Налог»</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                          <UserCheck className="w-3 h-3 text-zinc-500" />
                        </div>
                        <span>Указать ИНН в профиле платформы</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                          <CreditCard className="w-3 h-3 text-zinc-500" />
                        </div>
                        <span>После подтверждения — выплаты станут доступны</span>
                      </div>
                    </div>
                  </div>
                )}

                {result.isSelfEmployed && (
                  <button
                    onClick={() => router.push("/shifts")}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#c29cf2] hover:gap-3 transition-all"
                  >
                    Вернуться к сменам
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ошибка */}
        {error && !result && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          </div>
        )}

        {/* Доверительный блок */}
        <div className="text-center">
          <p className="text-xs text-zinc-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Данные передаются напрямую из реестра ФНС
          </p>
        </div>
      </div>
    </div>
  );
}
