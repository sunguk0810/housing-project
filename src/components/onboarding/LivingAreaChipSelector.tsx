'use client';

import { LIVING_AREA_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
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
        <span className="text-[length:var(--text-caption)] text-[var(--color-primary)]">
          {values.length}/{maxSelect}
        </span>
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {LIVING_AREA_OPTIONS.map((option) => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                'min-h-[44px] rounded-full border px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-body-sm)] transition-colors',
                selected
                  ? 'border-[var(--color-primary)] bg-[var(--color-brand-50)] text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-sunken)]',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
