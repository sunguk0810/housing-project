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
    <div className={cn("flex gap-[var(--space-2)]", className)} role="radiogroup" aria-label="정렬 기준">
      {SORT_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-[var(--radius-s7-full)] border-[1.5px] px-[var(--space-3)] py-1",
              "text-[length:var(--text-caption)] font-medium transition-colors",
              isActive
                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
                : "border-[var(--color-border)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-brand-400)]",
            )}
          >
            <Icon className="size-3 shrink-0" />
            <span className="lg:hidden">{opt.shortLabel}</span>
            <span className="hidden lg:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
