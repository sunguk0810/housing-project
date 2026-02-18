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
    <div className={cn("z-2 flex max-w-[220px] flex-wrap gap-[var(--space-1)]", className)} role="radiogroup" aria-label="정렬 기준">
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
              "inline-flex items-center gap-0.5 rounded-[var(--radius-s7-full)] border-[1.5px] px-[var(--space-2)] py-0.5",
              "text-[11px] font-medium shadow-[var(--shadow-s7-sm)] transition-colors",
              isActive
                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)]",
            )}
          >
            <Icon className="size-2.5 shrink-0" />
            {opt.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
