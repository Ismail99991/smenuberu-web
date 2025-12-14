export type Shift = {
  id: string;
  title: string;
  company: string;
  city: string;
  address: string;

  // Реальная дата смены (локальная), ISO-формат YYYY-MM-DD
  date: string;

  time: string; // "10:00–19:00"
  pay: number; // 3500
  tags: string[];
  requirements: string[];
  description: string;
};

export const shifts: Shift[] = [
  {
    id: "s1",
    title: "Повар-универсал",
    company: "Кафе «Лимон»",
    city: "Берлин",
    address: "Warschauer Str. 12",
    date: "2025-12-14",
    time: "10:00–19:00",
    pay: 3500,
    tags: ["Питание", "Форма"],
    requirements: ["Опыт от 1 года", "Пунктуальность", "Полный цикл кухни"],
    description:
      "Работа на горячем/холодном цехе, подготовка заготовок, соблюдение санитарных норм."
  },
  {
    id: "s2",
    title: "Официант",
    company: "Ресторан «Север»",
    city: "Берлин",
    address: "Prenzlauer Allee 77",
    date: "2025-12-15",
    time: "12:00–21:00",
    pay: 2800,
    tags: ["Чаевые", "Обучение"],
    requirements: ["Коммуникабельность", "Немецкий/английский базовый"],
    description:
      "Обслуживание гостей в зале, работа с заказами, поддержание чистоты в зоне обслуживания."
  },
  {
    id: "s3",
    title: "Кладовщик",
    company: "Склад «Nord»",
    city: "Потсдам",
    address: "Industriestr. 4",
    date: "2025-12-20",
    time: "08:00–17:00",
    pay: 3200,
    tags: ["Тёплый склад"],
    requirements: ["Внимательность", "Готовность к физнагрузке"],
    description:
      "Приём/выдача товара, маркировка, сборка заказов, инвентаризация."
  }
];

export function formatMoneyRub(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

export function toISODateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDayLabelRu(isoDate: string) {
  // isoDate: YYYY-MM-DD
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date);
}

export function formatWeekdayShortRu(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date);
}
