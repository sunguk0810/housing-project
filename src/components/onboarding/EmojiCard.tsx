'use client';

import { cn } from '@/lib/utils';

interface EmojiCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Number badge for priority ordering (1-based) */
  numberBadge?: number;
  className?: string;
}

export function EmojiCard({
  emoji,
  label,
  selected,
  onClick,
  numberBadge,
  className,
}: EmojiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-[var(--space-2)]',
        'rounded-[var(--radius-s7-xl)] p-[var(--space-4)] transition-all duration-200 ease-out',
        'min-h-[120px] min-w-[100px]',
        selected
          ? 'scale-[1.02] border-2 border-[var(--color-primary)] bg-[var(--color-brand-50)] shadow-[var(--shadow-s7-sm)]'
          : 'border border-transparent bg-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-200)]',
        className,
      )}
    >
      {/* Check badge (top-right) */}
      {selected && !numberBadge && (
        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] text-white">
          ✓
        </span>
      )}

      {/* Number badge (top-right) for priority ordering */}
      {numberBadge != null && numberBadge > 0 && (
        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
          {numberBadge}
        </span>
      )}

      <span
        className={cn(
          'text-[48px] leading-none transition-transform duration-200',
          selected ? 'scale-105' : 'scale-100',
        )}
        aria-hidden="true"
      >
        {emoji}
      </span>

      <span
        className={cn(
          'text-[length:var(--text-body-sm)] font-medium',
          selected ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]',
        )}
      >
        {label}
      </span>
    </button>
  );
}
