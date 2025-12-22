"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

function getLoginUrl() {
  return (
    (process.env.NEXT_PUBLIC_API_URL ?? "https://smenuberu-api.onrender.com") +
    "/auth/yandex/start"
  );
}

export default function MePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ✅ чтобы не было двойного редиректа на /auth/yandex/start
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;

    if (!loading && !user) {
      didRedirect.current = true;
      window.location.href = getLoginUrl();
    }
  }, [loading, user]);

  if (loading || !user) {
    return <div className="p-6 text-sm text-gray-500">Проверка авторизации…</div>;
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

      {/* дальше будут:
          - мои записи
          - уведомления
          - выход
      */}
    </div>
  );
}
