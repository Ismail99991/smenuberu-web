import type { TaskType } from "@/lib/task-types";
import {
  Truck,
  ShoppingBasket,
  Package,
  Utensils,
  User,
  SprayCan
} from "lucide-react";

const ICONS: Record<TaskType, React.ElementType> = {
  driver: Truck,            // 🚚
  picker: ShoppingBasket,   // 🧺
  loader: Package,          // 📦 (как “рохля/груз”)
  cook: Utensils,           // 🍳
  waiter: User,             // 👤
  cleaner: SprayCan,        // 🧴
  other: User
};

export function TaskTypeIcon({
  type,
  className
}: {
  type: TaskType;
  className?: string;
}) {
  const Icon = ICONS[type] ?? ICONS.other;
  return <Icon className={className ?? "h-5 w-5"} />;
}
