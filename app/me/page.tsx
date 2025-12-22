"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ChevronRight } from "lucide-react";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru";
}

function getLoginUrl() {
  return getApiBase() + "/auth/yandex/start";
}

function SectionLink({
  href,
  title,
  subtitle,
  index,
  mounted,
}: {
  href: string;
  title: string;
  subtitle: string;
  index: number;
  mounted: boolean;
}) {
  // небольшой "stagger" (каждая карточка чуть позже)
  const delayMs = 60 + index * 70;

  return (
    <Link
      href={href}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={[
        "group",
        "rounded-xl",
        "border border-gray-200",
        "p-4",
        "transition",
        "hover:bg-gray-50",
        "flex items-center justify-between gap-4",
        // анимация появления "справа"
        "transform-gpu",
        "duration-300",
        "ease-out",
        mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
      ].join(" ")}
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

  // ✅ для анимации появления (после первого рендера)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Проверка авторизации…</div>;
  }

  // ❌ никаких авто-редиректов
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
  const phone = (user as any).phone ?? null;
  const taxStatus = (user as any).taxStatus ?? null;

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

      {/* Profile */}
      <section className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-4">
          {(user as any).avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={(user as any).avatarUrl} alt="" className="h-16 w-16 rounded-full" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              🙂
            </div>
          )}

          <div className="min-w-0">
            <div className="font-medium truncate">{displayName}</div>
            {email ? <div className="text-sm text-gray-500 truncate">{email}</div> : null}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-2">
          <div className="text-sm text-gray-500">О себе</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 p-3">
              <div className="text-xs text-gray-500">ФИО</div>
              <div className="text-sm">{displayName}</div>
            </div>

            <div className="rounded-lg border border-gray-100 p-3">
              <div className="text-xs text-gray-500">Телефон</div>
              <div className="text-sm text-gray-700">
                {phone ?? <span className="text-gray-400">— (позже из профиля исполнителя)</span>}
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 p-3">
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm text-gray-700">
                {email ?? <span className="text-gray-400">—</span>}
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 p-3">
              <div className="text-xs text-gray-500">Учетные данные</div>
              <div className="text-sm text-gray-700">Яндекс OAuth (cookie-сессия)</div>
            </div>

            <div className="rounded-lg border border-gray-100 p-3 sm:col-span-2">
              <div className="text-xs text-gray-500">Налоговый статус</div>
              <div className="text-sm text-gray-700">
                {taxStatus ?? <span className="text-gray-400">— (ИП / НПД / ГПХ… позже)</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-3">
        <div className="text-sm text-gray-500">Разделы</div>

        <div className="grid grid-cols-1 gap-3">
          <SectionLink
            href="/me/documents"
            title="Мои документы"
            subtitle="Активные договоры"
            index={0}
            mounted={mounted}
          />
          <SectionLink
            href="/me/rating"
            title="Личный рейтинг"
            subtitle="Оценка и показатели"
            index={1}
            mounted={mounted}
          />
          <SectionLink
            href="/me/bookings"
            title="Забронированные смены"
            subtitle="Скоро: GET /bookings/me"
            index={2}
            mounted={mounted}
          />
          <SectionLink
            href="/me/favorites"
            title="Избранное"
            subtitle="Понравившиеся объекты и смены"
            index={3}
            mounted={mounted}
          />
        </div>
      </section>
    </div>
  );
}
