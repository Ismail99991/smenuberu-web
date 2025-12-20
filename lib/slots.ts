import type { TaskType } from "@/lib/task-types";

export type Slot = {
  id: string;
  date: string; // YYYY-MM-DD (local)
  title: string;
  company: string;
  city: string;
  address: string;
  time: string; // "10:00–19:00"
  pay: number;
  hot?: boolean; // "горящий слот"
  tags: string[];
  type: TaskType; // 👈 тип задания (для иконки/фильтра)
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? "https://smenuberu-api.onrender.com";

export function toISODateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function formatDayLabelRu(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date);
}

export function formatWeekdayShortRu(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date);
}

export function formatMoneyRub(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

/**
 * Пробуем взять слоты из API (UI-формат уже совпадает с нашим Slot).
 */
export async function getSlotsFromApi(): Promise<Slot[]> {
  const res = await fetch(`${API_BASE}/slots/ui`, {
    headers: { Accept: "application/json" }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /slots/ui failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as unknown;

  if (!Array.isArray(data)) {
    throw new Error("GET /slots/ui returned non-array");
  }

  // Минимальная валидация формы (без фанатизма)
  return data.filter(Boolean) as Slot[];
}

/**
 * Главная функция для UI:
 * - сначала API
 * - если API упал/пусто/ошибка → моки
 *
 * Важно: days/start используются только для моков (API отдаёт всё как есть).
 */
export async function getSlots(start: Date, days = 14): Promise<Slot[]> {
  try {
    const apiSlots = await getSlotsFromApi();
    // Если API вернул пусто — считаем это "нет данных" и даём моки, чтобы UI не выглядел сломанным.
    if (apiSlots.length > 0) return apiSlots;
  } catch (e) {
    // Чтобы не шуметь в проде, можно оставить warn.
    console.warn("[slots] API failed, using mock slots:", e);
  }

  return getMockSlots(start, days);
}

// Генератор “условных” слотов на 14 дней вперёд.
// Горячие слоты: каждый 3-й день, первый слот в этот день.
export function getMockSlots(start: Date, days = 14): Slot[] {
  const out: Slot[] = [];

  for (let i = 0; i < days; i++) {
    const date = toISODateLocal(addDays(start, i));

    // 0..2 слота в день (чтобы были пустые дни)
    const count = i % 4 === 0 ? 0 : i % 2 === 0 ? 2 : 1;
    const hotDay = i % 3 === 0;

    for (let j = 0; j < count; j++) {
      const id = `${date}-slot-${j + 1}`;
      const hot = hotDay && j === 0;

      const template = j % 4;

      const base =
        template === 0
          ? {
              type: "cook" as const,
              title: "Повар-универсал",
              company: "Кафе «Лимон»",
              city: "Берлин",
              address: "Warschauer Str. 12",
              time: "10:00–19:00",
              pay: 3500,
              tags: ["Питание", "Форма"]
            }
          : template === 1
            ? {
                type: "waiter" as const,
                title: "Официант",
                company: "Ресторан «Север»",
                city: "Берлин",
                address: "Prenzlauer Allee 77",
                time: "12:00–21:00",
                pay: 2800,
                tags: ["Чаевые", "Обучение"]
              }
            : template === 2
              ? {
                  type: "loader" as const,
                  title: "Грузчик (склад)",
                  company: "Склад «Nord»",
                  city: "Потсдам",
                  address: "Industriestr. 4",
                  time: "08:00–15:00",
                  pay: 3200,
                  tags: ["Тёплый склад", "Физ. нагрузка"]
                }
              : {
                  type: "driver" as const,
                  title: "Водитель (забор → доставка)",
                  company: "Логистика «Sprint»",
                  city: "Берлин",
                  address: "Pickup: Alexanderplatz",
                  time: "14:00–19:00",
                  pay: 4200,
                  tags: ["Кат. B", "Навигация"]
                };

      out.push({
        id,
        date,
        hot,
        ...base
      });
    }
  }

  return out;
}
export async function getSlotsFromApi() {
  const res = await fetch("https://smenuberu-api.onrender.com/slots/ui");

  if (!res.ok) {
    throw new Error("Failed to fetch slots from API");
  }

  return res.json();
}
