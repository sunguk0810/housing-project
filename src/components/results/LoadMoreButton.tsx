"use client";

import { cn } from "@/lib/utils";

interface LoadMoreButtonProps {
  currentCount: number;
  totalCount: number;
  onClick: () => void;
  className?: string;
}

export function LoadMoreButton({
  currentCount,
  totalCount,
  onClick,
  className,
}: LoadMoreButtonProps) {
  if (currentCount >= totalCount) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[var(--radius-s7-xl)] border border-[var(--color-brand-500)]",
        "px-[var(--space-4)] py-[var(--space-3)]",
        "text-[length:var(--text-body-sm)] font-semibold text-[var(--color-brand-500)]",
        "transition-colors hover:bg-[var(--color-brand-50)] active:scale-[0.98]",
        className,
      )}
    >
      결과 더 보기 ({currentCount}/{totalCount})
    </button>
  );
}
