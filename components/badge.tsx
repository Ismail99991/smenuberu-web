import { cn } from "@/lib/cn";
import { uiTransition } from "@/lib/ui";

export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700",
        // мягкое появление / исчезновение, без transform
        uiTransition,
        "motion-reduce:transform-none"
      )}
    >
      {children}
    </span>
  );
}
