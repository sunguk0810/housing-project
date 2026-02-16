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
