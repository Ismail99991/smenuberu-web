// lib/user-state.ts
import { useAuth } from '@/components/auth-provider';

// Тип пользователя (расширяется по мере необходимости)
export interface User {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  yandexLogin: string | null;
  isSelfEmployed: boolean;
  // в будущем: firstName, lastName, phone и т.д.
}

// Получить всего пользователя из контекста (реактивно)
export function useUser(): User | null {
  const { user } = useAuth();
  return user as User | null;
}

// Получить только статус НПД (реактивно)
export function useIsSelfEmployed(): boolean {
  const user = useUser();
  return user?.isSelfEmployed ?? false;
}

// ---------- Fallback через localStorage (для синхронного доступа) ----------
export function getLocalSelfEmployed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('is_self_employed') === 'true';
}

export function setLocalSelfEmployed(value: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('is_self_employed', String(value));
}
