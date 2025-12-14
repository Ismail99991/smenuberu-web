import EmptyState from "@/components/empty-state";

export default function ApplicationsPage() {
  return (
    <EmptyState
      title="Заявок пока нет"
      description="После откликов здесь появятся статусы."
      actionHref="/shifts"
      actionLabel="Смотреть смены"
    />
  );
}
