"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

type User = {
  id: string;
  displayName?: string | null;
  yandexLogin?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function apiBaseUrl() {
  // ⚠️ Важно: НЕ оставляй дефолтом onrender в web.
  // Если env не задан — лучше локалка.
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
}

async function fetchMe(): Promise<User | null> {
  const res = await fetch(`${apiBaseUrl()}/auth/me`, {
    method: "GET",
    credentials: "include", // ✅ обязательно
    cache: "no-store", // ✅ не кешировать /auth/me
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { ok?: boolean; user?: User | null };
  return data?.user ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const u = await fetchMe();
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // при первом маунте подтягиваем /auth/me
    refresh();
  }, [refresh]);

  const value = useMemo<AuthState>(() => ({ user, loading, refresh }), [user, loading, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
