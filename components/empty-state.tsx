import Link from "next/link";

export default function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  imageUrl,
  imageAlt = "Иллюстрация"
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
      {imageUrl && (
        <div className="mb-4 flex justify-center">
          <img 
            src={imageUrl} 
            alt={imageAlt} 
            className="mx-auto w-40 h-40 object-contain"
          />
        </div>
      )}
      
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      
      {description && (
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      )}
      
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-block rounded-xl bg-[#c29cf2] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#b088e0]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}