'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmojiCardProps {
  /** Native emoji string (fallback) */
  emoji?: string;
  /** Lucide icon or custom ReactNode (preferred over emoji) */
  icon?: ReactNode;
  label: string;
  /** Optional description text below the label */
  description?: string;
  selected: boolean;
  onClick: () => void;
  /** Number badge for priority ordering (1-based) */
  numberBadge?: number;
  /** Accessibility: use role="radio" for single-select mode */
  role?: 'radio';
  /** Accessibility: aria-checked for radio role */
  ariaChecked?: boolean;
  /** Accessibility: aria-pressed for multi-select toggle */
  ariaPressed?: boolean;
  /** Accessibility: disabled state (e.g. max selections reached) */
  disabled?: boolean;
  className?: string;
}

export function EmojiCard({
  emoji,
  icon,
  label,
  description,
  selected,
  onClick,
  numberBadge,
  role,
  ariaChecked,
  ariaPressed,
  disabled,
  className,
}: EmojiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={role}
      aria-checked={role === 'radio' ? ariaChecked : undefined}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || undefined}
      data-selected={selected || undefined}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-[var(--space-2)]',
        'rounded-[var(--radius-s7-xl)] p-[var(--space-3)] transition-all duration-200 ease-out',
        'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)]/50 focus-visible:outline-none',
        'min-h-[100px] min-w-[80px]',
        selected
          ? 'border-2 border-[var(--color-neutral-700)] bg-[var(--color-surface)] shadow-[var(--shadow-s7-sm)]'
          : 'border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)]',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {/* Check badge */}
      {selected && !numberBadge && (
        <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-[10px] text-white">
          ✓
        </span>
      )}

      {/* Number badge for priority ordering */}
      {numberBadge != null && numberBadge > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-[10px] font-bold text-white">
          {numberBadge}
        </span>
      )}

      {/* Icon or emoji */}
      <div
        className={cn(
          'flex items-center justify-center transition-transform duration-200',
          selected ? 'scale-105' : 'scale-100',
        )}
        aria-hidden="true"
      >
        {icon ?? (
          <span className="text-[40px] leading-none">{emoji}</span>
        )}
      </div>

      <span
        className={cn(
          'text-[length:var(--text-body-sm)] font-medium',
          selected ? 'font-semibold text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface)]',
        )}
      >
        {label}
      </span>

      {description && (
        <span className="text-center text-[length:var(--text-caption)] leading-snug text-[var(--color-on-surface-muted)]">
          {description}
        </span>
      )}
    </button>
  );
}
