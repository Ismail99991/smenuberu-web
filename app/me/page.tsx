"use client";

import { useAuth } from "@/components/auth-provider";

function getLoginUrl() {
  return (
    (process.env.NEXT_PUBLIC_API_URL ?? "https://smenuberu-api.onrender.com") +
    "/auth/yandex/start"
  );
}

export default function MePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Проверка авторизации…</div>;
  }

  // ✅ Больше НЕ делаем авто-редирект (иначе петля)
  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Личный кабинет</h1>
        <p className="text-sm text-gray-600">
          Чтобы открыть личный кабинет, нужно войти.
        </p>

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Личный кабинет</h1>

      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full" />
        ) : null}

        <div>
          <div className="font-medium">{user.displayName ?? "Без имени"}</div>
          {user.email ? <div className="text-sm text-gray-500">{user.email}</div> : null}
        </div>
      </div>
    </div>
  );
}
