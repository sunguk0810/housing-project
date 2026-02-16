"use client";

import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/lib/constants";
import type { SortOption } from "@/types/ui";

interface CardSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function CardSelector({ value, onChange, className }: CardSelectorProps) {
  return (
    <div className={cn("flex gap-[var(--space-2)]", className)}>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[var(--radius-s7-full)] border-[1.5px] px-[var(--space-3)] py-1",
            "text-[length:var(--text-caption)] font-medium transition-colors",
            value === opt.value
              ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
              : "border-[var(--color-border)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-brand-400)]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
