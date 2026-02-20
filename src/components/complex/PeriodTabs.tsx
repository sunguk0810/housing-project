"use client";

/**
 * @deprecated Use ViewTabs instead. This component is no longer used in BudgetPanel.
 */

import { cn } from "@/lib/utils";
import type { PeriodOption } from "@/lib/price-utils";

interface PeriodTabsProps {
  periods: ReadonlyArray<PeriodOption>;
  selectedMonths: number | null;
  onSelect: (months: number | null) => void;
  className?: string;
}

export function PeriodTabs({
  periods,
  selectedMonths,
  onSelect,
  className,
}: PeriodTabsProps) {
  return (
    <div className={cn("flex gap-[var(--space-2)]", className)}>
      {periods.map((period) => {
        const isSelected = selectedMonths === period.months;
        return (
          <button
            key={period.label}
            type="button"
            onClick={() => onSelect(period.months)}
            disabled={period.disabled}
            className={cn(
              "rounded-[var(--radius-s7-full)] px-[var(--space-3)] py-1 text-[length:var(--text-caption)] font-medium transition-colors",
              isSelected
                ? "bg-[var(--color-brand-500)] text-white"
                : "bg-[var(--color-neutral-100)] text-[var(--color-on-surface-muted)] hover:bg-[var(--color-neutral-200)]",
              period.disabled && "cursor-not-allowed opacity-40",
            )}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
