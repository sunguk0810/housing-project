"use client";

import { cn } from "@/lib/utils";

interface BlurredPreviewCardProps {
  className?: string;
}

export function BlurredPreviewCard({ className }: BlurredPreviewCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-s7-lg)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)] p-[var(--space-4)]",
        className,
      )}
      aria-hidden="true"
      style={{ filter: "blur(4px)" }}
    >
      {/* Mock card content */}
      <div className="space-y-[var(--space-2)]">
        <div className="h-4 w-3/4 rounded bg-[var(--color-neutral-200)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-neutral-100)]" />
        <div className="flex gap-[var(--space-2)]">
          <div className="h-8 w-16 rounded-[var(--radius-s7-sm)] bg-[var(--color-brand-50)]" />
          <div className="h-8 w-16 rounded-[var(--radius-s7-sm)] bg-[var(--color-neutral-100)]" />
          <div className="h-8 w-16 rounded-[var(--radius-s7-sm)] bg-[var(--color-neutral-100)]" />
        </div>
        <div className="h-3 w-2/3 rounded bg-[var(--color-neutral-100)]" />
      </div>
    </div>
  );
}
