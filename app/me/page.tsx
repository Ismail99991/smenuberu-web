"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ChevronRight } from "lucide-react";

function getApiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru").replace(/\/+$/, "");
}

function getLoginUrl() {
  // ✅ web-flow: отдельное OAuth-приложение + вернуться обратно в web
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

export default function MePage() {
  const { user, loading } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Проверка авторизации…</div>;
  }

  // ✅ никаких авто-редиректов
  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Личный кабинет</h1>
        <p className="text-sm text-gray-600">Чтобы открыть личный кабинет, нужно войти.</p>

        <button
          type="button"
          onClick={() => {
            window.location.href = getLoginUrl();
          }}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          Войти через Яндекс
        </button>
      </div>
    );
  }

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

  const displayName =
    (user as any).displayName ?? (user as any).name ?? (user as any).fullName ?? "Без имени";

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

      {/* ✅ Компактный переход в раздел "О себе" */}
      <Link
        href="/me/about"
        className="group rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              🙂
            </div>
          )}

          <div className="min-w-0">
            {/* H2: ФИО */}
            <h2 className="text-base font-semibold truncate">{displayName}</h2>
            {/* H3: О себе */}
            <h3 className="text-sm font-medium text-gray-500 mt-0.5">О себе</h3>
            {email ? <div className="text-xs text-gray-400 truncate mt-1">{email}</div> : null}
          </div>
        </div>

        <ChevronRight
          size={20}
          className="text-gray-400 transition group-hover:text-gray-600 group-hover:translate-x-0.5"
        />
      </Link>

      {/* Sections */}
      <section className="space-y-3">
        <div className="text-sm text-gray-500">Разделы</div>

        <div className="grid grid-cols-1 gap-3">
          <SectionLink href="/me/documents" title="Мои документы" subtitle="Активные договоры" />
          <SectionLink href="/me/rating" title="Личный рейтинг" subtitle="Оценка и показатели" />
          <SectionLink
            href="/me/bookings"
            title="Забронированные смены"
            subtitle="Подключим: GET /bookings/me"
          />
          <SectionLink href="/me/favorites" title="Избранное" subtitle="Понравившиеся объекты и смены" />
        </div>
      </section>
    </div>
  );
}
