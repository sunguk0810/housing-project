'use client';

import { cn } from '@/lib/utils';
import { EmojiCard } from './EmojiCard';

interface CardOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly emoji: string;
}

interface EmojiCardSelectorProps<T extends string> {
  options: readonly CardOption<T>[];
  /** Single selection mode */
  value?: T;
  onSelect?: (value: T) => void;
  /** Multiple selection mode with ordering */
  values?: readonly T[];
  onMultiSelect?: (values: T[]) => void;
  maxSelect?: number;
  /** Grid columns: "2" | "3" | "4" */
  columns?: '2' | '3' | '4';
  className?: string;
  role?: 'radiogroup' | 'group';
  ariaLabel?: string;
}

const COLS: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-2 sm:grid-cols-4',
};

export function EmojiCardSelector<T extends string>({
  options,
  value,
  onSelect,
  values,
  onMultiSelect,
  maxSelect = 3,
  columns = '3',
  className,
  role = 'radiogroup',
  ariaLabel,
}: EmojiCardSelectorProps<T>) {
  const isMulti = !!values && !!onMultiSelect;

  function handleClick(optionValue: T) {
    if (isMulti) {
      const idx = values.indexOf(optionValue);
      if (idx >= 0) {
        // Deselect — renumber remaining
        const next = [...values];
        next.splice(idx, 1);
        onMultiSelect(next);
      } else if (values.length < maxSelect) {
        onMultiSelect([...values, optionValue]);
      }
    } else {
      onSelect?.(optionValue);
    }
  }

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn('grid gap-[var(--space-3)]', COLS[columns], className)}
    >
      {options.map((opt) => {
        const isSelected = isMulti ? values.includes(opt.value) : value === opt.value;
        const numberBadge = isMulti ? values.indexOf(opt.value) + 1 || undefined : undefined;

        return (
          <EmojiCard
            key={opt.value}
            emoji={opt.emoji}
            label={opt.label}
            selected={isSelected}
            onClick={() => handleClick(opt.value)}
            numberBadge={numberBadge}
          />
        );
      })}
    </div>
  );
}
