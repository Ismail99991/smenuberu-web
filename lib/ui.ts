// lib/ui.ts
import { cn } from "@/lib/utils";

/**
 * Базовая плавность для всего интерактива
 * НИКОГДА не использовать на fixed / layout контейнерах
 */
export const uiTransition =
  "transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none";

/**
 * Карточки (слоты, блоки, списки)
 * Без layout-движений
 */
export const uiCard = cn(
  "rounded-xl border bg-white",
  uiTransition,
  "hover:shadow-md hover:border-gray-300",
  "active:scale-[0.99]"
);

/**
 * Интерактивные зоны (кликабельные строки, list items)
 */
export const uiInteractive = cn(
  uiTransition,
  "hover:bg-gray-50",
  "active:bg-gray-100"
);

/**
 * Кнопки (база)
 */
export const uiButtonBase = cn(
  "inline-flex items-center justify-center gap-2",
  "select-none",
  uiTransition,
  "hover:brightness-105",
  "active:scale-[0.97]",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

/**
 * Primary button
 */
export const uiButtonPrimary = cn(
  uiButtonBase,
  "bg-black text-white",
  "hover:bg-black/90"
);

/**
 * Secondary / ghost button
 */
export const uiButtonGhost = cn(
  uiButtonBase,
  "bg-transparent text-black",
  "hover:bg-gray-100"
);

/**
 * Табы / переключатели
 * НИКОГДА не двигаются
 */
export const uiTab = cn(
  "px-3 py-2 rounded-lg",
  "transition-colors duration-150",
  "text-gray-500",
  "data-[active=true]:text-black data-[active=true]:bg-gray-100"
);

/**
 * Текст вторичный / подсказки
 */
export const uiMutedText =
  "text-gray-500 transition-opacity duration-200";

/**
 * Overlay / backdrop (модалки)
 */
export const uiOverlay =
  "fixed inset-0 bg-black/40 transition-opacity duration-200";

/**
 * Контент модалки / popover
 */
export const uiModal =
  "transition-all duration-200 ease-out opacity-0 translate-y-2 data-[open=true]:opacity-100 data-[open=true]:translate-y-0";

/**
 * ⚠️ Нижнее меню — ЗАПРЕЩЕНО движение
 */
export const uiBottomNav =
  "fixed bottom-0 left-0 right-0 transition-none transform-none";
