import type { TaskType } from "@/lib/task-types";

export type Slot = {
  id: string;
  date: string;
  title: string;
  company: string;
  city: string;
  address: string;
  time: string;
  pay: number;
  hot?: boolean;
  tags: string[];
  type: TaskType;
};

// ✅ ИСПРАВЛЕННЫЙ API_BASE
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.smenube.ru";

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
 * Получение слотов из API (публичные опубликованные слоты)
 * Используется для исполнителей (web)
 */
export async function getSlotsFromApi(): Promise<Slot[]> {
  const res = await fetch(`${API_BASE}/slots`, {
    headers: { Accept: "application/json" },
    credentials: "include", // ✅ важно для куки/сессии
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /slots failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as any;
  
  // API возвращает { ok: true, slots: [...] }
  if (!data.ok || !Array.isArray(data.slots)) {
    throw new Error("Invalid API response format");
  }

  // Преобразуем в нужный формат
  return data.slots.map((s: any) => ({
    id: s.id,
    date: s.date,
    title: s.title,
    company: s.object?.name ?? s.company ?? "",
    city: s.city,
    address: s.address,
    time: s.time,
    pay: s.pay,
    hot: s.hot ?? false,
    tags: [],
    type: s.type,
  }));
}

/**
 * Главная функция для UI:
 * API → если не получилось → моки
 */
export async function getSlots(start: Date, days = 14): Promise<Slot[]> {
  try {
    const apiSlots = await getSlotsFromApi();
    if (apiSlots.length > 0) return apiSlots;
  } catch (e) {
    console.warn("[slots] API failed, using mock slots:", e);
  }

  return getMockSlots(start, days);
}

// Моки (оставляем как fallback)
export function getMockSlots(start: Date, days = 14): Slot[] {
  const out: Slot[] = [];

  for (let i = 0; i < days; i++) {
    const date = toISODateLocal(addDays(start, i));
    const count = i % 4 === 0 ? 0 : i % 2 === 0 ? 2 : 1;
    const hotDay = i % 3 === 0;

    for (let j = 0; j < count; j++) {
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
        id: `${date}-slot-${j + 1}`,
        date,
        hot,
        ...base
      });
    }
  }

  return out;
}