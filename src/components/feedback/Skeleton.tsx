"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-s7-md)]",
        className,
      )}
      style={{
        background:
          "linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-neutral-50) 50%, var(--color-neutral-200) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1500ms infinite",
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Card-shaped skeleton matching PropertyCard layout */
export function PropertyCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-s7-xl)] border border-[var(--color-border)] p-[var(--space-4)] shadow-[var(--shadow-s7-sm)]">
      {/* Row 1: rank badge + name + gauge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-[var(--space-2)]">
          <Skeleton className="h-6 w-6 rounded-[var(--radius-s7-sm)]" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      {/* Row 2: address */}
      <Skeleton className="mt-[var(--space-2)] h-3 w-48" />
      {/* Row 3: price */}
      <Skeleton className="mt-[var(--space-2)] h-4 w-36" />
      {/* Row 4: score grid 2x2 */}
      <div className="mt-[var(--space-2)] grid grid-cols-2 gap-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
      {/* Row 5: commute + compare */}
      <div className="mt-[var(--space-2)] flex items-center justify-between border-t border-[var(--color-border)] pt-[var(--space-2)]">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-16 rounded-[var(--radius-s7-full)]" />
      </div>
    </div>
  );
}
