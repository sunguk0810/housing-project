import { Skeleton } from "@/components/feedback/Skeleton";

export default function MainLoading() {
  return (
    <div className="mx-auto max-w-5xl px-[var(--space-4)] py-[var(--space-6)]">
      <Skeleton className="mb-[var(--space-4)] h-8 w-48" />
      <div className="space-y-[var(--space-4)]">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
}
