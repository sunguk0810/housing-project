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

/** Card-shaped skeleton matching compact PropertyCard layout */
export function PropertyCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-s7-xl)] border border-[var(--color-border)] px-4 py-3.5 shadow-[var(--shadow-s7-sm)]">
      {/* Row 1: rank badge + name + compare */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-1)]">
          <Skeleton className="h-5 w-5 rounded-[var(--radius-s7-sm)]" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-6 w-12 rounded-[var(--radius-s7-full)]" />
      </div>
      {/* Rows 2-3: info + gauge */}
      <div className="mt-1 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      {/* Row 4: dimension scores */}
      <Skeleton className="mt-1 h-3 w-full" />
    </div>
  );
}
