import EmptyState from "@/components/empty-state";

export default function ShiftsPage() {
  return (
    <EmptyState
      title="Пока нет доступных смен"
      description="Здесь появятся смены по фильтрам и геолокации."
      actionHref="/profile"
      actionLabel="Настроить профиль"
    />
  );
}
