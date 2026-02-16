"use client";

import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/lib/constants";
import type { SortOption } from "@/types/ui";

interface MapSortOverlayProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function MapSortOverlay({ value, onChange, className }: MapSortOverlayProps) {
  return (
    <div className={cn("z-2 flex max-w-[200px] flex-wrap gap-[var(--space-1)]", className)}>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[var(--radius-s7-full)] border-[1.5px] px-[var(--space-2)] py-0.5",
            "text-[11px] font-medium shadow-[var(--shadow-s7-sm)] transition-colors",
            value === opt.value
              ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)]",
          )}
        >
          {opt.shortLabel}
        </button>
      ))}
    </div>
  );
}
