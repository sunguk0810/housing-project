"use client";

import { cn } from "@/lib/utils";

interface ExceptionButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function ExceptionButton({
  label,
  onClick,
  className,
}: ExceptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] px-[var(--space-3)] py-[var(--space-2)]",
        "text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]",
        "underline underline-offset-4 transition-colors",
        "hover:text-[var(--color-on-surface)]",
        className,
      )}
    >
      {label}
    </button>
  );
}
