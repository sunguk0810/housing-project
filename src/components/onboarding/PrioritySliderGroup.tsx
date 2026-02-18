'use client';

import { PRIORITY_SLIDER_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { PriorityWeights } from '@/types/ui';

interface PrioritySliderGroupProps {
  value: PriorityWeights;
  onChange: (value: PriorityWeights) => void;
  className?: string;
}

export function PrioritySliderGroup({ value, onChange, className }: PrioritySliderGroupProps) {
  function handleChange(key: keyof PriorityWeights, next: number) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  return (
    <div className={cn('space-y-[var(--space-4)]', className)}>
      <p className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
        항목별 중요도를 조정해주세요
      </p>
      {PRIORITY_SLIDER_OPTIONS.map(({ key, label }) => (
        <div key={key} className="space-y-[var(--space-2)]">
          <div className="flex items-center justify-between">
            <span className="text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)]">
              {label}
            </span>
            <span className="text-[length:var(--text-caption)] text-[var(--color-primary)]">
              {value[key]}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={value[key]}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-[var(--color-primary)]"
            aria-label={`${label} 중요도`}
          />
        </div>
      ))}
    </div>
  );
}
