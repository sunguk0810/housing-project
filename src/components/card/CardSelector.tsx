"use client";

import { cn } from "@/lib/utils";
import type { SortOption } from "@/types/ui";

interface CardSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "score", label: "종합 점수순" },
  { value: "budget", label: "예산 적합도순" },
  { value: "commute", label: "통근 시간순" },
];

export function CardSelector({ value, onChange, className }: CardSelectorProps) {
  return (
    <div className={cn("flex gap-[var(--space-2)]", className)}>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[var(--radius-s7-full)] px-[var(--space-3)] py-1",
            "text-[length:var(--text-caption)] font-medium transition-colors",
            value === opt.value
              ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "bg-[var(--color-surface-sunken)] text-[var(--color-on-surface-muted)] hover:bg-[var(--color-neutral-200)]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
