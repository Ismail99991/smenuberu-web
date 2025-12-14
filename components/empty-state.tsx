import Link from "next/link";

export default function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-zinc-600">{description}</p>}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-block rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
