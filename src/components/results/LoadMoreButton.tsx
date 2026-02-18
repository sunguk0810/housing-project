"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full rounded-[var(--radius-s7-xl)] border-[var(--color-brand-500)]",
        "px-[var(--space-4)] py-[var(--space-3)] h-auto",
        "text-[length:var(--text-body-sm)] font-semibold text-[var(--color-brand-500)]",
        "hover:bg-[var(--color-brand-50)] active:scale-[0.98]",
        className,
      )}
    >
      결과 더 보기 ({currentCount}/{totalCount})
    </Button>
  );
}
