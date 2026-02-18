'use client';

import { LIVING_AREA_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { LivingAreaKey } from '@/types/ui';

interface LivingAreaChipSelectorProps {
  values: readonly LivingAreaKey[];
  onChange: (values: LivingAreaKey[]) => void;
  maxSelect?: number;
  className?: string;
}

export function LivingAreaChipSelector({
  values,
  onChange,
  maxSelect = 3,
  className,
}: LivingAreaChipSelectorProps) {
  function handleToggle(value: LivingAreaKey) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    if (values.length >= maxSelect) return;
    onChange([...values, value]);
  }

  return (
    <div className={cn('space-y-[var(--space-3)]', className)}>
      <div className="flex items-center justify-between">
        <p className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          생활권을 선택해주세요 (최대 {maxSelect}개)
        </p>
        <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {values.length}/{maxSelect}
        </span>
      </div>
      <div
        role="group"
        aria-label="생활권 선택"
        className="-mx-[var(--space-4)] flex gap-[var(--space-2)] overflow-x-auto px-[var(--space-4)] pb-[var(--space-1)] scrollbar-none"
      >
        {LIVING_AREA_OPTIONS.map((option) => {
          const selected = values.includes(option.value);
          const isDisabled = !selected && values.length >= maxSelect;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              aria-pressed={selected}
              aria-disabled={isDisabled || undefined}
              className="shrink-0"
            >
              <Badge
                variant={selected ? 'default' : 'outline'}
                className={cn(
                  'h-9 cursor-pointer px-[var(--space-3)] text-[length:var(--text-body-sm)] transition-colors select-none',
                  selected
                    ? 'border-transparent bg-[var(--color-neutral-800)] font-medium text-white hover:bg-[var(--color-neutral-700)]'
                    : 'border-[var(--color-border)] text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-sunken)]',
                  isDisabled && 'cursor-not-allowed opacity-40',
                )}
              >
                {option.label}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
