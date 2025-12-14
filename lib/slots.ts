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
};

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

// Генератор “условных” слотов на 14 дней вперёд.
// Горячие слоты: каждый 3-й день, и ещё один случайный слот в этот день.
export function getMockSlots(start: Date, days = 14): Slot[] {
  const out: Slot[] = [];

  for (let i = 0; i < days; i++) {
    const date = toISODateLocal(addDays(start, i));

    // 0..2 слота в день (чтобы были пустые дни)
    const count = (i % 4 === 0) ? 0 : (i % 2 === 0 ? 2 : 1);
    const hotDay = i % 3 === 0; // условно “горящие дни”

    for (let j = 0; j < count; j++) {
      const id = `${date}-slot-${j + 1}`;
      const hot = hotDay && j === 0; // первый слот в “горящий день” — горячий

      const template = (j % 3);
      const base =
        template === 0
          ? {
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
                title: "Официант",
                company: "Ресторан «Север»",
                city: "Берлин",
                address: "Prenzlauer Allee 77",
                time: "12:00–21:00",
                pay: 2800,
                tags: ["Чаевые", "Обучение"]
              }
            : {
                title: "Кладовщик",
                company: "Склад «Nord»",
                city: "Потсдам",
                address: "Industriestr. 4",
                time: "08:00–17:00",
                pay: 3200,
                tags: ["Тёплый склад"]
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
