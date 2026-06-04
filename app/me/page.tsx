"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { ChevronRight, ExternalLink } from "lucide-react";

function getApiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

function getLoginUrl() {
  const next = "/me";
  return getApiBase() + "/auth/yandex/web/start?next=" + encodeURIComponent(next);
}

function SectionLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      </div>
      <ChevronRight
        size={20}
        className="text-gray-400 transition group-hover:text-gray-600 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

// Компонент для неавторизованного пользователя с чекбоксами
function UnauthenticatedContent() {
  const [agreeOffer, setAgreeOffer] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  
  const isFormValid = agreeOffer && agreePrivacy;
  
  // Чекбокс "Согласен со всем"
  useEffect(() => {
    setAgreeAll(agreeOffer && agreePrivacy);
  }, [agreeOffer, agreePrivacy]);
  
  const handleLogin = () => {
    if (isFormValid) {
      window.location.href = getLoginUrl();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Вход в личный кабинет</h2>
        <p className="text-sm text-gray-600 mb-6">
          Для входа необходимо авторизоваться через Яндекс ID и принять условия работы на платформе.
        </p>
        
        {/* Чекбоксы */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeOffer}
              onChange={(e) => setAgreeOffer(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#c29cf2] focus:ring-[#c29cf2]"
            />
            <span className="text-sm text-gray-700">
              Я принимаю условия{' '}
              <Link href="/offer" target="_blank" className="text-[#c29cf2] hover:underline inline-flex items-center gap-0.5">
                Договора-оферты <ExternalLink className="h-3 w-3" />
              </Link>
            </span>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#c29cf2] focus:ring-[#c29cf2]"
            />
            <span className="text-sm text-gray-700">
              Я принимаю условия{' '}
              <Link href="/privacy-policy" target="_blank" className="text-[#c29cf2] hover:underline inline-flex items-center gap-0.5">
                Политики обработки персональных данных <ExternalLink className="h-3 w-3" />
              </Link>
            </span>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-gray-100">
            <input
              type="checkbox"
              checked={agreeAll}
              onChange={(e) => {
                const checked = e.target.checked;
                setAgreeOffer(checked);
                setAgreePrivacy(checked);
              }}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#c29cf2] focus:ring-[#c29cf2]"
            />
            <span className="text-sm font-medium text-gray-800">
              Согласен со всеми условиями
            </span>
          </label>
        </div>
        
        {/* Кнопка входа */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={!isFormValid}
          className={`
            w-full rounded-lg px-4 py-2 text-sm font-medium transition
            ${isFormValid 
              ? 'bg-[#c29cf2] text-white hover:bg-[#b088e8] cursor-pointer' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Войти через Яндекс
        </button>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          Нажимая «Войти через Яндекс», вы соглашаетесь с условиями Договора-оферты и Политикой обработки ПД
        </p>
      </div>
    </div>
  );
}

export default function MePage() {
  const { user, loading } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Проверка авторизации…</div>;
  }

  // Неавторизованный пользователь — показываем форму с чекбоксами
  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Личный кабинет</h1>
        <UnauthenticatedContent />
      </div>
    );
  }

  // Авторизованный пользователь — показываем ЛК
  async function onLogout() {
    setLogoutLoading(true);
    try {
      await fetch(getApiBase() + "/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.reload();
    } finally {
      setLogoutLoading(false);
    }
  }

  const displayName = (user as any).displayName ?? (user as any).name ?? (user as any).fullName ?? "Без имени";
  const email = (user as any).email ?? null;
  const avatarUrl = (user as any).avatarUrl ?? null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Личный кабинет</h1>
          <div className="text-xs text-gray-500 mt-1">web = UI, бизнес-логика только в API</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={logoutLoading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-60"
        >
          {logoutLoading ? "Выходим…" : "Выйти"}
        </button>
      </div>

      {/* Компактный переход в раздел "О себе" */}
      <Link
        href="/me/about"
        className="group rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              🙂
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold truncate">{displayName}</h2>
            <h3 className="text-sm font-medium text-gray-500 mt-0.5">О себе</h3>
            {email ? <div className="text-xs text-gray-400 truncate mt-1">{email}</div> : null}
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-400 transition group-hover:text-gray-600 group-hover:translate-x-0.5" />
      </Link>

      {/* Разделы */}
      <section className="space-y-3">
        <div className="text-sm text-gray-500">Разделы</div>
        <div className="grid grid-cols-1 gap-3">
          <SectionLink href="/me/documents" title="Мои документы" subtitle="Активные договоры" />
          <SectionLink href="/me/rating" title="Личный рейтинг" subtitle="Оценка и показатели" />
          <SectionLink href="/me/bookings" title="Забронированные смены" subtitle="Подключим: GET /bookings/me" />
          <SectionLink href="/me/favorites" title="Избранное" subtitle="Понравившиеся объекты и смены" />
          <SectionLink href="/me/offer" title="Договор-оферта" subtitle="Публичная оферта для исполнителей" />
        </div>
      </section>
    </div>
  );
}