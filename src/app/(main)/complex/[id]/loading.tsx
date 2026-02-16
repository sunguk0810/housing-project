import { Skeleton } from "@/components/feedback/Skeleton";

export default function ComplexDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--space-4)] py-[var(--space-6)]">
      {/* Hero skeleton */}
      <Skeleton className="mb-[var(--space-6)] h-40 w-full rounded-b-[var(--radius-s7-xl)]" />
      {/* Score bars skeleton */}
      <Skeleton className="mb-[var(--space-6)] h-60 w-full" />
      {/* Commute skeleton */}
      <Skeleton className="mb-[var(--space-6)] h-32 w-full" />
      {/* Price skeleton */}
      <Skeleton className="mb-[var(--space-6)] h-40 w-full" />
    </div>
  );
}
