// lib/user-state.ts
import { useAuth } from '@/components/auth-provider';

// =========================
// TYPES
// =========================
export interface User {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  yandexLogin: string | null;
  isSelfEmployed: boolean;
}

// =========================
// CLIENT SAFE HOOK (PATCHED)
// =========================
export function useUser(): User | null {
  // 🔥 PATCH: предотвращаем SSR crash
  if (typeof window === 'undefined') {
    return null as any;
  }

  // теперь hook вызывается только в браузере
  const { user } = useAuth();
  return user as User | null;
}

// =========================
// CLIENT FLAG HOOK
// =========================
export function useIsSelfEmployed(): boolean {
  const user = useUser();
  return user?.isSelfEmployed ?? false;
}

// =========================
// OPTIONAL: LOCAL FALLBACK (НЕ ЛОМАЕТ SSR)
// =========================
export function getLocalSelfEmployed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('is_self_employed') === 'true';
}

export function setLocalSelfEmployed(value: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('is_self_employed', String(value));
}