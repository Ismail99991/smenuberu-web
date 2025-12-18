export type TaskType =
  | "driver"
  | "picker"
  | "loader"
  | "cook"
  | "waiter"
  | "cleaner"
  | "other";

export const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "driver", label: "Водитель / логистика" },
  { value: "picker", label: "Сборщик" },
  { value: "loader", label: "Грузчик" },
  { value: "cook", label: "Повар" },
  { value: "waiter", label: "Официант" },
  { value: "cleaner", label: "Уборка" },
  { value: "other", label: "Другое" } // всегда в конце
];
